const HDWalletProvider = require('truffle-hdwallet-provider');
const mnemonic = 'melt input remember skill want spatial tower lunar glory left check evolve';

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      gas: 9999999
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/v3/1b30c349d8ef4dfe85d5d493e8e4a2e4')
      },
      // gas: 7500000,
      // gasPrice: 10000000000,
      network_id: 4,
    },
  },
  compilers: {
    solc: {
      version: "0.5.0"
    }
  }
};
