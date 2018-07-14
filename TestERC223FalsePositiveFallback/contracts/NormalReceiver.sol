pragma solidity ^0.4.20;
contract NormalReceiver {
    event Received(uint amount);
    bytes32 constant MAGIC_NUMBER = keccak256("MAGIC_NUMBER");

    function tokenFallback(uint amount) returns (bytes32) {
        Received(amount);
        return(MAGIC_NUMBER);
    }
}
