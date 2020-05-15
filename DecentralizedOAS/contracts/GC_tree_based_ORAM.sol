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

    // mapping of (garbled circuit result -> leaf_node_index)
    mapping(uint256 => uint256) public leaf_node_indices;

    modifier onlyOwner {
        require(msg.sender == owner, "Not onwer.");
        _;
    }

    function read_leaf_node_index(uint256 index) public view returns(uint256) {
        return leaf_node_indices[index];
    }

    function read_node(uint256 node_index) public view returns(bytes32[NUM_BUCKETS] memory node) {
        require(node_index >= 1, "Invalid node index.");
        require(node_index <= (2**TREE_HEIGHT - 1), "Invalid node index.");

        for(uint i = 0; i < NUM_BUCKETS; i++) {
            node[i] = nodes[node_index][i];
        }
    }

    function update_leaf_node_indices(uint256[] memory indices, uint256[] memory _leaf_node_indices) public onlyOwner {
        require(indices.length == _leaf_node_indices.length, "Input array not of the same length.");

        uint256 index;
        uint256 leaf_node_index;
        for(uint i = 0; i < indices.length; i++) {
            index = indices[i];
            leaf_node_index = _leaf_node_indices[i];
            require(FIRST_LEAF_NODE_INDEX <= leaf_node_index, "Invalid leaf node index.");
            require(leaf_node_index <= LAST_LEAF_NODE_INDEX, "Invalid leaf node index.");

            leaf_node_indices[index] = leaf_node_index;
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
