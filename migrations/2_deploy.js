const FaceterToken = artifacts.require("./FaceterToken.sol");

module.exports = function(deployer, network, accounts) { 
	return deployer.deploy(FaceterToken, "0xfd2e3beea586657887394824afd232f4ccde47b8", "0x0ba572a76374847f89f3377d5c4c589a283af90b").then(() => {
	});
};
