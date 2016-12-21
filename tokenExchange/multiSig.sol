pragma solidity ^0.4.2;
contract tokenExchange{
    
}

contract tokenInfo {
    function newExchangeContract(address addr);
}

contract multiSig {
    address public thirdParty;

    struct voteInfo {
        bytes32 voteIdentifier;
        address companyA;
        address tokenOfA;
        address companyB;
        address tokenOfB;
        uint portionOfTokenA;
        uint portionOfTokenB;
        uint exchangeLimitOfA;
        mapping(address => bool) ifVoteUp;
        //uint startTime;
    }

    mapping(bytes32 => voteInfo) votes;         //using 32 bytes hash to identify a vote
    
    
    function multiSig() {
        thirdParty = msg.sender;

    }
    
    function purgeExpiredVote() {       //if vote will expire, use this function to clean data
        
    }
    
    /////////Functions checking status of a vote
    function checkVoteStatus(bytes32 _voteIdentifier) constant returns(uint){
        if(votes[_voteIdentifier].voteIdentifier == 0x0) return 0;      //vote not exist
        else if(votes[_voteIdentifier].voteIdentifier == 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff)
            return 1;                                                   //vote ended
        else return 2;                                                  //vote still going
    }
    
    function checkCompanyOfCertainVote(bytes32 _voteIdentifier) constant returns (address _companyA, address _companyB) {
        _companyA = votes[_voteIdentifier].companyA;
        _companyB = votes[_voteIdentifier].companyB;
    }
    
    function checkTokenOfCertainVote(bytes32 _voteIdentifier) constant returns (address _tokenA, address _tokenB) {
        _tokenA = votes[_voteIdentifier].tokenOfA;
        _tokenB = votes[_voteIdentifier].tokenOfB;
    }
    
    function checkIfVoteUp(bytes32 _voteIdentifier, address theCompany) constant returns (bool) {
        return votes[_voteIdentifier].ifVoteUp[theCompany];             //return if certain company had
                                                                        //vote in certain vote
    }
    
    /////////Functions start and join a vote
    function newVote(bytes32 _voteIdentifier, address _companyA, address _companyB, address _tokenOfA, address _tokenOfB, uint _portionOfTokenA, uint _portionOfTokenB, uint _limitOfTokenA){
        if(msg.sender != _companyA && msg.sender != _companyB) throw;   //only related companies can start a vote
        
        votes[_voteIdentifier] = voteInfo(_voteIdentifier, _companyA,  _tokenOfA, _companyB, _tokenOfB, _portionOfTokenA, _portionOfTokenB, _limitOfTokenA);
        votes[_voteIdentifier].ifVoteUp[msg.sender] = true;
    }
    
    function voteUp(bytes32 _voteIdentifier) returns (uint) {
        if(checkVoteStatus(_voteIdentifier) != 2) return 0;     //check vote status, return 0 as vote status error
                                                                //either not exist or ended
        if(msg.sender != votes[_voteIdentifier].companyA && msg.sender != votes[_voteIdentifier].companyB && msg.sender != thirdParty)
            return 1;                                           //check if msg.sender if one of the company, return 1 if not
        votes[_voteIdentifier].ifVoteUp[msg.sender] = true;
        if(votes[_voteIdentifier].ifVoteUp[thirdParty] && votes[_voteIdentifier].ifVoteUp[votes[_voteIdentifier].companyA] && votes[_voteIdentifier].ifVoteUp[votes[_voteIdentifier].companyB]) {
            //all up vote collected, create contract
            tokenExchange newEx = new tokenExchange(votes[_voteIdentifier].companyA, votes[_voteIdentifier].companyB,votes[_voteIdentifier].tokenOfA,
                votes[_voteIdentifier].tokenOfB, votes[_voteIdentifier].portionOfTokenA, votes[_voteIdentifier].portionOfTokenB, votes[_voteIdentifier].exchangeLimitOfA);
            tokenInfo(votes[_voteIdentifier].tokenOfA).newExchangeContract(newEx);//inform tokenOfA and tokenOfB contract
            tokenInfo(votes[_voteIdentifier].tokenOfB).newExchangeContract(newEx);//
            votes[_voteIdentifier].voteIdentifier = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;//vote complete, change the identifier field
            return 3;                                            //return 3 for vote completion
        }
        else
            return 2;                                           //vote updated but not complete yet, return 2
        
    }
}