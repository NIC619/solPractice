pragma solidity ^0.5.15;

import "./SafeMath.sol";

contract SORAM {
    using SafeMath for uint256;
    address public owner;

    uint256 public max_layer;
    uint256 NUM_FIRST_LAYER_DATA_BLOCK = 4;
    mapping(uint256 => bytes32) public index_block_storage;  // layer -> index block

    // position -> data block,
    // e.g., 0~3 are the positions for data blocks in first layer.
    // 4~11 are positions for data blocks in second layer.
    // 12~27 are positions for data blocks in third layer.
    // etc.
    mapping(uint256 => bytes32[]) public data_blocks_storage;

    modifier onlyOwner {
        require(msg.sender == owner, "Not onwer.");
        _;
    }

    function write(uint256 layer, bytes32 index_block, bytes32[] memory data_blocks) public onlyOwner {
        require(layer >= 1, "Invalid layer.");
        require(layer <= max_layer, "Invalid layer.");
        uint256 num_data_blocks = 2**(layer.add(1));
        require(num_data_blocks == data_blocks.length, "Incorrect number of blocks provided.");

        // Write index block
        index_block_storage[layer] = index_block;

        if(data_blocks_storage[layer].length == 0) {
            data_blocks_storage[layer] = new bytes32[](num_data_blocks);
        }

        for(uint index = 0; index < num_data_blocks; index++) {
            data_blocks_storage[layer][index] = data_blocks[index];
        }
    }

    function read_index_block(uint256 layer) public view onlyOwner returns(bytes32) {
        require(layer >= 1, "Invalid layer.");
        require(layer <= max_layer, "Invalid layer.");

        return index_block_storage[layer];
    }

    function read_data_blocks_by(uint256 layer) public view onlyOwner returns(bytes32[] memory) {
        require(layer >= 1, "Invalid layer.");
        require(layer <= max_layer, "Invalid layer.");

        return data_blocks_storage[layer];
    }

    // NOTE: index starts from 1
    function read_data_block_at(uint256 layer, uint256 index) public view onlyOwner returns(bytes32) {
        require(layer >= 1, "Invalid layer.");
        require(layer <= max_layer, "Invalid layer.");

        uint256 num_data_blocks = 2**(layer.add(1));
        require(0 <= index, "Invalid index.");
        require(index < num_data_blocks, "Invalid index.");

        return data_blocks_storage[layer][index];
    }

    constructor(uint256 _max_layer) public {
      owner = msg.sender;
      max_layer = _max_layer;
    }
}
