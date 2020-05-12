pragma solidity ^0.5.15;

import "./SafeMath.sol";

contract GC_tree_based_ORAM {
    using SafeMath for uint256;
    address public owner;

    uint256 constant NUM_TREE_HEIGHTS = 3;
    uint256 constant NUM_LEAF_NODES = 2**(3 - 1);
    uint256 constant NUM_BUCKETS = 4;

    // node index starts from 1
    // mapping of (node_index -> node)
    mapping(uint256 => bytes32[NUM_BUCKETS]) public nodes;

    // path index starts from 0
    // mapping of (garbled circuit result -> path)
    mapping(uint256 => uint256[NUM_TREE_HEIGHTS]) public paths;

    modifier onlyOwner {
        require(msg.sender == owner, "Not onwer.");
        _;
    }

    function read_path(uint256 index) public view returns(uint256[NUM_TREE_HEIGHTS] memory path) {
        require(index < NUM_LEAF_NODES);

        for(uint i = 0; i < NUM_TREE_HEIGHTS; i++) {
            path[i] = paths[index][i];
        }
    }

    function read_node(uint256 node_index) public view returns(bytes32[NUM_BUCKETS] memory node) {
        require(node_index >= 1, "Invalid node index.");
        require(node_index <= (2**NUM_TREE_HEIGHTS - 1), "Invalid node index.");

        for(uint i = 0; i < NUM_BUCKETS; i++) {
            node[i] = nodes[node_index][i];
        }
    }

    function update_path(uint256 index, uint256[NUM_TREE_HEIGHTS] memory path) public onlyOwner {
        require(path.length == NUM_TREE_HEIGHTS);

        for(uint i = 0; i < NUM_TREE_HEIGHTS; i++) {
            paths[index][i] = path[i];
        }
    }

    function update_node(uint256 node_index, bytes32[NUM_BUCKETS] memory node) public onlyOwner {
        require(node.length == NUM_BUCKETS);

        for(uint i = 0; i < NUM_BUCKETS; i++) {
            nodes[node_index][i] = node[i];
        }
    }

    constructor() public {
      owner = msg.sender;
    }
}
