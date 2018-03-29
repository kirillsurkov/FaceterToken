const HDWalletProvider = require("truffle-hdwallet-provider");
const key = ["ce2eab5......."];

module.exports = {
    networks: {
        ropsten: {
            provider: () => new HDWalletProvider(key, "https://ropsten.infura.io"),
            network_id: 3,
            gas: 4500000,
            gasPrice: 40000000000
        }
    },
    network: "ropsten",
    solc: {
        optimizer: {
            enabled: true,
            runs: 200
        }
    }
};
