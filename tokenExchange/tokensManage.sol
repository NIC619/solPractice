pragma solidity ^0.4.2;
contract tokenInfo{
    address public ownerContract;                               //tokenManage contract
    address public multisigAddr;
    string public tokenName;
    uint public amountIssued;
    bool public isActive;
    struct holders {                                            //this could be simply replaced by uint amount
        //address holder;                                       //if amount is the only information stored here
        uint amount;
        //uint expireTime;                                      //implement if token will expire
        //bool isRecordExist;
    }
    mapping (address => holders) public holderMapping;          //map address to their token holding
    mapping (address => bool) public exchangeContractMapping;   //record if certain exchange contracts are related to us
    //address[] public holderList;
    
    modifier permissionCheck {          //check if caller is owner or priviledged exchange contracts
        if( exchangeContractMapping[msg.sender] != true && msg.sender != ownerContract) throw;
        _;
    }
    modifier onlyOwnerContract { if(msg.sender == ownerContract) _;}
    modifier onlyMultisig { if(msg.sender == multisigAddr) _;}
    
    
    //function tokenInfo(string _tokenName, uint _amountIssued, uint _expireTime) {
    function tokenInfo(string _tokenName, uint _amountIssued, address _multisigAddr) {
        ownerContract = msg.sender;
        multisigAddr = _multisigAddr;
        tokenName = _tokenName;
        amountIssued = _amountIssued;
        isActive = true;
        //holderMapping[msg.sender] = holders(_amountIssued, _expireTime, true);
        holderMapping[msg.sender] = holders(_amountIssued);
        //holderList.push(msg.sender);
    }
    
    
    /////////Functions update exchange contracts information
    function newExchangeContract(address addr) onlyMultisig {
        exchangeContractMapping[addr] = true;
    }
    
    function deleteExchangeContract(address addr) onlyMultisig {
        exchangeContractMapping[addr] = false;
    }
    
    
    /////////Functions issue/revoke token
    function issue(uint _amount) onlyOwnerContract {        //for now, owner can issue as many as he want
        holderMapping[ownerContract].amount += _amount;             //if specific permission controll is desired,
    }                                                       //just modify the modifier
    
    function revoke() onlyOwnerContract {                   //same as above
        isActive = false;
    }
    
    
    /////////Functions update status of each token holders
    function update(address _giver, address _taker, uint _amount) permissionCheck returns (bool){
        if(_taker == 0x0){                                  //redeem tokens, no taker specified
            if(holderMapping[_giver].amount >= _amount){    //check his token balance
                holderMapping[_giver].amount -= _amount;
                return true;
            }
            else
                return false;
        }
        else if(holderMapping[_giver].amount >= _amount){
            holderMapping[_giver].amount -= _amount;
            holderMapping[_taker].amount += _amount;
            return true;
        }
        else
            return false;
    }
    
    
    //below functions are implemented with setting in which we assume token will expire
    /*
    function update(uint _type, address _giver, address _taker, uint _amount) onlyOwner returns (uint){
        //taker condition check
        if(!holderMapping[_taker].isRecordExist) {                                                //initialize if not exist
             holderMapping[_taker] = holders(0, 0, true);
             holderList.push(_taker);
        }
        if((holderMapping[_taker].expireTime < now) && (holderMapping[_taker].expireTime > 0)) {  //initialize if expire
            holderMapping[_taker].amount = 0;
            holderMapping[_taker].expireTime = 0;
        }
        
        if(_type == 1) {    //add
            uint giverExpireTime = holderMapping[_giver].expireTime;
            uint takerExpireTime = holderMapping[_taker].expireTime;
            if((giverExpireTime > now) && (holderMapping[_giver].amount >= _amount)){          //(1)if giver condition checked
                if(giverExpireTime >= takerExpireTime){                                     //(2)if giver's token last longer
                    if(takerExpireTime == 0) {                                              //(3)if taker doesn't have token
                        holderMapping[_taker].amount = _amount;
                    }
                    else {                                                                  //(3)if taker has token
                        holderMapping[_taker].amount = _amount + holderMapping[_taker].amount*(takerExpireTime-now)/(giverExpireTime-now);
                    }
                    holderMapping[_taker].expireTime = giverExpireTime;
                }
                else {                                                                      //(2)if taker's token last longer
                    holderMapping[_taker].amount += _amount*giverExpireTime/takerExpireTime;
                }
            }
            else return 0;                                                                  //return 0 for operation failure
            return 1;                                                                       //return 1 for operation success
        }
        else if(_type == 2) {   //sub
            if(holderMapping[_taker].amount < _amount) return 0;
            else {
                holderMapping[_taker].amount -= _amount;
                if(holderMapping[_taker].amount == 0) holderMapping[_taker].expireTime = 0;
                return 1;
            }
        }
        else return 0;
    }
    
    function expireCheck() onlyOwner {
        for(uint i = 0 ; i < holderList.length ; i++) {
            if(holderMapping[holderList[i]].expireTime <= now) {
                holderMapping[holderList[i]].amount = 0;
                holderMapping[holderList[i]].expireTime = 0;
            }
        }
    }
    */
    
}
contract tokenExchange{
	address public companyA;
	address public companyB;
	address public tokenOfA;
	address public tokenOfB;	
	address public multisigAddr;
	uint public portionOfTokenA;
	uint public portionOfTokenB;
	uint exchangeLimitOfA;
	uint public currentExchangeLimitOfA;
	bool public isValid;

	function tokenExchange(address _companyA, address _companyB, address _tokenOfA, address _tokenOfB, uint _portionOfTokenA, uint _portionOfTokenB, uint _exchangeLimitOfA){
		companyA = _companyA;
		companyB = _companyB;
		tokenOfA = _tokenOfA;
		tokenOfB = _tokenOfB;
		multisigAddr = msg.sender;
		portionOfTokenA = _portionOfTokenA;
		portionOfTokenB = _portionOfTokenB;
		exchangeLimitOfA = _exchangeLimitOfA;
		currentExchangeLimitOfA = exchangeLimitOfA;
		isValid = true;
	}

    modifier validCheck {
        if(isValid) _;
    }

	modifier onlyMultisigAddr{
		if(msg.sender == multisigAddr) _;
	}

    function exchange(address _giver, uint _amountOfToken) validCheck returns(uint){
        uint _amountOfTokenA;
        uint _amountOfTokenB;
        if(msg.sender == companyA){
            if(_amountOfToken <= currentExchangeLimitOfA){                                  //check if balance is enough
    			_amountOfTokenB = (_amountOfToken/portionOfTokenA)*portionOfTokenB;
    			_amountOfTokenA = (_amountOfTokenB/portionOfTokenB)*portionOfTokenA;
    			if( tokenInfo(tokenOfA).update(_giver, companyB, _amountOfTokenA) )          //first token update
    			{
    				if( tokenInfo(tokenOfB).update(companyB, _giver, _amountOfTokenB) ){    //second token update
    				    currentExchangeLimitOfA -= _amountOfTokenA;                          //current limit update 
    				    if(currentExchangeLimitOfA == 0){
    					    isValid = false;                                                //shut down
    					    return _amountOfTokenB;                                         //return amount exchanged
    				    }
    				}
    				else throw;                                                             //second token update fail
    			}
    			else{
    				throw;                                                                  //first token update fail
    			}
		    }
		    else return 1;                                                                  //balance not enough, return 1
        }
        else if(msg.sender == companyB){
            _amountOfTokenA = (_amountOfToken/portionOfTokenB)*portionOfTokenA;
            _amountOfTokenB = (_amountOfTokenA/portionOfTokenA)*portionOfTokenB;
    		if(_amountOfTokenA <= currentExchangeLimitOfA){
    			if( tokenInfo(tokenOfA).update(_giver, companyB, _amountOfTokenA) )
    			{
    				if( tokenInfo(tokenOfB).update(companyB, _giver, _amountOfTokenB) ){
    				    currentExchangeLimitOfA -= _amountOfTokenA;
    				    if(currentExchangeLimitOfA == 0){
    					    isValid = false;
    					    return _amountOfTokenA;
    				    }
    				}
    				else throw;
    			}
    			else{
    				throw;
    			}
    		}
    		else return 1;
        }
        else return 0;                                                                      //neither company A or B makes this call, return 0
    }
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

contract tokensManage{
    address public owner;
    address public multiSigAddr;
    struct tokens {
        string tokenName;
        address tokenContractAddr;
        uint amountIssued;
        bool isActive;
    }
    mapping (string => tokens)  tokenList;  //record all tokens owned
    uint public tokenAmount;
    
    modifier onlyOwner { if(msg.sender == owner) _;}
    
    /////////Utility Functions - string compare
    function stringsEqual(string storage _a, string memory _b) internal constant returns (bool) {
		bytes storage a = bytes(_a);
		bytes memory b = bytes(_b);
		if (a.length != b.length)
			return false;
		for (uint i = 0; i < a.length; i ++)
			if (a[i] != b[i])
				return false;
		return true;
    }
    
    /////////Constructor
    function tokensManage(address _multiSigAddr){
        owner = msg.sender;
        multiSigAddr = _multiSigAddr;
    }

    /////////Functions updating ownership
    function changeOwner(address newOwner) onlyOwner{
        owner = newOwner;
    }
    
    /////////Functions create/issue/revoke token
    function newToken(string _tokenName, uint _amountIssued) onlyOwner{
        if(stringsEqual(tokenList[_tokenName].tokenName, _tokenName)) throw;    //check if this tokenName has been used before
        var addr = new tokenInfo(_tokenName, _amountIssued, multiSigAddr);
        tokenList[_tokenName] = tokens(_tokenName, addr, _amountIssued, true);
        tokenAmount += 1;
    }
    
    function issueToken(string _tokenName, uint amount) onlyOwner{
        if(!stringsEqual(tokenList[_tokenName].tokenName, _tokenName) || !tokenList[_tokenName].isActive) throw;
            //check if this token really exist and is active right now
        tokenInfo token = tokenInfo(tokenList[_tokenName].tokenContractAddr);
        token.issue(amount);
        tokenList[_tokenName].amountIssued += amount;
    }
    
    function revokeToken(string _tokenName) onlyOwner{
        if(tokenList[_tokenName].isActive == true) {
            tokenInfo token = tokenInfo(tokenList[_tokenName].tokenContractAddr);
            token.revoke();
            tokenList[_tokenName].isActive = false;
            tokenAmount -= 1;
        }
    }
    
    /////////Functions checking status of a token
    function checkStatus(string _tokenName) constant returns(bool){
        return tokenList[_tokenName].isActive; 
    }
    
    function checkAmountIssued(string _tokenName) constant returns(uint){
        return tokenList[_tokenName].amountIssued; 
    }
    
    /////////Functions to vote
    function newExchangeContract(bytes32 _voteIdentifier, address _companyB, string _tokenName, address _tokenOfB, uint _portionOfTokenA, uint _portionOfTokenB, uint _limitOfTokenA) onlyOwner{
        if(!stringsEqual(tokenList[_tokenName].tokenName, _tokenName) || !tokenList[_tokenName].isActive) throw;
        
        multiSig multi = multiSig(multiSigAddr);
        multi.newVote(_voteIdentifier, this, _companyB, tokenList[_tokenName].tokenContractAddr, _tokenOfB, _portionOfTokenA, _portionOfTokenB, _limitOfTokenA);
    }
    
    function toVote(bytes32 _voteIdentifier) onlyOwner returns(uint){
        multiSig multi = multiSig(multiSigAddr);
        return multi.voteUp(_voteIdentifier);
    }
    
    /////////Functions to make update, exchange
    function toExchange(address exchangeContractAddr, address giver, uint amountOfToken) onlyOwner returns(uint){
        tokenExchange ex = tokenExchange(exchangeContractAddr);
        return ex.exchange(giver, amountOfToken);
    }
    
    function toUpdate(string tokenName, address giver, address taker, uint amount) onlyOwner returns(bool){
        tokenInfo token = tokenInfo(tokenList[tokenName].tokenContractAddr);
        return token.update(giver, taker, amount);
    }
}