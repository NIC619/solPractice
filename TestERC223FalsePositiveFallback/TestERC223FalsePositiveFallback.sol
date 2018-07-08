pragma solidity ^0.4.20;
contract Receiver {
    event Received(uint amount);
    bytes32 constant MAGIC_NUMBER = keccak256("MAGIC_NUMBER");

    function tokenFallback(uint amount) returns (bytes32) {
        Received(amount);
        return(MAGIC_NUMBER);
    }
}

// Token Contract that does not check returned execution result.
contract TokenContractDontCheckMagicNumber {
    function transfer(address addr, uint amount) {
        Receiver receiver = Receiver(addr);
        receiver.tokenFallback(amount);
    }
}

// Contract that does not have fallback function will revert when
// token contract calls 'tokenFallback' function on it.
contract NoFallback {
    uint public a;
    
    function seta(uint x) {
        a = x;
    }
}

// Contract that throws when token contract calls 'tokenFallback'
// function on it.
contract ErrorFallback {
    function () {
        assert(false);
    }
}

// Contract that has fallback function and results in false positive
// execution result.  When token contract that does not check execution
// result calls this contract, it will execute successfully and accepts
// the tokens.
contract FalsePositiveFallback {
    function () {
    }
}

// Token contract that checks the returned execution result.
contract TokenContractCheckMagicNumber {
    bytes32 constant MAGIC_NUMBER = keccak256("MAGIC_NUMBER");

    function transfer(address addr, uint amount) {
        Receiver receiver = Receiver(addr);
        require(MAGIC_NUMBER == receiver.tokenFallback(amount));
    }
}
