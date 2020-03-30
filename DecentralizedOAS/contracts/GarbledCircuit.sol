pragma solidity ^0.5.15;
pragma experimental ABIEncoderV2;

import "./SafeMath.sol";

contract GarbledCircuit {
    using SafeMath for uint256;

    struct GarbledTruthTable {
        mapping(uint256 => bytes32) entry;
    }

    mapping(uint256 => GarbledTruthTable) circuit;

    struct BitResult {
        bytes32 bit_zero;
        bytes32 bit_one;
    }

    function read_gtt(uint256 index) public view returns(bytes32[4] memory gtt) {
        gtt[0] = circuit[index].entry[0];
        gtt[1] = circuit[index].entry[1];
        gtt[2] = circuit[index].entry[2];
        gtt[3] = circuit[index].entry[3];
    }

    function encrypt(bytes32 key, bytes32 pText) public pure returns(uint256 cText) {
        cText = uint256(key) ^ uint256(pText);
    }

    function deploy(uint256 num_bits, bytes32[][4] memory all_table_entries, bytes32[] memory bit_results) public {
        require(num_bits > 0, "Invalid number of bits for the circuit.");

        for(uint256 i = 0; i < all_table_entries.length; i++) {
            circuit[i].entry[0] = all_table_entries[i][0];
            circuit[i].entry[1] = all_table_entries[i][1];
            circuit[i].entry[2] = all_table_entries[i][2];
            circuit[i].entry[3] = all_table_entries[i][3];
        }
    }
}
