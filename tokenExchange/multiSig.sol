pragma solidity ^0.4.2;
contract tokenExchange{
    
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

    mapping(bytes32 => voteInfo) votes;
    
    
    function multiSig(address owner) {
        thirdParty = msg.sender;

    }
    
    function purgeExpiredVote() {
        
    }
    
    /////////Functions checking status of a vote
    function checkVoteStatus(bytes32 _voteIdentifier) constant returns(uint){
        if(votes[_voteIdentifier].voteIdentifier == 0x0) return 0;   //vote not exist
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
        return votes[_voteIdentifier].ifVoteUp[theCompany];
    }
    
    /////////Functions start and join a vote
    function newVote(bytes32 _voteIdentifier, address _companyA, address _companyB, address _tokenOfA, address _tokenOfB, uint _portionOfTokenA, uint _portionOfTokenB, uint _limitOfTokenA){
        if(msg.sender != _companyA && msg.sender != _companyB) throw;
        
        votes[_voteIdentifier] = voteInfo(_voteIdentifier, _companyA,  _tokenOfA, _companyB, _tokenOfB, _portionOfTokenA, _portionOfTokenB, _limitOfTokenA);
        votes[_voteIdentifier].ifVoteUp[msg.sender] = true;
    }
    
    function voteUp(bytes32 _voteIdentifier) returns (uint) {
        if(checkVoteStatus(_voteIdentifier) != 2) return 0;     //check vote status, return 0 as vote status error
                                                                //either not exist or ended
        if(msg.sender != votes[_voteIdentifier].companyA && msg.sender != votes[_voteIdentifier].companyB)
            return 1;                                           //check if msg.sender if one of the company, return 1 if not
        votes[_voteIdentifier].ifVoteUp[msg.sender] = true;
        if(votes[_voteIdentifier].ifVoteUp[thirdParty] && votes[_voteIdentifier].ifVoteUp[votes[_voteIdentifier].companyA] && votes[_voteIdentifier].ifVoteUp[votes[_voteIdentifier].companyB])
            tokenExchange newEx = new tokenExchange(votes[_voteIdentifier].companyA, votes[_voteIdentifier].companyB,
                votes[_voteIdentifier].tokenOfA, votes[_voteIdentifier].tokenOfB, votes[_voteIdentifier].portionOfTokenA, votes[_voteIdentifier].portionOfTokenB, votes[_voteIdentifier].exchangeLimitOfA);
        return 2;
        
    }
}