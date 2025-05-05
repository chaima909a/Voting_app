// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    // Définition de la structure pour un candidat
    struct Candidate {
        string name;
        uint256 voteCount;
    }

    address public admin;
    mapping(address => bool) public hasVotedByAddress;  // Renommé pour éviter la collision de nom
    Candidate[] public candidates;

    // Modificateur pour restreindre l'accès uniquement à l'admin
    modifier onlyAdmin() {
        require(msg.sender == admin, "Seul l'administrateur peut effectuer cette action.");
        _;
    }

    // Constructeur du contrat, prend un tableau de noms de candidats
    constructor(string[] memory _candidateNames) {
        admin = msg.sender; // L'administrateur est celui qui déploie le contrat
        for (uint256 i = 0; i < _candidateNames.length; i++) {
            candidates.push(Candidate({
                name: _candidateNames[i],
                voteCount: 0
            }));
        }
    }

    // Fonction pour obtenir le nombre de candidats
    function getCandidates() public view returns (Candidate[] memory) {
        return candidates;
    }

    // Fonction permettant à un utilisateur de voter
    function vote(uint256 candidateIndex) public {
        require(!hasVotedByAddress[msg.sender], "Vous avez deja vote."); // Vérifie si l'utilisateur a déjà voté
        require(candidateIndex < candidates.length, "Candidat inexistant.");

        hasVotedByAddress[msg.sender] = true;
        candidates[candidateIndex].voteCount += 1;
    }

    // Fonction pour obtenir le gagnant (le candidat avec le plus de votes)
    function getWinner() public view returns (uint256) {
        uint256 winnerIndex = 0;
        uint256 maxVotes = 0;

        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i].voteCount > maxVotes) {
                maxVotes = candidates[i].voteCount;
                winnerIndex = i;
            }
        }

        return winnerIndex;
    }

    // Fonction pour vérifier si un utilisateur a déjà voté
    function hasVoted(address voter) public view returns (bool) {
        return hasVotedByAddress[voter];
    }

    // Fonction pour obtenir l'adresse de l'administrateur
    function getAdmin() public view returns (address) {
        return admin;
    }
}