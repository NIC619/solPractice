pragma solidity ^0.4.2;
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
