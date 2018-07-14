pragma solidity ^0.4.20;

import "./NormalReceiver.sol";

// Token Contract that does not check returned execution result.
contract TokenContractDontCheckMagicNumber {
    mapping (address => uint) balances;

    function getBalance(address addr) public view returns(uint) {
		return balances[addr];
	}

    function transfer(address to, uint amount) {
        balances[to] += amount;
        NormalReceiver receiver = NormalReceiver(to);
        receiver.tokenFallback(amount);
    }
}
