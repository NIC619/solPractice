pragma solidity ^0.5.15;

import "./SafeMath.sol";
import "./GarbledCircuitNoDecrypt.sol";

contract GCNoDecryptTreeBasedORAM is GarbledCircuitNoDecrypt{
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

    function read_node(uint256 node_index) public view returns(bytes32[NUM_BUCKETS] memory node) {
        require(node_index >= 1, "Invalid node index.");
        require(node_index <= (2**TREE_HEIGHT - 1), "Invalid node index.");

        for(uint i = 0; i < NUM_BUCKETS; i++) {
            node[i] = nodes[node_index][i];
        }
    }

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
