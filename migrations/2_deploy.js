let FaceterToken = artifacts.require("./FaceterToken.sol");

module.exports = (deployer, network, accounts) => {
	let buffer = accounts[0];
	deployer.deploy(FaceterToken, buffer);
};
