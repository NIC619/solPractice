pragma solidity ^0.5.15;
pragma experimental ABIEncoderV2;

import "./SafeMath.sol";

contract GarbledCircuit {
    using SafeMath for uint256;

    struct GarbledTruthTable {
        mapping(uint256 => bytes32) entry;
        bytes32 input_x;
        bytes32 input_y;
    }

    uint256 public num_input_bits;
    uint256 public num_result_bits;
    bool[] public decrpytion_result;
    mapping(uint256 => GarbledTruthTable) circuit;
    mapping(uint256 => BitResult) bit_results;

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

    function read_inputs_of_table(uint256 table) public view returns(bytes32[2] memory inputs) {
        inputs[0] = circuit[table].input_x;
        inputs[1] = circuit[table].input_y;
    }

    function read_bit_results(uint256 result_index) public view returns(bytes32[2] memory results) {
        results[0] = bit_results[result_index].bit_zero;
        results[1] = bit_results[result_index].bit_one;
    }

    function decrypt(bytes32[] memory garbled_inputs, uint256[] memory entries_chosen) public {
        require(garbled_inputs.length == num_input_bits, "Mismatched number of garbled inputs.");
        uint256 num_tables = 2 * num_input_bits - 1;
        require(entries_chosen.length == num_tables, "Mismatched number of chosen entries(should match the number of tables).");

        // Fill in the given inputs to cached inputs
        uint256 start_index = num_input_bits - 1;
        for(uint256 i = 0; i < num_input_bits; i++) {
            circuit[start_index + i].input_x = garbled_inputs[i];
        }

        bytes32 entry;
        uint256 result;
        uint256 parent_table_index;
        for(uint256 i = num_tables - 1; i > 0; i--) {
            entry = circuit[i].entry[entries_chosen[i]];
            result = uint256(entry) ^ uint256(circuit[i].input_x) ^ uint256(circuit[i].input_y);
            parent_table_index = (i - 1) / 2;
            if(i % 2 == 1) {
                circuit[parent_table_index].input_x = bytes32(result);
            } else {
                circuit[parent_table_index].input_y = bytes32(result);
            }
        }
        // Compute result, i.e., result of table 0
        require(circuit[0].input_x != bytes32(0) && circuit[0].input_y != bytes32(0), "Missing inputs to final table.");
        entry = circuit[0].entry[entries_chosen[0]];
        result = uint256(entry) ^ uint256(circuit[0].input_x) ^ uint256(circuit[0].input_y);

        // Compare results against results table
        for(uint256 i = 0; i < num_result_bits; i++) {
            if(result == uint256(bit_results[i].bit_zero)) {
                decrpytion_result[i] = false;
            } else if(result == uint256(bit_results[i].bit_one)) {
                decrpytion_result[i] = true;
            } else {
                revert("Incorrect result.");
            }
        }
    }

    function deploy(
        uint256 _num_input_bits,
        bytes32[] memory _inputs_of_table,
        bytes32[4][] memory all_table_entries,
        bytes32[] memory _bit_results) public {
        require(_num_input_bits > 0, "Invalid number of bits for the circuit.");
        require(_inputs_of_table.length == _num_input_bits, "Mismatched number of inputs.");
        require(all_table_entries.length == 2 * _num_input_bits - 1, "Mismatched number of tables.");
        num_input_bits = _num_input_bits;

        uint256 start_index = num_input_bits - 1;
        for(uint256 i = 0; i < _inputs_of_table.length; i++) {
            circuit[start_index + i].input_y = _inputs_of_table[i];
        }
        for(uint256 i = 0; i < all_table_entries.length; i++) {
            circuit[i].entry[0] = all_table_entries[i][0];
            circuit[i].entry[1] = all_table_entries[i][1];
            circuit[i].entry[2] = all_table_entries[i][2];
            circuit[i].entry[3] = all_table_entries[i][3];
        }
        num_result_bits = _bit_results.length / 2;
        for(uint256 i = 0; i < _bit_results.length; i = i + 2) {
            bit_results[i / 2].bit_zero = _bit_results[i];
            bit_results[i / 2].bit_one = _bit_results[i + 1];
        }
        decrpytion_result = new bool[](num_result_bits);
    }
}
