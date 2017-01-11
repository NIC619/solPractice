pragma solidity ^0.4.2;
contract C {
    string public s = '三個字';    //this sentence actually takes 9 bytes
    
    function getlength() constant returns(uint){
        return bytes(s).length;
    }
    
    function getbyte(uint i) constant returns(byte){
        return bytes(s)[i];
    }

    function setbyte(uint i, byte c) {  //if your modify specific byte, it will result in a different word
        bytes(s)[i] = c;
    }
}