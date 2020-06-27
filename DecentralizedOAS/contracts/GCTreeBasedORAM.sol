pragma solidity ^0.5.15;

import "./SafeMath.sol";
import "./GarbledCircuit.sol";

contract GCTreeBasedORAM is GarbledCircuit{
    using SafeMath for uint256;
    address public owner;

    uint256 public TREE_HEIGHT;
    uint256 public NUM_LEAF_NODES;
    uint256 public FIRST_LEAF_NODE_INDEX;
    uint256 public LAST_LEAF_NODE_INDEX;
    uint256 constant public NUM_BUCKETS = 4;

    // node index starts from 1
    // mapping of (node_index -> node)
    mapping(uint256 => bytes32[NUM_BUCKETS]) public nodes;

    modifier onlyOwner {
        require(msg.sender == owner, "Not onwer.");
        _;
    }

    /**
     * @dev Read the node by the specified index.
     */
    function read_node(uint256 node_index) public view returns(bytes32[NUM_BUCKETS] memory node) {
        require(node_index >= 1, "Invalid node index.");
        require(node_index <= (2**TREE_HEIGHT - 1), "Invalid node index.");

        for(uint i = 0; i < NUM_BUCKETS; i++) {
            node[i] = nodes[node_index][i];
        }
    }

    /**
     * @dev Read the whole branch of nodes by the specified leaf node index.
     *
     * Example:
     *      node_1
     *      /    \
     *  node_2   node_3 
     *    /         \
     * node_4       node_5
     *
     * Nodes 1, 3 and 5 will be read if leaf node index is 5.
     */
    function read_branch(uint256 leaf_node_index) public view returns(bytes32[NUM_BUCKETS][] memory) {
        require(FIRST_LEAF_NODE_INDEX <= leaf_node_index, "Invalid leaf node index.");
        require(leaf_node_index <= LAST_LEAF_NODE_INDEX, "Invalid leaf node index.");

        bytes32[NUM_BUCKETS][] memory branch = new bytes32[NUM_BUCKETS][](TREE_HEIGHT);
        uint256 node_index = leaf_node_index;
        for(uint i = 0; i < TREE_HEIGHT; i++) {
            for(uint j = 0; j < NUM_BUCKETS; j++) {
                branch[i][j] = nodes[node_index][j];
            }
            node_index = node_index.div(2);
        }
        return branch;
    }

    /**
     * @dev Read the decryption result which are bits and turn them into a single number, i.e., the index.
     */
    function get_index_from_decryption_result(uint256[] memory table_indices) public view returns(uint256 index) {
        require(table_indices.length > 0, "No table indices provided.");

        uint256 table_index;
        uint256 num_bits = table_indices.length;
        uint256 exp = num_bits - 1;
        for(uint i = 0; i < num_bits; i++) {
            table_index = table_indices[i];
            require(decrpytion_result[table_index] > 0, "Decryption result is not set");
            if(decrpytion_result[table_index] == 2) {
                index += 2**exp;
            }
            exp -= 1;
        }
    }

    /**
     * @dev Feed the leaf node index read from `get_index_from_decryption_result` into `read_branch`. 
     */
    function get_nodes_from_decryption_result(uint256[] memory table_indices) public view returns(bytes32[NUM_BUCKETS][] memory) {
        require(table_indices.length > 0, "No table indices provided.");

        uint256 index = get_index_from_decryption_result(table_indices);
        return read_branch(index);
    }

    /**
     * @dev Update nodes at the specified indices.
     */
    function update_nodes(uint256[] memory node_indices, bytes32[NUM_BUCKETS][] memory new_nodes) public onlyOwner {
        require(node_indices.length == new_nodes.length, "Input array not of the same length");

        uint256 node_index;
        for(uint i = 0; i < node_indices.length; i++) {
            node_index = node_indices[i];
            require(node_index >= 1, "Invalid node index.");
            require(node_index <= (2**TREE_HEIGHT - 1), "Invalid node index.");
            require(new_nodes[i].length == NUM_BUCKETS);

            for(uint j = 0; j < NUM_BUCKETS; j++) {
                nodes[node_index][j] = new_nodes[i][j];
            }
        }
    }

    constructor(uint256 _TREE_HEIGHT) public {
        owner = msg.sender;
        TREE_HEIGHT = _TREE_HEIGHT;
        NUM_LEAF_NODES = 2**(TREE_HEIGHT - 1);
        FIRST_LEAF_NODE_INDEX = 2**TREE_HEIGHT - NUM_LEAF_NODES;
        LAST_LEAF_NODE_INDEX = 2**TREE_HEIGHT - 1;
    }
}
