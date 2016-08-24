contract oneToManyMultiSig {
    address copyRightRecordAddress;
    address[] public owners;
    uint public ownersCount;
    struct terminateContractVote {
        uint lastVoteStartTime;
        address buyer;
        address contractAddress;
        uint upVoteCount;
        mapping(address => bool) ifVoteUp;
    }
    address[] public buyers;
    uint public buyersCount;
    mapping(address => terminateContractVote) contracts;
    
    function oneToManyMultiSig(address owner) {
        copyRightRecordAddress = msg.sender;
        owners.push(owner);
        ownersCount = 1;
    }
    
    function restartAllStatus() internal {
        for(uint i=0; i<buyersCount;i++) {   
            contracts[buyers[i]].lastVoteStartTime = 0;
            contracts[buyers[i]].upVoteCount = 0;
            for(uint j=0; j<ownersCount;j++) {   
                contracts[buyers[i]].ifVoteUp[owners[j]] = false;
            }
        }
    }
    
    function registerOwnership(address owner) {
        if(msg.sender != copyRightRecordAddress) throw;
        owners.push(owner);
        ownersCount += 1;
        restartAllStatus();
    }
    
    function transferOwnership(address newOwner) {   //if msg.sender == newOwners, revoke msg.sender itself
        if(msg.sender != copyRightRecordAddress) throw;
        
        for(uint i=0; i<ownersCount;i++) {   
                if(owners[i] == msg.sender) break;
                if(i == ownersCount-1) throw;
        }
        if(newOwner != msg.sender) {
            owners.push(newOwner);
            ownersCount += 1;
        }
        delete owners[i];
        ownersCount -= 1;
        restartAllStatus();
    }

    function newContract(address buyer, address contractAddr){
        if(msg.sender != copyRightRecordAddress) throw;
        
        buyers.push(buyer);
        buyersCount += 1;
        contracts[buyer] = terminateContractVote(0, buyer, contractAddr, 0);
        for(uint i=0; i<ownersCount;i++) {   
            contracts[buyer].ifVoteUp[owners[i]] = false;
        }
        
    }
    
    function inquireLastVoteStartTime(address buyer) returns (uint) {
        if(contracts[buyer].buyer == buyer) return contracts[buyer].lastVoteStartTime;
        else return 1;   //wrong buyer address
    }
    
    function voteUp(address buyer, uint timeStamp) returns (uint) {
        for(uint i=0; i<ownersCount;i++) {   
                if(owners[i] == msg.sender) break;
                if(i == ownersCount-1) throw;
        }
        if(contracts[buyer].buyer != buyer) return 0;    //no such buyer
        if(contracts[buyer].lastVoteStartTime == timeStamp && timeStamp != 0) {    //vote to a certain round
            if(now - contracts[buyer].lastVoteStartTime >= 6 days) {    //voteRound expired.  ps:6 could be replaced
                restartAllStatus();
                return 0;
            }
            else {
                if(contracts[buyer].ifVoteUp[msg.sender] == false) {
                    if(contracts[buyer].upVoteCount >= (ownersCount*2/3)-1) {    //get enough vote, start termination
                        copyRightRecord con = copyRightRecord(copyRightRecordAddress);
                        if(con.terminateContract() == true) {
                            contracts[buyer].lastVoteStartTime = 0;
                            contracts[buyer].upVoteCount = 0;
                            for(uint j=0; j<ownersCount;j++) {   
                                contracts[buyer].ifVoteUp[owners[j]] = false;
                            }
                            return 2;    // complete termination
                        }
                        else return 0;    // termination process aborted, the contract is either terminated or wrong buyer address
                    }
                }
                else return 1;    //already vote up before
            }
        }
        else if(contracts[buyer].lastVoteStartTime == timeStamp && timeStamp == 0){    // start a new round of vote
            contracts[buyer].ifVoteUp[msg.sender] = true;
            contracts[buyer].upVoteCount += 1;
            contracts[buyer].lastVoteStartTime = now;
            return contracts[buyer].lastVoteStartTime;
        }
        else {
            if(contracts[buyer].lastVoteStartTime != 0) {
                if(now - contracts[buyer].lastVoteStartTime >= 6 days) {    //vote round expired
                    restartAllStatus();
                    return 0;
                }
                else return 0;    //wrong timeStamp
            }
            else return 0;    //vote round already expired and removed
        }
    }
}