pragma solidity ^0.4.10;
contract ICOContract {
    // Sale parameters
    // Start time(block) of the sale
    uint public startBlock;
    // Total amount of token sold
    uint public totalTokenAmount;
    // Amount of tokens in exchange for one native currency
    uint public EXCHANGE_RATIO;
    // Minimum bid price
    uint public MIN_BID_PRICE;
    // Maximum iteration in automatic withdraw
    uint public MAX_ITER_COUNT;
    // Duration valid for Voluntary withdraw(in blocks)
    uint public VOLUNTARY_WITHDRAW_DURATION;
    // Duration of the sale(in blocks)
    uint public SALE_DURATION;

    // Bid structure
    struct Bid {
        uint amountPaid;
        uint amountTokenGet;
        uint personalCap;
        address nextNode;
    }

    // Bid linked-list sorted by personalCap
    mapping(address => Bid) bidList;
    // Head of bid linked-list
    address public bidListHead;
    // Refund record
    mapping(address => uint) public refundRecord;
    
    
    function ICOContract(uint _EXCHANGE_RATIO, uint _MIN_BID_PRICE, uint _MAX_ITER_COUNT, uint _VOLUNTARY_WITHDRAW_DURATION, uint _SALE_DURATION) {
        require(_SALE_DURATION > _VOLUNTARY_WITHDRAW_DURATION);
        EXCHANGE_RATIO = _EXCHANGE_RATIO;
        MIN_BID_PRICE = _MIN_BID_PRICE;
        MAX_ITER_COUNT = _MAX_ITER_COUNT;
        VOLUNTARY_WITHDRAW_DURATION = _VOLUNTARY_WITHDRAW_DURATION;
        
        startBlock = block.number;
        SALE_DURATION = _SALE_DURATION;
    }
    
    function convertToToken(uint value) internal returns(uint amountToken) {
        if(block.number <= startBlock+VOLUNTARY_WITHDRAW_DURATION) {
            // If bid during volutary withdraw period,
            // bidder gets 10%-20% more tokens.
            amountToken = (value * 110 / 100) + (value * (10 * (startBlock+VOLUNTARY_WITHDRAW_DURATION - block.number)/VOLUNTARY_WITHDRAW_DURATION) / 100);
        }
        else if(block.number <= startBlock+SALE_DURATION) {
            // If bid after volutary withdraw period,
            // bidder gets 0%-10% more tokens.
            amountToken = value + (value * (10 * (startBlock+SALE_DURATION - block.number)/(SALE_DURATION-VOLUNTARY_WITHDRAW_DURATION)) / 100);
        }
        else
            amountToken = value;
    }

    function bid(address prevNode, uint _personalCap) payable returns(bool ifSuccess) {
        require(block.number <= startBlock+SALE_DURATION);
        require(msg.value >= MIN_BID_PRICE);
        require(bidList[msg.sender].personalCap == 0);
        require(_personalCap >= bidList[prevNode].personalCap);
        
        bool isListEmpty = (bidListHead == 0x0);
        if(isListEmpty == false)
            require(prevNode != 0x0);
        address nextNode = bidList[prevNode].nextNode;
        if(bidList[nextNode].personalCap > 0)
            require(_personalCap <= bidList[nextNode].personalCap);
        
        uint _amountTokenGet = convertToToken(msg.value);
        bidList[msg.sender] = Bid(msg.value, _amountTokenGet, _personalCap, nextNode);
        if(isListEmpty) {
            bidListHead = msg.sender;
        }
        else {
            bidList[prevNode].nextNode = msg.sender;
        }
        totalTokenAmount += msg.value;
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
        require(block.number <= startBlock+VOLUNTARY_WITHDRAW_DURATION);
        require(bidList[msg.sender].personalCap > 0);
        bool isListHead = (msg.sender == bidListHead);
        if(isListHead == false) {
            require(bidList[prevNode].nextNode == msg.sender);
            bidList[prevNode].nextNode = bidList[msg.sender].nextNode;
        }
        else
            bidListHead = bidList[msg.sender].nextNode;
        refundRecord[msg.sender] = bidList[msg.sender].amountPaid;
        totalTokenAmount -= bidList[msg.sender].amountTokenGet;
        delete bidList[msg.sender];
        withdrawEther();
        ifSuccess = true;
    }
    
    function findBidsOfSameCap(uint cap, address startNode) internal returns(uint bidCount, uint amountSum){
        address currentNode = startNode;
        for(var i=1 ; i<MAX_ITER_COUNT ; i++) {
            if(bidList[currentNode].personalCap == cap) {
                bidCount += 1;
                amountSum += bidList[currentNode].amountTokenGet;
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
                    refundRecord[oldHead] = bidList[oldHead].amountPaid;
                    totalTokenAmount -= bidList[oldHead].amountTokenGet;
                    delete bidList[oldHead];
                }
                else {
                    refundRecord[currentNode] = bidList[currentNode].amountPaid * amountToWithdraw / amountSum;
                    bidList[currentNode].amountPaid -= refundRecord[currentNode];
                    bidList[currentNode].amountTokenGet -= bidList[currentNode].amountTokenGet * amountToWithdraw / amountSum;
                    totalTokenAmount -= bidList[currentNode].amountTokenGet * amountToWithdraw / amountSum;
                    currentNode = bidList[currentNode].nextNode;
                }
                bidsToWithdraw -= 1;
                continue;
            }
            // Don't have to remove any bids
            if(bidList[bidListHead].personalCap >= totalTokenAmount)
                break;
            (bidsToWithdraw, amountSum) = findBidsOfSameCap(bidList[bidListHead].personalCap, bidListHead);
            // Number of bids to be removed exceeds MAX_ITER_COUNT
            if(bidsToWithdraw+i > MAX_ITER_COUNT)
                break;
            // Case 1: after removal of bids, cap of the bids still remain below total amount
            // in this case, remove all bids
            if(totalTokenAmount-amountSum > bidList[bidListHead].personalCap)
                amountToWithdraw = amountSum;
            // Case 2: after removal of bids, cap of the bids exceeds total amount
            // in this case, removal partial amount of the bids
            else {
                amountToWithdraw = (totalTokenAmount - bidList[bidListHead].personalCap);
                currentNode = bidListHead;
            }
        }
    }
}
