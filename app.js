let contract;
let accounts;

const contractAddress = "0x40d7676cA16Cc46Fb20ed3B4eDc9B9B8D5DCCfe0";
const contractABI = [
  {
    "inputs": [
      {
        "internalType": "string[]",
        "name": "_candidateNames",
        "type": "string[]"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "admin",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "candidates",
    "outputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "uint256", "name": "voteCount", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "hasVotedByAddress",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "getCandidates",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "uint256", "name": "voteCount", "type": "uint256" }
        ],
        "internalType": "struct Voting.Candidate[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "candidateIndex", "type": "uint256" }],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getWinner",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [{ "internalType": "address", "name": "voter", "type": "address" }],
    "name": "hasVoted",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "getAdmin",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  }
];

// Chargement au démarrage
window.addEventListener("load", async () => {
  if (typeof window.ethereum !== 'undefined' || typeof window.web3 !== 'undefined') {
    try {
      console.log("MetaMask détecté.");
      window.web3 = new Web3(window.ethereum || window.web3.currentProvider);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      accounts = await web3.eth.getAccounts();
      console.log("Comptes :", accounts);

      if (contractAddress && contractABI) {
        console.log("Initialisation du contrat...");
        contract = new web3.eth.Contract(contractABI, contractAddress);
        console.log("Contrat initialisé :", contract);

        await loadCandidates();
        await displayResults();
        await getWinner();
      } else {
        alert("❌ Adresse ou ABI du contrat manquante.");
      }
    } catch (error) {
      console.error("Erreur MetaMask :", error);
      if (error.code === 4001) {
        alert("⛔ Autorisation refusée.");
      } else {
        alert("❌ Erreur : " + error.message);
      }
    }
  } else {
    alert("🦊 Installez MetaMask pour continuer.");
  }
});

// Gestion des changements de compte
window.ethereum.on('accountsChanged', async (accounts) => {
  console.log('Compte changé:', accounts);
  await loadCandidates();
  await displayResults();
  await getWinner();
});

// Gestion des changements de réseau
window.ethereum.on('chainChanged', async (chainId) => {
  console.log('Réseau changé:', chainId);
  await loadCandidates();
  await displayResults();
  await getWinner();
});

// Connexion manuelle via bouton
async function connectWallet() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      accounts = await web3.eth.getAccounts();
      alert("🔌 Portefeuille connecté.");
    } catch (error) {
      alert("❌ Impossible de se connecter.");
    }
  } else {
    alert("🦊 MetaMask requis.");
  }
}

// Chargement des candidats
async function loadCandidates() {
  const loadingText = document.getElementById("loading");
  const select = document.getElementById("candidates");
  const voteButton = document.getElementById("voteButton");

  if (!loadingText || !select || !voteButton) {
    console.error("Éléments DOM manquants.");
    return;
  }

  try {
    loadingText.innerText = "Chargement des candidats...";
    if (contract) {
      const candidates = await contract.methods.getCandidates().call();
      console.log("Candidats :", candidates);

      select.innerHTML = "";

      if (candidates.length > 0) {
        candidates.forEach((candidate, index) => {
          const option = document.createElement("option");
          option.value = index;
          option.text = candidate.name;
          select.appendChild(option);
        });

        const hasAlreadyVoted = await contract.methods.hasVoted(accounts[0]).call();
        voteButton.disabled = hasAlreadyVoted;
        loadingText.innerText = hasAlreadyVoted ? "🛑 Vous avez déjà voté." : "";
      } else {
        select.innerHTML = "<option>Aucun candidat</option>";
        loadingText.innerText = "Aucun candidat trouvé.";
      }
    } else {
      throw new Error("Contrat non initialisé.");
    }
  } catch (error) {
    loadingText.innerText = `❌ Erreur : ${error.message}`;
  }
}

// Affichage des résultats
async function displayResults() {
  const resultsContainer = document.getElementById("results");
  
  if (!resultsContainer) {
    console.error("Élément résultats non trouvé.");
    return;
  }

  try {
    if (contract) {
      const candidates = await contract.methods.getCandidates().call();
      resultsContainer.innerHTML = "";

      candidates.forEach(candidate => {
        const li = document.createElement("li");
        li.innerText = `${candidate.name} : ${candidate.voteCount} votes`;
        resultsContainer.appendChild(li);
      });
    } else {
      resultsContainer.innerText = "Erreur : contrat non initialisé.";
    }
  } catch (error) {
    resultsContainer.innerText = "❌ Erreur affichage résultats : " + error.message;
  }
}
async function vote() {
  const candidatChoisi = document.getElementById("candidates").value;
  
  try {
    const hasAlreadyVoted = await contract.methods.hasVoted(accounts[0]).call();
    if (hasAlreadyVoted) {
      alert("🛑 Vous avez déjà voté !");
      return; // On arrête ici pour éviter d'envoyer un nouveau vote
    }

    await contract.methods.vote(candidatChoisi).send({ from: accounts[0] });
    alert("✅ Votre vote pour " + candidatChoisi + " a été envoyé à la blockchain !");
    
    // Après avoir voté, on désactive le bouton pour empêcher de revoter
    document.getElementById("voteButton").disabled = true;
    document.getElementById("loading").innerText = "🛑 Vous avez déjà voté.";

    // Mettre à jour les résultats après le vote
    await displayResults();
    await getWinner();

  } catch (error) {
    console.error(error);
    alert("❌ Erreur lors de l'envoi du vote.");
  }
}

// Récupération du gagnant
async function getWinner() {
  const winnerElement = document.getElementById("winner");

  if (!winnerElement) {
    console.error("Élément gagnant non trouvé.");
    return;
  }

  if (!contract) {
    winnerElement.innerText = "Erreur : contrat non initialisé.";
    return;
  }

  try {
    const candidates = await contract.methods.getCandidates().call();

    if (candidates.length === 0) {
      winnerElement.innerText = "Aucun candidat.";
      return;
    }

    let winnerIndex = 0;
    let maxVotes = 0;

    candidates.forEach((candidate, index) => {
      if (candidate.voteCount > maxVotes) {
        maxVotes = candidate.voteCount;
        winnerIndex = index;
      }
    });

    const winnerCandidate = candidates[winnerIndex];
    winnerElement.innerText = `🏆 Gagnant : ${winnerCandidate.name} (${winnerCandidate.voteCount} votes)`;

  } catch (error) {
    console.error("Erreur récupération gagnant :", error);
    winnerElement.innerText = "❌ Erreur chargement gagnant.";
  }
}
function authenticate() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // Vérifie si le login et le mot de passe sont corrects (modifie selon tes données)
  if (username === "admin" && password === "admin123") {
    // Redirection vers la page des résultats
    window.location.href = "resultat.html";
  } else {
    // Affiche un message d'erreur si les identifiants sont incorrects
    document.getElementById("authError").style.display = 'block';
  }
}
function showAuthForm() {
  document.getElementById("authForm").style.display = 'block';
}
