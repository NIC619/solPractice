pragma solidity ^0.4.4;
library Upgrade {
    struct Data{
        int z;
    }
    
    function plus(Data storage self, int _x, int _y) {
        self.z = _x + _y;
    }
    function get(Data storage self) returns(int) {
        return self.z;
    }
}
contract DispatcherStorage {
    address public addrUpgrade;
    mapping(bytes4 => uint32) public sizes;
    
    function DispatcherStorage(address newUpgrade) {
        sizes[bytes4(sha3("get(Upgrade.Data storage)"))] = 32;
        replace(newUpgrade);
    }
    
    function replace(address newUpgrade) {
        addrUpgrade = newUpgrade;
    }
}
contract Dispatcher {

    function() {
        DispatcherStorage dispatcherStorage = DispatcherStorage(0xc8e2211a1241dc1906bc1eee85b1807fd4c820e4);
        uint32 len = dispatcherStorage.sizes(msg.sig);
        address target = dispatcherStorage.addrUpgrade();
        
        assembly {
            calldatacopy(mload(0x40), 0x0, calldatasize)
            delegatecall(sub(gas, 10000), target, mload(0x40),
                         calldatasize, mload(0x40), len)
            return(mload(0x40), len)
        }
    }
}
contract Main {
    using Upgrade for Upgrade.Data;
    Upgrade.Data data;
    
    function plus(int _x, int _y) {
        data.plus(_x, _y);
    }
    
    function get() constant returns(int output){
        data.get();
        assembly {
            output := mload(0x60)
        }
    }
}