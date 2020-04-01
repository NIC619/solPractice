pragma solidity ^0.5.15;
pragma experimental ABIEncoderV2;

import "./SafeMath.sol";

contract GarbledCircuit {
    using SafeMath for uint256;

    struct GarbledTruthTable {
        mapping(uint256 => bytes32) entry;
    }

    uint256 public num_input_bits;
    mapping(uint256 => GarbledTruthTable) circuit;
    mapping(uint256 => CachedInput) inputs_of_gate;
    mapping(uint256 => bytes32) public bit_results;

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

    function deploy(
        uint256 _num_input_bits,
        bytes32[] memory _inputs_of_gate,
        bytes32[4][] memory all_table_entries,
        bytes32[] memory _bit_results) public {
        require(_num_input_bits > 0, "Invalid number of bits for the circuit.");
        require(_inputs_of_gate.length == _num_input_bits, "Mismatched number of inputs.");
        require(all_table_entries.length == 2 * _num_input_bits - 1, "Mismatched number of tables.");
        num_input_bits = _num_input_bits;

        uint256 start_index = num_input_bits - 1;
        for(uint256 i = 0; i < _inputs_of_gate.length; i++) {
            inputs_of_gate[start_index + i].y = _inputs_of_gate[i];
        }
        for(uint256 i = 0; i < all_table_entries.length; i++) {
            circuit[i].entry[0] = all_table_entries[i][0];
            circuit[i].entry[1] = all_table_entries[i][1];
            circuit[i].entry[2] = all_table_entries[i][2];
            circuit[i].entry[3] = all_table_entries[i][3];
        }
        for(uint256 i = 0; i < _bit_results.length; i++) {
            bit_results[i] = _bit_results[i];
        }
    }
}
