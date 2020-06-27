### Pre-requisite

- [Truffle](https://www.trufflesuite.com/truffle)
- [Ganache](https://www.trufflesuite.com/ganache)

### SORAM
- Implement some part of the design in [SORAM paper](https://lib.dr.iastate.edu/cgi/viewcontent.cgi?article=1264&context=cs_techreports)

### GCTreeBasedORAM
- Implement the proof of concept in [Oblivious Access System on Decentralized Database over Parallel Smart Contract Model]()(link to be updated soon...).
- Slides for introduction
  - links to be provided soon...
- Function list
  - `EvalGC`
    - `GCTreeBasedORAM.decrypt`
  - `ReplaceGC`
    - `GCTreeBasedORAM.decrypt_label_update`
  - `UpdateGC`
    - `GCTreeBasedORAM.redeploy`
  - `Write`
    - `GCTreeBasedORAM.update_nodes`
  - `Read`
    - `GCTreeBasedORAM.read_branch`
- Profile on gas consumption and execution time of each function is in `test/profile_gc_tree_based_oram.js`.
  - tests include one instance with a tree of depth 3 and another instance with a tree of depth 4

### Testing
- ` truffle test test/profile_gc_tree_based_oram.js`
