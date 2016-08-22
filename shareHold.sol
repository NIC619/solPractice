contract shareHold {
    address public initiator;
    mapping ( address => uint ) public sharesMap;
    mapping ( uint => address ) public holdersMap;
    uint holdersCount;
    uint public totalShare;
    uint public totalRevenue;
    uint[] public revenuesHistory;
    bool open;

    function shareHold() {
        initiator = msg.sender;
        holdersCount = 0;
        totalShare = 0;
        totalRevenue = 0;
        open = true;
    }
    
    event record(address  _sender, uint _value);
    
    function invest(address target, uint amount) {
        if(msg.sender != initiator) throw;
        else {
            target.send(amount);
            record(target, amount);
        }
    }
    
    function joinShare() returns(bool){
        if(!open) throw;
        if(msg.sender == initiator) {
            open = false;
            return false;
        }
        if(sharesMap[msg.sender] > 0) {
            sharesMap[msg.sender] += msg.value;
            totalShare += msg.value;
            record(msg.sender, msg.value);
            return true;
        }
        else {
            sharesMap[msg.sender] = msg.value;
            holdersMap[holdersCount] = msg.sender;
            holdersCount += 1;
            totalShare += msg.value;
            record(msg.sender, msg.value);
            return true;
        }
    }

    
    function collectRevenue() {
        revenuesHistory.push(msg.value);
        totalRevenue += msg.value;
        //dispenseRevenue(msg.value);
    }
    
    function dispenseRevenue(uint amount) {
        if(msg.sender != initiator) throw;
        else {
            for(uint i=0; i < holdersCount; i++){
                holdersMap[i].send(amount*sharesMap[holdersMap[i]]/totalShare);
                record(holdersMap[i],amount*sharesMap[holdersMap[i]]/totalShare);
            }
        }
    }
}