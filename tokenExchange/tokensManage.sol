pragma solidity ^0.4.2;
contract tokensManage{
    address public owner;
    struct tokens {
        string tokenName;
        address tokenContractAddr;
        uint amountIssued;
        bool isActive;
    }
    mapping (string => tokens)  tokenList;
    uint public tokenAmount;
    
    function stringsEqual(string storage _a, string memory _b) internal returns (bool) {
		bytes storage a = bytes(_a);
		bytes memory b = bytes(_b);
		if (a.length != b.length)
			return false;
		for (uint i = 0; i < a.length; i ++)
			if (a[i] != b[i])
				return false;
		return true;
    }
    
    function tokensManage(){
        owner = msg.sender;
    }
    
    modifier onlyOwner { if(msg.sender == owner) _;}
    
    function changeOwner(address newOwner) onlyOwner{
        owner = newOwner;
    }
    
    /////////Functions create/issue/revoke token
    function newToken(string _tokenName, uint _amountIssued) onlyOwner{
        if(stringsEqual(tokenList[_tokenName].tokenName, _tokenName)) throw;
        var addr = new tokenInfo(owner, _tokenName, _amountIssued);
        tokenList[_tokenName] = tokens(_tokenName, addr, _amountIssued, true);
        tokenAmount += 1;
    }
    
    function issueToken(string _tokenName, uint amount) onlyOwner{
        if(!stringsEqual(tokenList[_tokenName].tokenName, _tokenName)) throw;
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
}