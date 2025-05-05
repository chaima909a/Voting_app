const Voting = artifacts.require("Voting");

module.exports = function (deployer) {
  const candidates = ["Mariem", "Chaima", "Wiem"];
  deployer.deploy(Voting, candidates).then(() => {
    console.log("✅ Voting contract deployed with candidates:", candidates);
  }).catch((err) => {
    console.error("❌ Erreur de déploiement du contrat Voting:", err);
  });
};
