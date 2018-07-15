pragma solidity ^0.4.20;
// Contract that has fallback function and results in false positive
// execution result.  When token contract that does not check execution
// result calls this contract, it will execute successfully and accepts
// the tokens.
contract FalsePositiveFallbackReceiver {
    function () {
    }
}
