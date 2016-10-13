contract ecrecoverTest{
    
    /*
    
    (in geth javascript console) say someone signs a hash of a message with his address, like this
    eth.sign("hisAddress", web3.sha3("someMessage"))
    then you can check if he indeed sign the message(actually, the hash) with his address by providing
    both hash and signature to ecrecover function
    
    1. hsh is the hash of message
    2. r is the first 32 bytes of signature
    3. s is the next 32 bytes
    4. v is the last 2 bytes, but note that v would be either 0x00 or 0x01,
       remember to convert it to decimal and add 27 (so v is either 27 or 28)
    Finally, ecrecover will produce an address (or 0 if error),
    then compare it with the address you were checking
    
    */
    function checkEC2(bytes32 _hsh, uint8 _v, bytes32 _r, bytes32 _s) returns(address){
        return ecrecover(_hsh, _v, _r, _s);
    }
}
