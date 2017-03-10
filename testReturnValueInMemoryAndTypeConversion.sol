contract testReturnValueInMemoryAndTypeConversion {
    /*
    Returned value will be stored at memory starting from 0x60, 32 bytes each.
    If value return in byte format, it will be padded with 0 to its right.
    If value return in integer/address format, it will be padded with 0 to its left.
    */
    function returnUintInUint256(address addr) constant returns(uint memx60) {
        ReturnContract(addr).returnInUint();
        assembly {
            memx60 := mload(0x60)
            //which will be 338770000845734292517272035000332377840 in decimal and 0xfedcba9876543210123456789abcdef0 in hex
        }
    }
    function returnUintInUint64(address addr) constant returns(uint64 memx60) {
        ReturnContract(addr).returnInUint();
        assembly {
            memx60 := mload(0x60)
            //which will be 1311768467463790320 in decimal and 0x123456789abcdef0 in hex
            //left-half in hex is cut off because it's only 64 bits long
        }
    }
    function returnUintInBytes16(address addr) constant returns(bytes16 memx60) {
        ReturnContract(addr).returnInUint();
        assembly {
            memx60 := mload(0x60)
            //returned value is 0x00000000000000000000000000000000fedcba9876543210123456789abcdef0
            //but memx60 will be 0x00000000000000000000000000000000 because it's only 16 bytes long
            //right-half in hex is cut off
        }
    }
    
    
    function returnBytesInBytes(address addr) constant returns(bytes32 memx60) {
        ReturnContract(addr).returnInBytes();
        assembly {
            memx60 := mload(0x60)
            //which will be 0x0000000000000001000000000000000200000000000000030000000000000004
        }
    }
    function returnBytesInUint(address addr) constant returns(uint memx60) {
        ReturnContract(addr).returnInBytes();
        assembly {
            memx60 := mload(0x60)
            //which will be 6277101735386680764516354157049543343084444891548699590660 in decimal
            //and 0x0000000000000001000000000000000200000000000000030000000000000004 in hex
        }
    }
    function returnBytesInUint128(address addr) constant returns(uint128 memx60) {
        ReturnContract(addr).returnInBytes();
        assembly {
            memx60 := mload(0x60)
            //returned value is 0x0000000000000001000000000000000200000000000000030000000000000004
            //but memx60 will be 00000000000000030000000000000004 in hex and 55340232221128654852 in decimal
            // because it's only 128 bits long and the left-half is cut off
        }
    }
}

contract ReturnContract {
    function returnInBytes() constant returns(bytes32) {
        return (0x0000000000000001000000000000000200000000000000030000000000000004);
    }
    function returnInUint() constant returns(uint) {
        return (338770000845734292517272035000332377840);
        //which in hex: 0xfedcba9876543210123456789abcdef0
    }
}