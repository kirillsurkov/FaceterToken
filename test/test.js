const FaceterToken = artifacts.require("./FaceterToken.sol");
const FaceterTokenLock = artifacts.require("./FaceterTokenLockV2.sol");
const THREE_MONTHS = 7948800;

contract("FaceterToken", async accounts => {
	it("test unlock()", async () => {
		let faceterToken = await FaceterToken.deployed();
		let faceterTokenLock = FaceterTokenLock.at(await faceterToken.holder());
		let incTime = seconds => new Promise(next =>
			web3.currentProvider.sendAsync({jsonrpc: "2.0", method: "evm_increaseTime", params: [seconds], id: 0}, () =>
				web3.currentProvider.sendAsync({jsonrpc: "2.0", method: "evm_mine", id: 0}, next)
			)
		);
		let unlock = async () => {
			try {
				await faceterTokenLock.unlock();
			} catch(e) {
				return false;
			}
			return true;
		};
		for (let i = 0; i < 10; i++) {
			assert.equal(await unlock(), !(i == 0 || i == 9));
			await incTime(THREE_MONTHS);
		}
	});
	it("test whitelist", async () => {
		const buffer = accounts[0];
		const customer = accounts[1];
		const whitelisted = accounts[2];
		let faceterToken = await FaceterToken.deployed();
		let faceterTokenLock = FaceterTokenLock.at(await faceterToken.holder());
		let transfer = async from => {
			try {
				await faceterToken.transfer(buffer, 1000, {from: from});
			} catch(e) {
				return false;
			}
			return true;
		};
		let transferFrom = async from => {
			try {
				await faceterToken.transferFrom(buffer, buffer, 1000, {from: from});
			} catch(e) {
				return false;
			}
			return true;
		};
		let testWhitelist = async () => {
			let paused = await faceterToken.paused();
			assert.equal(await transfer(customer), !paused);
			assert.equal(await transferFrom(customer), !paused);
			assert.equal(await transfer(whitelisted), true);
			assert.equal(await transferFrom(whitelisted), true);
		};
		await faceterToken.addToWhitelist(whitelisted);
		await faceterToken.transfer(customer, 2000, {from: buffer});
		await faceterToken.transfer(whitelisted, 2000, {from: buffer});
		await faceterToken.approve(customer, 2000, {from: buffer});
		await faceterToken.approve(whitelisted, 2000, {from: buffer});
		await testWhitelist();
		await faceterToken.unpause();
		await testWhitelist();
	});
});
