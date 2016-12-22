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