contract GameScoreBet {
    address initiator;
    uint totalStake;
    mapping ( address => uint ) stakeOption1;
    mapping ( address => uint ) stakeOption2;
    mapping ( address => uint ) stakeOption3;
    mapping ( address => uint ) stakeOption4;
    uint sumStake1;
    uint sumStake2;
    uint sumStake3;
    uint sumStake4;
    address[] listOption1; //list of participants of Option1
    address[] listOption2;
    address[] listOption3;
    address[] listOption4; //list of participants of Option4
    bool isOpen;

    function GameScoreBet() {
        initiator = msg.sender;
        totalStake = 0;
        sumStake1 = 0;
        sumStake2 = 0;
        sumStake3 = 0;
        sumStake4 = 0;
        isOpen = true;
    }

    function betOption1() {
        if (!isOpen) throw; 
        else {
            if(stakeOption1[msg.sender] > 0) {
                stakeOption1[msg.sender] += msg.value;
                sumStake1 += msg.value;
                totalStake += msg.value;
            }
            else {
                listOption1.push(msg.sender);
                stakeOption1[msg.sender] = msg.value;
                sumStake1 += msg.value;
                totalStake += msg.value;
            }
        }
    }

    function betOption2() {
        if (!isOpen) throw; 
        else {
            if(stakeOption2[msg.sender] > 0) {
                stakeOption2[msg.sender] += msg.value;
                sumStake2 += msg.value;
                totalStake += msg.value;
            }
            else {
                listOption2.push(msg.sender);
                stakeOption2[msg.sender] = msg.value;
                sumStake2 += msg.value;
                totalStake += msg.value;
            }
        }
    }
    
    function betOption3() {
        if (!isOpen) throw; 
        else {
            if(stakeOption3[msg.sender] > 0) {
                stakeOption3[msg.sender] += msg.value;
                sumStake3 += msg.value;
                totalStake += msg.value;
            }
            else {
                listOption3.push(msg.sender);
                stakeOption3[msg.sender] = msg.value;
                sumStake3 += msg.value;
                totalStake += msg.value;
            }
        }
    }
    
    function betOption4() {
        if (!isOpen) throw; 
        else {
            if(stakeOption4[msg.sender] > 0) {
                stakeOption4[msg.sender] += msg.value;
                sumStake4 += msg.value;
                totalStake += msg.value;
            }
            else {
                listOption4.push(msg.sender);
                stakeOption4[msg.sender] = msg.value;
                sumStake4 += msg.value;
                totalStake += msg.value;
            }
        }
    }
    
    function betStop() {
        if (msg.sender != initiator) throw;
        else {
            isOpen = false;
        }
    }
    
    function settle(uint opt) internal {
        if(opt == 1) {
            for(uint i = 0;i < listOption1.length; i++) {
                listOption1[i].send(totalStake * (stakeOption1[listOption1[i]] / sumStake1) );
            }
        }
        else if(opt == 2) {
            for(uint j = 0;j < listOption2.length; j++) {
                listOption2[j].send(totalStake * (stakeOption2[listOption2[j]] / sumStake2) );
            }
        }
        else if(opt == 3) {
            for(uint k = 0;k < listOption3.length; k++) {
                listOption3[k].send(totalStake * (stakeOption3[listOption3[k]] / sumStake3) );
            }
        }
        else if(opt == 4) {
            for(uint p = 0;p < listOption4.length; p++) {
                listOption4[p].send(totalStake * (stakeOption4[listOption4[p]] / sumStake4) );
            }
        }
        else throw;
    }
    
    function getScore(uint answer) {
        if(msg.sender != initiator) throw;      //initiator could be replaced with score supplier
        else {
            isOpen = false;
            settle(answer);
        }
    }

    function getTotalStake() constant returns (uint) {
        return totalStake;
    }
}