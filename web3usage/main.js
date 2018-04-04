const fs = require("fs");
const Web3 = require("web3");

async function main(contractAddress, bufferKey, customerKey) {
	const web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io"));
	const contract = new web3.eth.Contract(JSON.parse(fs.readFileSync("abi.json", "utf-8")), contractAddress);
	const decimals = await contract.methods.decimals().call();
	const symbol = await contract.methods.symbol().call();
	web3.eth.accounts.wallet.add(bufferKey);
	web3.eth.accounts.wallet.add(customerKey);
	let holder = await contract.methods.holder().call();
	let buffer = web3.eth.accounts.wallet[0];
	let customer = web3.eth.accounts.wallet[1];
	let toNumber = value => (value.slice(0, value.length-decimals) || "0") + "." + value.slice(value.length-decimals);
	let example = {
		sendFromBuffer: async (to, amount) => {
			console.log("sending " + toNumber(amount) + " " + symbol + " from buffer to '" + to + "'");
			return new Promise(next =>
				contract.methods.transfer(to, amount).send({from: buffer.address, gas: 300000}).on("receipt", tx => next(tx.transactionHash))
			);
		},
		getTransactionInfo: async hash => {
			let tx = await web3.eth.getTransaction(hash);
			let receipt = await web3.eth.getTransactionReceipt(hash);
			return {transaction: tx, receipt: receipt};
		},
		getHolderTokens: async () => {
			return toNumber(await contract.methods.balanceOf(holder).call());
		},
		getBufferTokens: async () => {
			return toNumber(await contract.methods.balanceOf(buffer.address).call());
		},
		burnTokens: (from, amount) => {
			console.log("burning " + toNumber(amount) + " " + symbol + " from '" + from + "'");
			return new Promise(next =>
				contract.methods.burn(amount).send({from: from, gas: 300000}).on("receipt", tx => next(tx.transactionHash))
			);
		}
	};

	console.log("contract: " + contractAddress);
	console.log("holder: " + holder);
	console.log("buffer: " + buffer.address);
	console.log();

	let bufferTokens = await example.getBufferTokens();
	console.log("holder tokens: " + await example.getHolderTokens());
	console.log("buffer tokens: " + bufferTokens);
	console.log();

	if (bufferTokens > 0) {
		console.log("tx hash: " + await example.sendFromBuffer(customer.address, "50000000000000000000") + "\n");

		let txHash = await example.burnTokens(customer.address, "25000000000000000000");
		console.log("tx hash: " + txHash);

		let txInfo = await example.getTransactionInfo(txHash);
		console.log("tx info: ");
		console.log(txInfo.transaction);
		console.log("tx receipt: ");
		console.log(txInfo.receipt);
	} else console.log("can't proceed with empty buffer");
}

const contractAddress = "0x5964010b17ef7c3324887d4b951abbea18667c3c"; // contract address
const bufferKey = "0xce2eab5......."; // private key of buffer used in contract constructor
const customerKey = "0x46c36f1......."; // private key of customer for tests
main(contractAddress, bufferKey, customerKey);
