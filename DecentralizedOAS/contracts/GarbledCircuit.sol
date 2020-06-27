pragma solidity ^0.5.15;
pragma experimental ABIEncoderV2;

import "./SafeMath.sol";

contract GarbledCircuit {
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
    mapping(uint256 => uint256) decrpytion_result;
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

    /**
     * @dev Read garbled truth table by the specified index.
     */
    function read_gtt(uint256 table_index) public view returns(bytes32[4] memory gtt) {
        gtt[0] = circuit[table_index].entry[0];
        gtt[1] = circuit[table_index].entry[1];
        gtt[2] = circuit[table_index].entry[2];
        gtt[3] = circuit[table_index].entry[3];
    }

    /**
     * @dev Read garbled truth table by the specified index.
     */
    function read_parent_table_indices(uint256 table_index) public view returns(uint256[] memory) {
        uint256 num_parent_tables = circuit[table_index].num_parent_tables;
        uint256[] memory indices = new uint256[](num_parent_tables);
        for(uint256 i = 0; i < num_parent_tables; i++) {
            indices[i] = circuit[table_index].parent_table_indices[i];
        }
        return indices;
    }

    /**
     * @dev Read inputs of garbled truth table by the specified index.
     */
    function read_inputs_of_table(uint256 table_index) public view returns(bytes32[2] memory inputs) {
        inputs[0] = circuit[table_index].input_x;
        inputs[1] = circuit[table_index].input_y;
    }

    /**
     * @dev Read outputs of garbled truth table by the specified index. The outputs are used to determine whether decryption result is bit 0 or bit 1.
     */
    function read_outputs_of_table(uint256 table_index) public view returns(bytes32[2] memory _outputs) {
        _outputs[0] = outputs[table_index].bit_zero;
        _outputs[1] = outputs[table_index].bit_one;
    }

    /**
     * @dev Read hash digest of outputs of garbled truth table by the specified index.
     * Hash digests are used to determined if the decrypted output is correct.
     */
    function read_output_hash_digests_of_table(uint256 table_index) public view returns(bytes32[2] memory _hash_digests) {
        _hash_digests[0] = circuit[table_index].output_hash_digests[0];
        _hash_digests[1] = circuit[table_index].output_hash_digests[1];
    }

    /**
     * @dev Read decryption result of garbled truth table by the specified index.
     *
     * Result are one of the following
     * 2: true
     * 1: false
     * 0: not set
     */
    function read_decryption_result(uint256 table_index) public view returns(uint256) {
        require(decrpytion_result[table_index] > 0, "Decryption result is not set");
        return decrpytion_result[table_index] - 1;
    }

    /**
     * @dev Read label updates info of garbled truth table by the specified indices. These info will be provided in `upload_label_updates_info`.
     */
    function read_label_updates(uint256[] memory table_indices) public view returns(bytes32[4][] memory) {
        require(table_indices.length > 0, "No table index provided.");

        uint256 table_index;
        bytes32[4][] memory l_updates = new bytes32[4][](table_indices.length);
        for(uint256 i = 0; i < table_indices.length; i++) {
            table_index = table_indices[i];
            l_updates[i][0] = label_updates[table_index].encrypted_y_0;
            l_updates[i][1] = label_updates[table_index].encrypted_y_1;
            l_updates[i][2] = label_updates[table_index].hash_digest_y_0;
            l_updates[i][3] = label_updates[table_index].hash_digest_y_1;
        }
        return l_updates;
    }

    /**
     * @dev Decrypt circuit.
     *
     * - `table_index_of_garbled_inputs` and `garbled_inputs` are used to fill in the x inputs of each input table.
     * - since entries of each table are shuffled, it will need to try decrypting each entry.
     * - `table_index_of_end_tables` represents the index of each end table
     *      - it is used to check the output of end tables, i.e., the decryption results we are expecting
     */
    function decrypt(
        uint256[] memory table_index_of_garbled_inputs,
        bytes32[] memory garbled_inputs,
        uint256[] memory execution_sequence,
        uint256[] memory table_index_of_end_tables) public {
        require(garbled_inputs.length == num_inputs, "Mismatched number of garbled inputs.");
        require(table_index_of_garbled_inputs.length == garbled_inputs.length, "Mismatch between number of table indices and number of garbled inputs");
        require(execution_sequence.length <= num_tables, "Number of execution sequence should be less than the number of tables.");
        require(table_index_of_end_tables.length == num_results, "Mismatched number of end tables.");

        // Fill in the given inputs
        for(uint256 i = 0; i < num_inputs; i++) {
            circuit[table_index_of_garbled_inputs[i]].input_x = garbled_inputs[i];
        }

        uint256 table_index;
        bytes32 entry;
        bytes32 result;
        bytes32 hash_digets;
        bool is_end_table;
        for(uint256 i = 0; i < execution_sequence.length; i++) {
            table_index = execution_sequence[i];
            // Iterate through all four entries and try decrypting
            for(uint256 k = 0; k < 4; k++) {
                entry = circuit[table_index].entry[k];
                result = bytes32(uint256(entry) ^ uint256(circuit[table_index].input_x) ^ uint256(circuit[table_index].input_y));
                // Compare hash of result against given digests
                hash_digets = keccak256(abi.encode(result));
                if(
                    (hash_digets != circuit[table_index].output_hash_digests[0]) && (hash_digets != circuit[table_index].output_hash_digests[1])
                ) continue;
                else break;
            }
            is_end_table = false;
            for(uint256 j = 0; j < table_index_of_end_tables.length; j++) {
                if(table_index == table_index_of_end_tables[j]) {
                    is_end_table = true;
                }
            }
            if(is_end_table == true) {
                if(result == outputs[table_index].bit_zero) {
                    decrpytion_result[table_index] = 1;
                } else if(result == outputs[table_index].bit_one) {
                    decrpytion_result[table_index] = 2;
                } else {
                    revert("Incorrect result.");
                }
            } else {
                for(uint256 j = 0; j < circuit[table_index].num_parent_tables; j++) {
                    if(circuit[table_index].is_input_x_to_table[j] == true) {
                        circuit[circuit[table_index].parent_table_indices[j]].input_x = result;
                    } else {
                        circuit[circuit[table_index].parent_table_indices[j]].input_y = result;
                    }
                }
            }
        }
    }

    /**
     * @dev Decrypt label updates info, compute labels for next round and update old labels.
     */
    function decrypt_label_update(uint256[] memory table_index_of_garbled_inputs) public {
        require(table_index_of_garbled_inputs.length == num_inputs, "Mismatched number of table indices.");

        uint256 table_index;
        bytes32 result;
        bytes32 hash_digets;
        for(uint256 i = 0; i < num_inputs; i++) {
            table_index = table_index_of_garbled_inputs[i];
            // Try decrypt with y_0
            result = bytes32(uint256(label_updates[table_index].encrypted_y_0) ^ uint256(circuit[table_index].input_y));
            hash_digets = keccak256(abi.encode(result));
            if((hash_digets == label_updates[table_index].hash_digest_y_0) || (hash_digets == label_updates[table_index].hash_digest_y_1)) {
                circuit[table_index].input_y = result;
                continue;
            }
            // Try decrypt with y_1
            result = bytes32(uint256(label_updates[table_index].encrypted_y_1) ^ uint256(circuit[table_index].input_y));
            hash_digets = keccak256(abi.encode(result));
            if((hash_digets == label_updates[table_index].hash_digest_y_0) || (hash_digets == label_updates[table_index].hash_digest_y_1)) {
                circuit[table_index].input_y = result;
            } else {
                revert("Incorrect label update.");
            }
        }
    }

    /**
     * @dev Initial deployment of circuit. It builds the relation between tables and fills in the data used for first round of decryption.
     * NOTE: This function should be executed only once.
     *
     * Example circuit layout
     *     t_2
     *    /   \
     *   x     y
     *  /       \
     * t_0       t_1
     * (t_0's output is t_2's x input)
     * (t_1's output is t_2's y input)
     *
     * Entry in `table_relation` represents relation between a child table and its parent table.
     * Also provides info of which input(x input of y input) is the child to parent.
     * `all_table_entries` represents (shuffled) entries of each table.
     *
     * It also records the total number of inputs and the total number of tables.
     */
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
        require(num_inputs == 0, "Circuit already been initialized.");
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

    /**
     * @dev Record info used for label updates. These info will be used to compute labels for next round in `decrypt_label_update`.
     */
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

    /**
     * @dev Deployment of circuit afterwards(after initial deployment). It fills in the data used for next round of decryption.
     */
    function redeploy(
        uint256[] memory table_index_of_table_entries,
        bytes32[4][] memory all_table_entries,
        bytes32[2][] memory all_table_output_hash_digests,
        uint256[] memory table_index_of_outputs,
        bytes32[2][] memory _outputs,
        uint256[] memory table_index_of_garbled_inputs,
        bytes32[4][] memory _label_updates) public {
        require(all_table_entries.length == num_tables, "Mismatched number of tables.");
        require(all_table_entries.length > num_inputs, "Number of tables should be greater than number of inputs.");
        require(all_table_entries.length == all_table_output_hash_digests.length);
        require(_outputs.length == num_results, "Mismatched number of outputs.");
        require(table_index_of_table_entries.length == all_table_entries.length, "Mismatch between number of table indices and number of tables");
        require(table_index_of_garbled_inputs.length == _label_updates.length, "Mismatch between number of table indices and number of label update info");
        require(table_index_of_outputs.length == _outputs.length, "Mismatch between number of table indices and number of outputs");

        uint256 table_index;
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
