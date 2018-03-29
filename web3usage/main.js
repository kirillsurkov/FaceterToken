const fs = require("fs");
const Web3 = require("web3");

async function main(contractAddress, holderKey, bufferKey, customerKey) {
	const web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io"));
	const contract = new web3.eth.Contract(JSON.parse(fs.readFileSync("abi.js", "utf-8")), contractAddress);
	const decimals = await contract.methods.decimals().call();
	const symbol = await contract.methods.symbol().call();
	web3.eth.accounts.wallet.add(holderKey);
	web3.eth.accounts.wallet.add(bufferKey);
	web3.eth.accounts.wallet.add(customerKey);
	let holder = web3.eth.accounts.wallet[0];
	let buffer = web3.eth.accounts.wallet[1];
	let customer = web3.eth.accounts.wallet[2];
	let toNumber = value => value.slice(0, value.length-decimals) + "." + value.slice(value.length-decimals);
	let example = {
		sendToBuffer: async amount => {
			console.log("sending " + toNumber(amount) + " " + symbol + " to buffer");
			return new Promise(next =>
				contract.methods.transfer(buffer.address, amount).send({from: holder.address, gas: 300000}).on("receipt", tx => next(tx.transactionHash))
			);
		},
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
		getRemainingTokens: async () => {
			return toNumber(await contract.methods.balanceOf(holder.address).call());
		},
		burnTokens: (from, amount) => {
			console.log("burning " + toNumber(amount) + " " + symbol + " from '" + from + "'");
			return new Promise(next =>
				contract.methods.burn(amount).send({from: from, gas: 300000}).on("receipt", tx => next(tx.transactionHash))
			);
		}
	};

	console.log("contract: " + contractAddress);
	console.log("holder: " + holder.address);
	console.log("buffer: " + buffer.address);
	console.log();

	console.log("tx hash: " + await example.sendToBuffer("100000000000000000000") + "\n");
	console.log("tx hash: " + await example.sendFromBuffer(customer.address, "50000000000000000000") + "\n");

	console.log("available tokens: " + await example.getRemainingTokens() + "\n");

	let txHash = await example.burnTokens(customer.address, "25000000000000000000");
	console.log("tx hash: " + txHash);

	let txInfo = await example.getTransactionInfo(txHash);
	console.log("tx info: ");
	console.log(txInfo.transaction);
	console.log("tx receipt: ");
	console.log(txInfo.receipt);
}

const contractAddress = "0xcb38bb601f4de8e2e1a82f06d5901aeb52aec06e";
const holderKey = "0x46c36f1970dcf37ec667da8abd5288841......";
const bufferKey = "0xe8882ca8931af4adb4a0a7145e1bf094a......";
const customerKey = "0x6cfc79ba1015d03166cbae53e900c960d......";
main(contractAddress, holderKey, bufferKey, customerKey);
