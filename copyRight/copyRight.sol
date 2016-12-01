pragma solidity ^0.4.2;

contract copyRightContract {
    address public buyer;   //buyer initiate the contract
    address public copyRightRecordAddress;   //or hard-coded by application?
    uint public contractStartTime;
    bool public isOperating;
    /////////////////////////////////////////  pattern 1  parameters
    uint public totalCount;
    uint public paidCount;
    uint public pricePerCount;
    /////////////////////////////////////////  pattern 2  parameters
    bool public oneTimeHasPaid;
    /////////////////////////////////////////  pattern 3  parameters
    uint public lastPaidTime;
    uint public durationLeft;
    
    event paymentRecord(uint time, uint amount);
    
    function copyRightContract(address theBuyer, uint price) {
        buyer = theBuyer;
        copyRightRecordAddress = msg.sender;
        contractStartTime = now;
        isOperating = true;
        
        totalCount = 0;
        paidCount = 0;
        pricePerCount = price;
        
        oneTimeHasPaid = false;
    }
    /////////////////////////////////////////  payment pattern /////////////////////////////////////////
    /////////////////////////////////////////     pattern 1    /////////////////////////////////////////
    function byCount() {
        if(msg.sender != buyer || isOperating == false) throw;
        totalCount += 1;
    }
    
    function payByCount() payable {
        if(msg.sender != buyer || isOperating == false) throw;
        if(msg.value < (totalCount - paidCount)*pricePerCount*1 ether) throw;   //didn't pay enough
        else {
            paidCount = totalCount;
            paymentRecord(now, msg.value);
        }
    }
    /////////////////////////////////////////     pattern 2    /////////////////////////////////////////
    function oneTime() payable {
        if(msg.sender != buyer || isOperating == false) throw;
        if(msg.value < 150 ether || oneTimeHasPaid) throw;   //replace 15000 with price for one-time payment
        else {
            oneTimeHasPaid = true;
            paymentRecord(now, msg.value);
        }
    }
    /////////////////////////////////////////     pattern 3    /////////////////////////////////////////
    function checkIfExpired() returns (bool) {
        if((now - lastPaidTime > durationLeft && durationLeft != 0) || isOperating == false) return true;
        else return false;
    }
    
    function payByTime() payable {
        if(msg.sender != buyer || isOperating == false) throw;
        var periodsPaid = msg.value/30 ether;
        var payTime = now;
        if(this.checkIfExpired() == true) durationLeft = 0;
        if(durationLeft == 0) {
            durationLeft = periodsPaid*30 days;
        }
        else {
            durationLeft = durationLeft - (payTime - lastPaidTime) + periodsPaid * 30 days;
        }
        lastPaidTime = payTime;
        paymentRecord(payTime, msg.value);
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    
    function paymentDistribute() returns (bool){
        if (msg.sender != copyRightRecordAddress || isOperating == false) return false;
        
        uint balance = this.balance;
        if (copyRightRecordAddress.send(this.balance)) {
            paymentRecord(now, balance);
            return true;
        }
        else return false;
    }
    
    function terminateContract() returns (bool){
        if (msg.sender != copyRightRecordAddress || isOperating == false) return false;
        isOperating = false;
        return true;
    }

    function () payable {
    }
}


contract copyRightRecord {
    address public multisig;
    uint public ownersCount;
    uint public overallOwnersCount;
    address[] public owners;
    mapping(address => uint) public shares;
    uint public totalShare;
    string public metaData;   //or hash, so that it could be stored in fixed-size array?
    mapping(address => address) public buyerToContractsAddress;
    address[] public contractsAddress;
    uint public contractsCount;
    mapping(address => uint) public contractLastCollectTime;
    uint public registerTime;
    bool public isEffective;
    uint public lastWithdrawTime;
    
    event paymentRecord(uint time, address _to, uint amount);
    event record(uint indexed regTime, address indexed owner, string indexed metaDataHash);
    event revokeRecord(string metadata, string revokeDetail);
    event newContractRecord(uint time, address indexed buyer, address indexed contractAddress);
    event terminateContractRecord(uint time, address indexed buyer, address indexed contractAddress);
    
    function copyRightRecord(string metadata, uint share) {
        ownersCount = 1;
        overallOwnersCount = 1;
        owners.push(msg.sender);
        shares[msg.sender] = share;
        totalShare = share;
        metaData = metadata;
        registerTime = now;
        record(registerTime, msg.sender, metaData);
        isEffective = true;
        lastWithdrawTime = 0;
        contractsCount = 0;
        multisig = new oneToManyMultiSig(msg.sender);
    }
    
    function registerOwnership(address newOwner, uint share) {
        if(isEffective == false) throw;
        for(uint i=0; i<overallOwnersCount;i++) {   
                if(owners[i] == msg.sender) break;
                if(i == overallOwnersCount-1) throw;
        }
        
        owners.push(newOwner);
        ownersCount += 1 ;
        overallOwnersCount += 1;
        shares[newOwner] = share;
        totalShare += share;
        record(now, newOwner, metaData);
        oneToManyMultiSig ms = oneToManyMultiSig(multisig);
        ms.registerOwnership(newOwner);
    }
    
    function transferOwnership(address newOwner, uint share) {   //if msg.sender == newOwners, revoke msg.sender itself
        if(isEffective == false) throw;
        for(uint i=0; i<overallOwnersCount;i++) {   
                if(owners[i] == msg.sender) break;
                if(i == overallOwnersCount-1) throw;
        }
        if(newOwner != msg.sender) {
            owners.push(newOwner);
            ownersCount += 1;
            overallOwnersCount += 1;
            shares[newOwner] = share;
            totalShare += share;
            record(now, newOwner, metaData);   //transfer proof
        }
        totalShare -= shares[owners[i]];
        delete shares[owners[i]];
        delete owners[i];
        ownersCount -= 1;
        if(ownersCount == 0) isEffective = false;
        oneToManyMultiSig ms = oneToManyMultiSig(multisig);
        ms.transferOwnership(msg.sender, newOwner);
    }
    
    function expireOwnership() {
        if(isEffective == false ) throw;   //anyone can trigger this function to check if the contract has expire?
        
        if((now-registerTime) <= 15 years) throw;
        else {
            var moneyLeft = this.balance;
            for(uint i=0; i<overallOwnersCount;i++) {
                if( owners[i] == 0x0000000000000000000000000000000000000000) continue;
                if( owners[i].send(moneyLeft*(shares[owners[i]]/totalShare)) ) paymentRecord(now, owners[i], moneyLeft*(shares[owners[i]]/totalShare));
                delete shares[owners[i]];
            }
            isEffective = false;
            revokeRecord(metaData, "expire");
            delete owners;   //deletion for storage saving, it's optional
            delete ownersCount;
            delete totalShare;
        }
    }
    
    
    function revokeOwnership(string cause) {
        if(msg.sender != 0x123456789 || isEffective == false ) throw;   //replace it by a multi-sig contract address or trusted third party
        isEffective = false;
        revokeRecord(metaData, cause);
    }
    
    function setUpNewContract(address buyer, uint price) returns (uint result){
        if(isEffective == false) throw;   
        for(uint i=0; i<overallOwnersCount;i++) {   
            if(owners[i] == msg.sender) break;
            if(i == overallOwnersCount-1) throw;
        }
        
        if(buyerToContractsAddress[buyer] != 0) return 0;
        address newContract = new copyRightContract(buyer, price);
        contractLastCollectTime[newContract] = now;
        newContractRecord(contractLastCollectTime[newContract], buyer, newContract);
        buyerToContractsAddress[buyer] = newContract;
        contractsAddress.push(newContract);
        contractsCount += 1;
        oneToManyMultiSig ms = oneToManyMultiSig(multisig);
        ms.newContract(buyer, newContract);
        return 1;
    }
    
    function withdraw() internal {
        var moneyLeft = this.balance;
        for(uint i=0; i<overallOwnersCount;i++) {
            if( owners[i] == 0x0000000000000000000000000000000000000000) continue;
            if( owners[i].send(moneyLeft*(shares[owners[i]]/totalShare)) ) paymentRecord(now, owners[i], moneyLeft*(shares[owners[i]]/totalShare));
        }
        lastWithdrawTime = now;
    }
    
    function collectMoney() {
        if(isEffective == false || (now - lastWithdrawTime) < 30 days) throw;   //can only withdraw after another 30 days
        for(uint i=0; i<contractsCount;i++){
            copyRightContract con = copyRightContract(contractsAddress[i]);
            if(con.paymentDistribute() == true) contractLastCollectTime[contractsAddress[i]] = now;
        }
        withdraw();
    }
    
    function terminateContract(address buyer) returns (bool){
        if(msg.sender != multisig || isEffective == false ) return false;   //replace it by a multi-sig contract address
        address conAddr = buyerToContractsAddress[buyer];
        if(conAddr == 0x0) return false;
        else {
            copyRightContract con = copyRightContract(conAddr);
            if(con.terminateContract() == true) {
                terminateContractRecord(now, buyer, conAddr);
                return true;
            }
            else return false;
        }
    }

    function () payable {
    }
}


contract oneToManyMultiSig {
    address copyRightRecordAddress;
    address[] public owners;
    uint public ownersCount;
    uint public overallOwnersCount;
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
        overallOwnersCount = 1;
    }
    
    function restartAllStatus() internal {
        for(uint i=0; i<buyersCount;i++) {   
            contracts[buyers[i]].lastVoteStartTime = 0;
            contracts[buyers[i]].upVoteCount = 0;
            for(uint j=0; j<overallOwnersCount;j++) {   
                if( owners[j] == 0x0000000000000000000000000000000000000000) continue;
                contracts[buyers[i]].ifVoteUp[owners[j]] = false;
            }
        }
    }
    
    function registerOwnership(address owner) {
        if(msg.sender != copyRightRecordAddress) throw;
        owners.push(owner);
        ownersCount += 1;
        overallOwnersCount += 1;
        restartAllStatus();
    }
    
    function transferOwnership(address sender, address newOwner) {   //if msg.sender == newOwners, revoke msg.sender itself
        if(msg.sender != copyRightRecordAddress) throw;
        
        for(uint i=0; i<overallOwnersCount;i++) {  
            if(owners[i] == sender) break;
            else if(owners[i] == newOwner) throw;
            if(i == overallOwnersCount-1) throw;
        }
        if(newOwner != sender) {
            owners.push(newOwner);
            ownersCount += 1;
            overallOwnersCount += 1;
        }
        restartAllStatus();
        delete owners[i];
        ownersCount -= 1;
    }

    function newContract(address buyer, address contractAddr){
        if(msg.sender != copyRightRecordAddress) throw;
        
        buyers.push(buyer);
        buyersCount += 1;
        contracts[buyer] = terminateContractVote(0, buyer, contractAddr, 0);
        for(uint i=0; i<overallOwnersCount;i++) {  
            if( owners[i] == 0x0000000000000000000000000000000000000000) continue;
            contracts[buyer].ifVoteUp[owners[i]] = false;
        }
        
    }
    
    function inquireLastVoteStartTime(address buyer) returns (uint) {
        if(contracts[buyer].buyer == buyer) return contracts[buyer].lastVoteStartTime;
        else return 1;   //wrong buyer address
    }
    
    function voteUp(address buyer, uint timeStamp) returns (uint) {
        for(uint i=0; i<overallOwnersCount;i++) {   
                if(owners[i] == msg.sender) break;
                if(i == overallOwnersCount-1) throw;
        }
        if(contracts[buyer].buyer != buyer) return 0;    //no such buyer
        if(contracts[buyer].lastVoteStartTime == timeStamp && timeStamp != 0) {    //vote to a certain round
            if(now - contracts[buyer].lastVoteStartTime >= 6 days) {    //voteRound expired.  ps:6 could be replaced
                contracts[buyer].lastVoteStartTime = 0;
                contracts[buyer].upVoteCount = 0;
                for(uint j=0; j<overallOwnersCount;j++) {
                    if( owners[j] == 0x0000000000000000000000000000000000000000) continue;
                    contracts[buyer].ifVoteUp[owners[j]] = false;
                }
                return 0;
            }
            else {
                if(contracts[buyer].ifVoteUp[msg.sender] == false) {
                    if(contracts[buyer].upVoteCount >= (ownersCount*2/3)-1) {    //get enough vote, start termination
                        copyRightRecord con = copyRightRecord(copyRightRecordAddress);
                        if(con.terminateContract(buyer) == true) {
                            contracts[buyer].lastVoteStartTime = 0;
                            contracts[buyer].upVoteCount = 0;
                            for(uint k=0; k<overallOwnersCount;k++) {
                                if( owners[k] == 0x0000000000000000000000000000000000000000) continue;
                                contracts[buyer].ifVoteUp[owners[k]] = false;
                            }
                            return 2;    // complete termination
                        }
                        else return 0;    // termination process aborted, the contract is either terminated or wrong buyer address
                    }
                    else return 1;
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
                    contracts[buyer].lastVoteStartTime = 0;
                    contracts[buyer].upVoteCount = 0;
                    for(uint p=0; p<overallOwnersCount;p++) {   
                        if( owners[p] == 0x0000000000000000000000000000000000000000) continue;
                        contracts[buyer].ifVoteUp[owners[p]] = false;
                    }
                    return 0;
                }
                else return 0;    //wrong timeStamp
            }
            else return 0;    //vote round already expired and removed
        }
    }
}