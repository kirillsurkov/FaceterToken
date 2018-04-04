pragma solidity 0.4.20;

contract ERC20Interface {
	function balanceOf(address _owner) public view returns (uint256 balance);
	function transfer(address _to, uint256 _value) public returns (bool success);
}

contract FaceterTokenLockV2 {
	uint constant AMOUNT = 18750000 * 10**18;
	address buffer;
	ERC20Interface FaceterToken;
	uint8 public unlockStep;

	function FaceterTokenLockV2(address _buffer) public {
		buffer = _buffer;
		FaceterToken = ERC20Interface(msg.sender);
	}

	function unlock() public {
		uint unlockAmount = 0;
		// 1 July 2018
		if (unlockStep == 0 && now >= 1530403200) {
			unlockAmount = AMOUNT;
		// 1 October 2018
		} else if (unlockStep == 1 && now >= 1538352000) {
			unlockAmount = AMOUNT;
		// 1 January 2019
		} else if (unlockStep == 2 && now >= 1546300800) {
			unlockAmount = AMOUNT;
		// 1 April 2019
		} else if (unlockStep == 3 && now >= 1554076800) {
			unlockAmount = AMOUNT;
		// 1 July 2019
		} else if (unlockStep == 4 && now >= 1561939200) {
			unlockAmount = AMOUNT;
		// 1 October 2019
		} else if (unlockStep == 5 && now >= 1569888000) {
			unlockAmount = AMOUNT;
		// 1 January 2020
		} else if (unlockStep == 6 && now >= 1577836800) {
			unlockAmount = AMOUNT;
		// 1 April 2020
		} else if (unlockStep == 7 && now >= 1585699200) {
			unlockAmount = FaceterToken.balanceOf(this);
		}
		require(unlockAmount != 0);
		unlockStep++;
		require(FaceterToken.transfer(buffer, unlockAmount));
	}

	function () public {
		unlock();
	}

	function recoverTokens(ERC20Interface _token) public returns(bool) {
		// Don't allow recovering Faceter Token till the end of lock.
		if (_token == FaceterToken && now < 1585699200 && unlockStep != 8) {
			return false;
		}
		return _token.transfer(buffer, _token.balanceOf(this));
	}
}
