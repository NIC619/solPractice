pragma solidity ^0.5.15;

import "./SafeMath.sol";
import "./GarbledCircuit.sol";

contract GC_tree_based_ORAM is GarbledCircuit{
    using SafeMath for uint256;
    address public owner;

    uint256 constant public TREE_HEIGHT = 3;
    uint256 constant public NUM_LEAF_NODES = 2**(TREE_HEIGHT - 1);
    uint256 constant public FIRST_LEAF_NODE_INDEX = 2**TREE_HEIGHT - NUM_LEAF_NODES;
    uint256 constant public LAST_LEAF_NODE_INDEX = 2**TREE_HEIGHT - 1;
    uint256 constant public NUM_BUCKETS = 4;

    // node index starts from 1
    // mapping of (node_index -> node)
    mapping(uint256 => bytes32[NUM_BUCKETS]) public nodes;

    modifier onlyOwner {
        require(msg.sender == owner, "Not onwer.");
        _;
    }

    // `i` should be the output of GC
    function read_leaf_node_index(uint256 i) public pure returns(uint256 leaf_node_index) {
        require(i < NUM_LEAF_NODES, "Invalid leaf node index.");
        leaf_node_index = FIRST_LEAF_NODE_INDEX + i;
    }

    function read_node(uint256 node_index) public view returns(bytes32[NUM_BUCKETS] memory node) {
        require(node_index >= 1, "Invalid node index.");
        require(node_index <= (2**TREE_HEIGHT - 1), "Invalid node index.");

        for(uint i = 0; i < NUM_BUCKETS; i++) {
            node[i] = nodes[node_index][i];
        }
    }

    function read_branch(uint256 leaf_node_index) public view returns(bytes32[NUM_BUCKETS][TREE_HEIGHT] memory branch) {
        require(FIRST_LEAF_NODE_INDEX <= leaf_node_index, "Invalid leaf node index.");
        require(leaf_node_index <= LAST_LEAF_NODE_INDEX, "Invalid leaf node index.");

        uint256 node_index = leaf_node_index;
        for(uint i = 0; i < TREE_HEIGHT; i++) {
            for(uint j = 0; j < NUM_BUCKETS; j++) {
                branch[i][j] = nodes[node_index][j];
            }
            node_index = node_index.div(2);
        }
    }

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

    constructor() public {
      owner = msg.sender;
    }
}
