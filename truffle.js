const TestRPC = require("ethereumjs-testrpc");
const HDWalletProvider = require("truffle-hdwallet-provider");
const bufferKey = ["ce2eab5......."]; // buffer private key

module.exports = {
	networks: {
		test: {
			network_id: "*",
			provider: TestRPC.provider({
				accounts: [10, 10, 10].map(balance => ({balance: balance + "0000000000000000000"})),
				time: new Date(1522454400000)
			}),
			gas: 4000000
		},
		ropsten: {
			provider: () => new HDWalletProvider(bufferKey, "https://ropsten.infura.io"),
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
