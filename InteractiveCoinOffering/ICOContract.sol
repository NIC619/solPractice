pragma solidity ^0.4.10;
contract ICOContract {
    // Bid structure
    struct Bid {
        uint contribution;
        uint personalCap;
        address nextNode;
    }
    // Bid linked-list sorted by personalCap
    mapping(address => Bid) bidList;
    // Head of bid linked-list
    address public bidListHead;
    
    // Total amount of ETH raised
    uint public totalAmount;
    // Minimum bid price
    uint public MIN_BID_PRICE;
    
    function ICOContract(uint _MIN_BID_PRICE) {
        MIN_BID_PRICE = _MIN_BID_PRICE;
    }
    
    function bid(address prevNode, uint _personalCap) payable returns(bool ifSuccess) {
        require(msg.value >= MIN_BID_PRICE);
        require(bidList[msg.sender].personalCap == 0);
        require(_personalCap >= bidList[prevNode].personalCap);
        bool isListEmpty = (bidListHead == 0x0);
        if(isListEmpty == false)
            require(prevNode != 0x0);
        address nextNode = bidList[prevNode].nextNode;
        if(bidList[nextNode].personalCap > 0)
            require(_personalCap <= bidList[nextNode].personalCap);
        
        bidList[msg.sender] = Bid(msg.value, _personalCap, nextNode);
        if(isListEmpty) {
            bidListHead = msg.sender;
        }
        else {
            bidList[prevNode].nextNode = msg.sender;
        }
        totalAmount += msg.value;
        ifSuccess = true;
    }
    
    function changePersonalCap(uint _newPersonalCap) returns(bool ifSuccess) {
        require(bidList[msg.sender].personalCap > 0);
        
        bidList[msg.sender].personalCap = _newPersonalCap;
        ifSuccess = true;
    }
    
    function withdrawBid(address prevNode) returns(bool ifSuccess) {
        require(bidList[msg.sender].personalCap > 0);
        bool isListHead = (msg.sender == bidListHead);
        if(isListHead == false) {
            require(bidList[prevNode].nextNode == msg.sender);
            bidList[prevNode].nextNode = bidList[msg.sender].nextNode;
        }
        else
            bidListHead = bidList[msg.sender].nextNode;
        uint contribution = bidList[msg.sender].contribution;
        delete bidList[msg.sender];
        totalAmount -= contribution;
        msg.sender.transfer(contribution);
        ifSuccess = true;
    }
}
