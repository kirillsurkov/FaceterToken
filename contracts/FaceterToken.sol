pragma solidity 0.4.20;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/token/ERC20/BurnableToken.sol";
import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "contracts/FaceterTokenLockV2.sol";

contract FaceterToken is Ownable, BurnableToken, StandardToken {
	string public constant name = "Faceter Token";
	string public constant symbol = "FACE";
	uint8 public constant decimals = 18;

	bool public paused = true;
	mapping(address => bool) public whitelist;
	FaceterTokenLockV2 public holder;

	modifier whenNotPaused() {
		require(!paused || whitelist[msg.sender]);
		_;
	}

	function FaceterToken(address buffer) public onlyOwner {
		holder = new FaceterTokenLockV2(buffer);
		address _holder = address(holder);
		Transfer(address(0), _holder, balances[_holder] = totalSupply_ = uint256(10)**(9 + decimals));
		addToWhitelist(_holder);
		addToWhitelist(buffer);
	}

	function unpause() public onlyOwner {
		paused = false;
	}

	function addToWhitelist(address addr) public onlyOwner {
		whitelist[addr] = true;
	}

	function transfer(address to, uint256 value) public whenNotPaused returns (bool) {
		return super.transfer(to, value);
	}

	function transferFrom(address from, address to, uint256 value) public whenNotPaused returns (bool) {
		return super.transferFrom(from, to, value);
	}
}
