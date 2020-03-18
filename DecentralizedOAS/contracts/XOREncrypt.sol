pragma solidity ^0.5.15;

import "./SafeMath.sol";

contract XOREncrypt {
    // function encrypt(bytes32 key, bytes32 pText) public pure returns(bytes32 cText) {
    //     cText = bytes32(uint256(key) ^ uint256(pText));
    // }

    function encrypt(bytes32 key, bytes32 pText) public pure returns(uint256 cText) {
        cText = uint256(key) ^ uint256(pText);
    }

    // function decrypt(bytes32 key, bytes32 cText) public pure returns(bytes32 pText) {
    //     pText = bytes32(uint256(key) ^ uint256(cText));
    // }

    function decrypt(bytes32 key, bytes32 cText) public pure returns(uint256 pText) {
        pText = uint256(key) ^ uint256(cText);
    }
}
