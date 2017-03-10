pragma solidity ^0.4.4;
contract Dispatcher {
    mapping(bytes4=>uint32) returnSizes;
    int z;
    address upgradeContract;
    address public dispatcherContract;

    function replace(address newUpgradeContract) {
        upgradeContract = newUpgradeContract;
        upgradeContract.delegatecall(bytes4(sha3("initialize()")));
    }

    function() {
        bytes4 sig;
        assembly { sig := calldataload(0) }
        var len = returnSizes[sig];
        var target = upgradeContract;
        
        assembly {
            calldatacopy(mload(0x40), 0x0, calldatasize)
            delegatecall(sub(gas, 10000), target, mload(0x40), calldatasize, mload(0x40), len)
            return(mload(0x40), len)
        }
    }
}

contract Upgrade {
    mapping(bytes4=>uint32) returnSizes;
    int z;
    
    function initialize() {
        returnSizes[bytes4(sha3("get()"))] = 32;
    }
    
    function plus(int _x, int _y) {
        z = _x + _y;
    }
    function get() returns(int) {
        return z;
    }
}

contract Main {  //
    mapping(bytes4=>uint32) public returnSizes;
    int public z;
    address public upgradeContract;
    address public dispatcherContract;
    
    function deployDispatcher() {
        dispatcherContract = new Dispatcher();
    }
    
    function updateUpgrade(address newUpgradeContract) {
        dispatcherContract.delegatecall(bytes4( sha3("replace(address)")), newUpgradeContract);
    }
    
    function delegateCall(bytes4 _sig, int _x, int _y) {
        dispatcherContract.delegatecall(_sig, _x, _y);
    }
    
    function get() constant returns(int output){
        dispatcherContract.delegatecall(bytes4( sha3("get()")));
        assembly {
            output := mload(0x60)
        }
    }
}