pragma solidity ^0.5.15;
pragma experimental ABIEncoderV2;

import "./SafeMath.sol";

contract GarbledCircuitNoDecrypt {
    using SafeMath for uint256;

    struct GarbledTruthTable {
        uint256 num_parent_tables;
        mapping(uint256 => uint256) parent_table_indices;
        mapping(uint256 => bool) is_input_x_to_table;
        mapping(uint256 => bytes32) entry;
        bytes32 input_x;
        bytes32 input_y;
        bytes32[2] output_hash_digests;
    }

    uint256 public num_inputs;
    uint256 public num_tables;
    uint256 public num_results;
    mapping(uint256 => GarbledTruthTable) circuit;
    mapping(uint256 => BitResult) outputs;

    struct BitResult {
        bytes32 bit_zero;
        bytes32 bit_one;
    }

    struct LabelUpdate {
        bytes32 encrypted_y_0;
        bytes32 encrypted_y_1;
        bytes32 hash_digest_y_0;
        bytes32 hash_digest_y_1;
    }
    mapping(uint256 => LabelUpdate) label_updates;

    
    function read_gtt(uint256 table_index) public view returns(bytes32[4] memory gtt) {
        gtt[0] = circuit[table_index].entry[0];
        gtt[1] = circuit[table_index].entry[1];
        gtt[2] = circuit[table_index].entry[2];
        gtt[3] = circuit[table_index].entry[3];
    }

    function read_parent_table_indices(uint256 table_index) public view returns(uint256[] memory) {
        uint256 num_parent_tables = circuit[table_index].num_parent_tables;
        uint256[] memory indices = new uint256[](num_parent_tables);
        for(uint256 i = 0; i < num_parent_tables; i++) {
            indices[i] = circuit[table_index].parent_table_indices[i];
        }
        return indices;
    }

    function read_inputs_of_table(uint256 table_index) public view returns(bytes32[2] memory inputs) {
        inputs[0] = circuit[table_index].input_x;
        inputs[1] = circuit[table_index].input_y;
    }

    function read_output_hash_digests_of_table(uint256 table_index) public view returns(bytes32[2] memory _hash_digests) {
        _hash_digests[0] = circuit[table_index].output_hash_digests[0];
        _hash_digests[1] = circuit[table_index].output_hash_digests[1];
    }

    function read_outputs_of_table(uint256 table_index) public view returns(bytes32[2] memory _outputs) {
        _outputs[0] = outputs[table_index].bit_zero;
        _outputs[1] = outputs[table_index].bit_one;
    }

    function read_label_updates(uint256[] memory table_indices) public view returns(bytes32[5][] memory) {
        require(table_indices.length > 0, "No table index provided.");

        uint256 table_index;
        bytes32[5][] memory l_updates = new bytes32[5][](table_indices.length);
        for(uint256 i = 0; i < table_indices.length; i++) {
            table_index = table_indices[i];
            l_updates[i][0] = label_updates[table_index].encrypted_y_0;
            l_updates[i][1] = label_updates[table_index].encrypted_y_1;
            l_updates[i][2] = label_updates[table_index].hash_digest_y_0;
            l_updates[i][3] = label_updates[table_index].hash_digest_y_1;
        }
        return l_updates;
    }

    function initial_deploy(
        uint256 _num_inputs,
        uint256[3][] memory table_relation,
        uint256[] memory table_index_of_table_entries,
        bytes32[4][] memory all_table_entries,
        bytes32[2][] memory all_table_output_hash_digests,
        uint256[] memory table_index_of_garbled_inputs,
        bytes32[] memory garbled_inputs,
        uint256[] memory table_index_of_outputs,
        bytes32[2][] memory _outputs,
        bytes32[4][] memory _label_updates) public {
        require(_num_inputs > 0, "Invalid number of bits for the circuit.");
        require(all_table_entries.length > _num_inputs, "Number of tables should be greater than number of inputs.");
        require(all_table_entries.length == all_table_output_hash_digests.length);
        require(garbled_inputs.length == _num_inputs, "Mismatched number of inputs.");
        require(table_index_of_table_entries.length == all_table_entries.length, "Mismatch between number of table indices and number of tables");
        require(table_index_of_garbled_inputs.length == garbled_inputs.length, "Mismatch between number of table indices and number of garbled inputs");
        require(table_index_of_outputs.length == _outputs.length, "Mismatch between number of table indices and number of outputs");
        num_inputs = _num_inputs;
        num_tables = all_table_entries.length;

        uint256 table_index;
        for(uint256 i = 0; i < garbled_inputs.length; i++) {
            table_index = table_index_of_garbled_inputs[i];
            circuit[table_index].input_y = garbled_inputs[i];
        }
        uint256 num_parent_tables;
        for(uint256 i = 0; i < table_relation.length; i++) {
            table_index = table_relation[i][0];
            num_parent_tables = circuit[table_index].num_parent_tables;
            circuit[table_index].num_parent_tables = circuit[table_index].num_parent_tables.add(1);
            circuit[table_index].parent_table_indices[num_parent_tables] = table_relation[i][1];
            if(table_relation[i][2] == 1) {
                circuit[table_index].is_input_x_to_table[num_parent_tables] = true;
            } else {
                circuit[table_index].is_input_x_to_table[num_parent_tables] = false;
            }
        }
        for(uint256 i = 0; i < table_index_of_table_entries.length; i++) {
            table_index = table_index_of_table_entries[i];
            circuit[table_index].entry[0] = all_table_entries[i][0];
            circuit[table_index].entry[1] = all_table_entries[i][1];
            circuit[table_index].entry[2] = all_table_entries[i][2];
            circuit[table_index].entry[3] = all_table_entries[i][3];
            circuit[table_index].output_hash_digests[0] = all_table_output_hash_digests[i][0];
            circuit[table_index].output_hash_digests[1] = all_table_output_hash_digests[i][1];
        }
        num_results = table_index_of_outputs.length;
        for(uint256 i = 0; i < table_index_of_outputs.length; i++) {
            table_index = table_index_of_outputs[i];
            outputs[table_index].bit_zero = _outputs[i][0];
            outputs[table_index].bit_one = _outputs[i][1];
        }

        // label updates info
        upload_label_updates_info(table_index_of_garbled_inputs, _label_updates);
    }

    function upload_label_updates_info(uint256[] memory table_index_of_labels, bytes32[4][] memory _label_updates) internal {
        uint256 table_index;
        for(uint256 i = 0; i < table_index_of_labels.length; i++) {
            table_index = table_index_of_labels[i];
            label_updates[table_index].encrypted_y_0 = _label_updates[i][0];
            label_updates[table_index].encrypted_y_1 = _label_updates[i][1];
            label_updates[table_index].hash_digest_y_0 = _label_updates[i][2];
            label_updates[table_index].hash_digest_y_1 = _label_updates[i][3];
        }
    }
    
    function redeploy(
        uint256[] memory table_index_of_table_entries,
        bytes32[4][] memory all_table_entries,
        bytes32[2][] memory all_table_output_hash_digests,
        uint256[] memory table_index_of_garbled_inputs,
        bytes32[] memory garbled_inputs,
        uint256[] memory table_index_of_outputs,
        bytes32[2][] memory _outputs,
        bytes32[4][] memory _label_updates) public {
        require(garbled_inputs.length == num_inputs, "Mismatched number of inputs.");
        require(all_table_entries.length == num_tables, "Mismatched number of tables.");
        require(all_table_entries.length > num_inputs, "Number of tables should be greater than number of inputs.");
        require(all_table_entries.length == all_table_output_hash_digests.length);
        require(_outputs.length == num_results, "Mismatched number of outputs.");
        require(table_index_of_table_entries.length == all_table_entries.length, "Mismatch between number of table indices and number of tables");
        require(table_index_of_garbled_inputs.length == garbled_inputs.length, "Mismatch between number of table indices and number of garbled inputs");
        require(table_index_of_outputs.length == _outputs.length, "Mismatch between number of table indices and number of outputs");

        uint256 table_index;
        for(uint256 i = 0; i < garbled_inputs.length; i++) {
            table_index = table_index_of_garbled_inputs[i];
            circuit[table_index].input_y = garbled_inputs[i];
        }
        for(uint256 i = 0; i < table_index_of_table_entries.length; i++) {
            table_index = table_index_of_table_entries[i];
            circuit[table_index].entry[0] = all_table_entries[i][0];
            circuit[table_index].entry[1] = all_table_entries[i][1];
            circuit[table_index].entry[2] = all_table_entries[i][2];
            circuit[table_index].entry[3] = all_table_entries[i][3];
            circuit[table_index].output_hash_digests[0] = all_table_output_hash_digests[i][0];
            circuit[table_index].output_hash_digests[1] = all_table_output_hash_digests[i][1];
        }
        for(uint256 i = 0; i < table_index_of_outputs.length; i++) {
            table_index = table_index_of_outputs[i];
            outputs[table_index].bit_zero = _outputs[i][0];
            outputs[table_index].bit_one = _outputs[i][1];
        }

         // label updates info
        upload_label_updates_info(table_index_of_garbled_inputs, _label_updates);
    }
}
