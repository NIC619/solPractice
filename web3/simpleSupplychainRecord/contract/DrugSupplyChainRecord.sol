pragma solidity^0.4.10;

contract DrugSupplyChainRecord {
    uint participantCount;
    mapping(uint=>address) participants;
    
    uint drugAmount;
    mapping(uint=>string) drugName;
    
    struct DrugDetail {
        address owner;
        
        uint amount;
        string manuDate;
        string expDate;

        uint upstreamDrugCount;
        mapping(uint=>string) upstreamDrugName;
        mapping(string=>uint) upstreamDrugIndex;
        mapping(uint=>uint) upstreamDrugAmount;
        mapping(uint=>bool) ifOwnerAckUpstreamDrug;
        mapping(uint=>bool) ifUpstreamOwnerAck;
        
        uint downstreamDrugCount;
        mapping(uint=>string) downstreamDrugName;
        mapping(string=>uint) downstreamDrugIndex;
        mapping(uint=>uint) downstreamDrugAmount;
        mapping(uint=>bool) ifOwnerAckDownstreamDrug;
        mapping(uint=>bool) ifDownstreamOwnerAck;
    }
    
    mapping(string=>DrugDetail) drugs;

    function getDrugOwner(string _drugName) returns (address _owner) {
        _owner = drugs[_drugName].owner;
    }

    function getUpstreamDrugInfo(string _curDrugName, string upstreamDrugName) returns(uint _amount, bool _ifOwnerAckUpstreamDrug, bool _ifUpstreamOwnerAck) {
        uint index = drugs[_curDrugName].upstreamDrugIndex[upstreamDrugName];
        _amount = drugs[_curDrugName].upstreamDrugAmount[index];
        _ifOwnerAckUpstreamDrug = drugs[_curDrugName].ifOwnerAckUpstreamDrug[index];
        _ifUpstreamOwnerAck = drugs[_curDrugName].ifUpstreamOwnerAck[index];
    }

    function getDownStreamInfo(string _curDrugName, string downstreamDrugName) returns(uint _amount, bool _ifOwnerAckDownstreamDrug, bool _ifDownstreamOwnerAck) {
        uint index = drugs[_curDrugName].downstreamDrugIndex[downstreamDrugName];
        _amount = drugs[_curDrugName].downstreamDrugAmount[index];
        _ifOwnerAckDownstreamDrug = drugs[_curDrugName].ifOwnerAckDownstreamDrug[index];
        _ifDownstreamOwnerAck = drugs[_curDrugName].ifDownstreamOwnerAck[index];
    }


    function addNewParticipant(address _participant){
        participants[participantCount] = _participant;
        participantCount += 1;
    }

    function addNewDrug(string _drugName, string _manudate, string _expdate, uint _drugAmount) {
        require(drugs[_drugName].owner == 0x0);
        drugs[_drugName].owner = msg.sender;
        drugName[drugAmount]=_drugName;
        drugAmount += 1;
        drugs[_drugName].amount = _drugAmount;
        drugs[_drugName].manuDate = _manudate;
        drugs[_drugName].expDate = _expdate;
    }

    
    function addDrugStream(string _upstreamDrugName, string _downstreamDrugName, uint _amount) {
        require(msg.sender == this.getDrugOwner(_upstreamDrugName) || msg.sender == this.getDrugOwner(_downstreamDrugName));
        this.addUpstreamDrug(_downstreamDrugName, _upstreamDrugName, _amount);
        this.addDownstreamDrug(_upstreamDrugName, _downstreamDrugName, _amount);
    }

    function addUpstreamDrug(string _curDrugName, string _upstreamDrugName, uint _amount) internal {
        uint index = drugs[_curDrugName].upstreamDrugIndex[_upstreamDrugName];
        if(drugs[_curDrugName].ifOwnerAckUpstreamDrug[index] == false && drugs[_curDrugName].ifUpstreamOwnerAck[index] == false) {
            index = drugs[_curDrugName].upstreamDrugCount + 1;
            drugs[_curDrugName].upstreamDrugName[index] = _upstreamDrugName;
            drugs[_curDrugName].upstreamDrugIndex[_upstreamDrugName] = index;
            drugs[_curDrugName].upstreamDrugAmount[index] = _amount;
            drugs[_curDrugName].upstreamDrugCount += 1;
        }
        if(msg.sender == this.getDrugOwner(_curDrugName)) {
            drugs[_curDrugName].ifOwnerAckUpstreamDrug[index] = true;
        }
        else {
            drugs[_curDrugName].ifUpstreamOwnerAck[index] = true;
        }
    }
    function addDownstreamDrug(string _curDrugName, string _downstreamDrugName, uint _amount) internal {
        uint index = drugs[_curDrugName].upstreamDrugIndex[_downstreamDrugName];
        if(drugs[_curDrugName].ifOwnerAckDownstreamDrug[index] == false && drugs[_curDrugName].ifDownstreamOwnerAck[index] == false) {
            index = drugs[_curDrugName].downstreamDrugCount + 1;
            drugs[_curDrugName].downstreamDrugName[index] = _downstreamDrugName;
            drugs[_curDrugName].downstreamDrugIndex[_downstreamDrugName] = index;
            drugs[_curDrugName].downstreamDrugAmount[index] = _amount;
            drugs[_curDrugName].downstreamDrugCount += 1;
        }
        if(msg.sender == this.getDrugOwner(_curDrugName)) {
            drugs[_curDrugName].ifOwnerAckDownstreamDrug[index] = true;
        }
        else {
            drugs[_curDrugName].ifDownstreamOwnerAck[index] = true;
        }
    }
}