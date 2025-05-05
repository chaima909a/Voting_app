module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost
      port: 7545,            // Port de Ganache
      network_id: "*",       // Correspond à n'importe quel id
    },
  },
  compilers: {
    solc: {
      version: "0.8.0",      // Vérifie que c’est bien la version que tu utilises
    },
  },
};
