pragma solidity ^0.5.15;

import "./SafeMath.sol";

contract SORAM {
    using SafeMath for uint256;
    address public owner;

    uint256 public max_layer;
    uint256 NUM_FIRST_LAYER_DATA_BLOCK = 4;
    mapping(uint256 => bytes32) public index_block_storage;
    mapping(uint256 => bytes32) public data_block_storage;

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    function write(uint256 layer, bytes32 index_block, bytes32[] memory data_blocks) onlyOwner public {
        require(layer >= 1, "Invalid layer.");
        require(layer <= max_layer, "Invalid layer.");
        uint256 num_data_blocks = 2**(layer.add(1));
        require(num_data_blocks == data_blocks.length, "Incorrect number of blocks provided.");

        // Write index block
        index_block_storage[layer] = index_block;

        uint256 input_data_blocks_counter = 0;
        uint256 start_index = num_data_blocks.sub(4);
        for(uint index = start_index; index < (start_index.add(num_data_blocks)); index++) {
            data_block_storage[index] = data_blocks[input_data_blocks_counter];
            input_data_blocks_counter = input_data_blocks_counter.add(1);
        } 
    }

    constructor(uint256 _max_layer) public{
      owner = msg.sender;
      max_layer = _max_layer;
    }
}
