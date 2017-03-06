pragma solidity ^0.4.4;

contract simpleToken {
	mapping (address => uint) balances;
	address owner;

	modifier onlyowner {
		if(msg.sender == owner){
			_;
		}
	}

	function simpleToken() {
		owner = msg.sender;
	}

	function allocate(address user, uint amount) onlyowner {
		balances[user] += amount;
	}

	function consume(uint amount) returns(bool sufficient) {
		if (balances[msg.sender] < amount) return false;
		balances[msg.sender] -= amount;
		return true;
	}

	function getBalance(address addr) constant returns(uint) {
		return balances[addr];
	}
}
