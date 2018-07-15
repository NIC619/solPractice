pragma solidity ^0.4.20;
// Contract that throws when token contract calls 'tokenFallback'
// function on it.
contract ErrorFallbackReceiver {
    function () {
        assert(false);
    }
}
