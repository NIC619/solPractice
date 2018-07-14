pragma solidity ^0.4.20;
// Contract that does not have fallback function will revert when
// token contract calls 'tokenFallback' function on it.
contract NoFallback {
    uint public a;
    
    function seta(uint x) {
        a = x;
    }
}
