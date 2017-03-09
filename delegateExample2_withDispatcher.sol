pragma solidity ^0.4.4;
contract Dispatcher {
    mapping(bytes4=>uint32) returnSizes;
    int z;
    address upgradeContract;

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
            calldatacopy(0x0, 0x0, calldatasize)
            delegatecall(sub(gas, 10000), target, 0x0, calldatasize, 0, len)
            return(0, len)
        }
    }
}

contract Upgrade { 
    mapping(bytes4=>uint32) returnSizes;
    int z;
    
    function initialize() {
        returnSizes[bytes4(sha3("plus(int256,int256)"))] = 32;
    }
    
    function plus(int _x, int _y) {
        z = _x + _y;
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
}