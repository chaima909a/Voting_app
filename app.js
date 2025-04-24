let contract;
let accounts;

const contractAddress = "0x6d77b4653b0BC71b01e9D8EBa7d9BB1026279D69";
const contractABI = [
  {
    "inputs": [{"internalType": "string[]", "name": "_candidateNames", "type": "string[]"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "admin",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "candidates",
    "outputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "uint256", "name": "voteCount", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "hasVoted",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [{"internalType": "uint256", "name": "candidateIndex", "type": "uint256"}],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCandidates",
    "outputs": [
      {
        "components": [
          {"internalType": "string", "name": "name", "type": "string"},
          {"internalType": "uint256", "name": "voteCount", "type": "uint256"}
        ],
        "internalType": "struct Voting.Candidate[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  }
];

window.addEventListener("load", async () => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      accounts = await web3.eth.getAccounts();
      contract = new web3.eth.Contract(contractABI, contractAddress);
      loadCandidates();
    } catch (error) {
      if (error.code === 4001) {
        alert("⛔ Connexion refusée. Autorisez MetaMask pour continuer.");
      } else {
        alert("❌ Erreur lors de la connexion : " + error.message);
      }
    }
  } else {
    alert("🦊 Veuillez installer MetaMask pour utiliser cette application.");
  }
});

async function connectWallet() {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      accounts = await web3.eth.getAccounts();
      alert("✅ Connecté !");
      loadCandidates();
    } catch (error) {
      alert("❌ Connexion annulée.");
    }
  } else {
    alert("MetaMask n'est pas détecté.");
  }
}

async function loadCandidates() {
  const loadingText = document.getElementById("loading");
  const select = document.getElementById("candidates");
  const voteButton = document.getElementById("voteButton");

  try {
    loadingText.innerText = "Chargement des candidats...";
    const candidates = await contract.methods.getCandidates().call();
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
      select.innerHTML = "<option>Aucun candidat disponible</option>";
      loadingText.innerText = "Aucun candidat disponible.";
    }
  } catch (error) {
    alert("❌ Erreur lors du chargement des candidats : " + error.message);
  }
}

async function vote() {
  const index = document.getElementById("candidates").value;
  try {
    await contract.methods.vote(index).send({ from: accounts[0] });
    alert("✅ Vote enregistré !");
    loadCandidates();
  } catch (error) {
    alert("❌ Erreur : " + error.message);
  }
}

async function displayResults() {
  try {
    const candidates = await contract.methods.getCandidates().call();
    const ul = document.getElementById("results");
    ul.innerHTML = "";

    candidates.forEach(c => {
      const li = document.createElement("li");
      li.innerText = `${c.name} : ${c.voteCount} votes`;
      ul.appendChild(li);
    });
  } catch (error) {
    alert("❌ Erreur lors de l'affichage des résultats : " + error.message);
  }
}
