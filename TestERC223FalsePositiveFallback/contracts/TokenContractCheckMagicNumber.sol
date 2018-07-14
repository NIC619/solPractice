pragma solidity ^0.4.20;

import "./NormalReceiver.sol";

// Token contract that checks the returned execution result.
contract TokenContractCheckMagicNumber {
    mapping (address => uint) balances;

    bytes32 constant MAGIC_NUMBER = keccak256("MAGIC_NUMBER");

    function getBalance(address addr) public view returns(uint) {
		return balances[addr];
	}

    function transfer(address to, uint amount) {
        balances[to] += amount;
        NormalReceiver receiver = NormalReceiver(to);
        require(MAGIC_NUMBER == receiver.tokenFallback(amount));
    }
}
