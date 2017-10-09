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
    // Refund record
    mapping(address => uint) public refundRecord;
    // Minimum bid price
    uint public MIN_BID_PRICE;
    // Maximum iteration in automatic withdraw
    uint public MAX_ITER_COUNT;
    
    function ICOContract(uint _MIN_BID_PRICE, uint _MAX_ITER_COUNT) {
        MIN_BID_PRICE = _MIN_BID_PRICE;
        MAX_ITER_COUNT = _MAX_ITER_COUNT;
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
    
    function withdrawEther() {
        uint refund = refundRecord[msg.sender];
        if(refund > 0) {
            refundRecord[msg.sender] = 0;
            msg.sender.transfer(refund);
        }
    }
    
    // Voluntary withdraw
    function voluntaryWithdraw(address prevNode) returns(bool ifSuccess) {
        require(bidList[msg.sender].personalCap > 0);
        bool isListHead = (msg.sender == bidListHead);
        if(isListHead == false) {
            require(bidList[prevNode].nextNode == msg.sender);
            bidList[prevNode].nextNode = bidList[msg.sender].nextNode;
        }
        else
            bidListHead = bidList[msg.sender].nextNode;
        refundRecord[msg.sender] = bidList[msg.sender].contribution;
        delete bidList[msg.sender];
        totalAmount -= refundRecord[msg.sender];
        withdrawEther();
        ifSuccess = true;
    }
    
    function findBidsOfSameCap(uint cap, address startNode) internal returns(uint bidCount, uint amountSum){
        address currentNode = startNode;
        for(var i=1 ; i<MAX_ITER_COUNT ; i++) {
            if(bidList[currentNode].personalCap == cap) {
                bidCount += 1;
                amountSum += bidList[currentNode].contribution;
                currentNode = bidList[currentNode].nextNode;
            }
            else
                break;
        }
    }
    
    // Automatic withdraw
    function automaticWithdraw() {
        address currentNode;
        uint bidsToWithdraw = 0;
        uint amountToWithdraw = 0;
        uint amountSum = 0;
        for(uint i=0 ; i<MAX_ITER_COUNT ; i++) {
            if(bidsToWithdraw > 0) {
                if(amountToWithdraw / amountSum == 1) {
                    address oldHead = bidListHead;
                    bidListHead = bidList[bidListHead].nextNode;
                    refundRecord[oldHead] = bidList[oldHead].contribution;
                    totalAmount -= refundRecord[oldHead];
                    delete bidList[oldHead];
                }
                else {
                    refundRecord[currentNode] = bidList[currentNode].contribution * amountToWithdraw / amountSum + 1;
                    bidList[currentNode].contribution -= refundRecord[currentNode];
                    totalAmount -= refundRecord[currentNode];
                    currentNode = bidList[currentNode].nextNode;
                }
                bidsToWithdraw -= 1;
                continue;
            }
            // Don't have to remove any bids
            if(bidList[bidListHead].personalCap >= totalAmount)
                break;
            (bidsToWithdraw, amountSum) = findBidsOfSameCap(bidList[bidListHead].personalCap, bidListHead);
            // Number of bids to be removed exceeds MAX_ITER_COUNT
            if(bidsToWithdraw+i > MAX_ITER_COUNT)
                break;
            // Case 1: after removal of bids, cap of the bids still remain below total amount
            // in this case, remove all bids
            if(totalAmount-amountSum > bidList[bidListHead].personalCap)
                amountToWithdraw = amountSum;
            // Case 2: after removal of bids, cap of the bids exceeds total amount
            // in this case, removal partial amount of the bids
            else {
                amountToWithdraw = (totalAmount - bidList[bidListHead].personalCap);
                currentNode = bidListHead;
            }
        }
    }
}
