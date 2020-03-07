### Pre-requisite

- [Truffle](https://www.trufflesuite.com/truffle)
- [Ganache](https://www.trufflesuite.com/ganache)

### Functions detail

- `function write(uint256 layer, bytes32 index_block, bytes32[] memory data_blocks)`
  - write index block and data blocks to specified layer
- `function read_index_block(uint256 layer)`
  - read index block at specified layer
- `function read_data_block_at(uint256 layer, uint256 index)`
  - read data block at specified layer and it's index
    - `index` starts from `1`
      - e.g.,
    - `index of data blocks at layer 1: [1, 2, 3, 4]`
      - `index of data blocks at layer 2: [1, 2, 3, 4, 5, 6, 7, 8]`
- `function read_data_blocks_by(uint256 layer)`
  - read all data blocks at specified layer
- `constructor(uint256 _max_layer)`
  - when deploying the contract, specify max layer of the storage
