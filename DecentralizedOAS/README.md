### Pre-requisite

- [Truffle](https://www.trufflesuite.com/truffle)
- [Ganache](https://www.trufflesuite.com/ganache)

### Functions detail

#### SORAM
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

#### Garbled Circuit

Example circuit layout
```
     t_2
    /   \
   x     y
  /       \
t_0       t_1
(t_0's output is t_2's x input)
(t_1's output is t_2's y input)
```

```
        t_6
      /     \
    t_4     t_5
   /  \     /  \
 t_0  t_1  t_2  t_3
```

- `function read_gtt(uint256 table_index)`
  - read garbled truth table
- `function read_inputs_of_table(uint256 table_index)`
  - read inputs to gtt
- `function read_outputs(uint256 table_index)`
  - read outputs of end table, e.g., t_6
    - these outputs are for comparison, i.e., to determine decryption result is bit 0 or bit 1
- `function read_decryption_result(uint256 table_index)`
  - read decryption result of end table
- `function deploy(uint256 _num_inputs, uint256[3][] memory table_relation, bytes32[4][] memory all_table_entries, uint256[] memory table_index_of_garbled_inputs, bytes32[] memory garbled_inputs, uint256[] memory table_index_of_outputs, bytes32[2][] memory _outputs)`
  - deploy circuit
  - entry in `table_relation` represents relation between a child table and its parent table, e.g., t_0(child) -> t_4(parent)
    - also need to include info of which input is the child to parent, e.g., t_0's output is x(bit 0)) input of t_4 and t_5's output is y(bit 1)) input of t_6
  - `all_table_entries` represents (shuffled) entries of each table
  - `table_index_of_garbled_inputs` and `garbled_inputs` are used to fill in the y inputs of input tables, e.g., y inputs of t_0, t_1, t_2 and t_3
  - `table_index_of_outputs` and `_outputs` are used to fill in the outputs of end tables, e.g., output of t_6
- `function decrypt(uint256[] memory table_index_of_garbled_inputs, bytes32[] memory garbled_inputs, uint256[2][] memory entries_chosen, uint256[] memory table_index_of_end_tables)`
  - provide inputs and decrypt
  - `table_index_of_garbled_inputs` and `garbled_inputs` are used to fill in the x inputs of input tables, e.g., x inputs of t_0, t_1, t_2 and t_3
  - `entries_chosen` represents entry chosen for each table
    - since entries of each table are shuffled, it will need to try decrypting every entry if which-entry-to-decrypt is not provided.
  - `table_index_of_end_tables` represents the index of each end table
    - it is used to check the output of end tables, i.e., the decryption results we are expecting


### Testing

- ` truffle test test/soram.js`
- ` truffle test test/garbled_circuit.js`