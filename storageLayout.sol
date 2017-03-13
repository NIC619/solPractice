contract  StorageLayout{
    int x = -16;
    uint96 y = 0xcccccccccccccccccccccccc;
    address a = 0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa;
    bytes32 public b = 0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb;
    uint64 c1 = 0x1111111111111111;
    uint64 c2 = 0x2222222222222222;
    uint96 c3 = 0x333333333333333333333333;
    uint32 c4 = 0x44444444;
    /*
    storage layout would be like this:
    storage[0] :    fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0   <- two's complement of -16
    storage[1] :    aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaacccccccccccccccccccccccc
    storage[2] :    bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
    storage[3] :    4444444433333333333333333333333322222222222222221111111111111111
    storage[4] :    0000000000000000000000000000000000000000000000000000000000000000
    
    One slot of storage is 32 bytes. If variable is smaller than 32 bytes, it will be stored
    to the right of the slot. The next variable will fit into the remaining space if there's
    enough room left. See varaible c1-c4 and storage[3] for example.
    Modify the size of those unsigned integers and see what happende.
    */
    
    // Since size of one slot of storage is 32 bytes, we set the return type to be bytes32
    // to get the whole slot of storage.
    function getSto() constant returns(bytes32 _x, bytes32 _y, bytes32 _a, bytes32 _b, bytes32 _c) {
        assembly {
            _x := sload(0)
            _y := sload(1)
            _a := sload(2)
            _b := sload(3)
            _c := sload(4)
        }
    }

    /*
    If declared as an array, the slot will store the length of the array. The actual data 
    will be store somewhere else. Somewhere far away from the (global) variables declared.
    Storage compaction e.g.,varaible c1-c4 and storage[3], can also be seen in type 'struct' 
     */
}