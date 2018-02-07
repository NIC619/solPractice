pragma solidity^0.4.10;

contract DrugSupplyChainRecord {
    uint participantCount;
    mapping(uint=>address) participants;
    
    uint drugAmount;
    mapping(uint=>string) drugName;
    
    struct ManufacturerDetail {
        uint amount;
        mapping(uint=>string) drugName;
    }

    mapping(address=>ManufacturerDetail) manufacturers;

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

    // Constructor
    function DrugSupplyChainRecord() {
        addNewParticipant(msg.sender);
    }

    // Helper functions
    function getDrugOwner(string _drugName) constant returns (address _owner) {
        _owner = drugs[_drugName].owner;
    }

    function getDrugsAmountByOwner(address _owner) constant returns (uint _amount) {
        _amount = manufacturers[_owner].amount;
    }

    function getDrugsOwnedByOwner(address _owner, uint _index) constant returns (string _drugName) {
        _drugName = manufacturers[_owner].drugName[_index];
    }

    function getDrugDetail(string _drugName) constant returns (address _owner, uint _amount, string _manuDate, string _expDate, uint _upstreamDrugCount, uint _downstreamDrugCount) {
         _owner = drugs[_drugName].owner;
         _amount = drugs[_drugName].amount;
         _manuDate = drugs[_drugName].manuDate;
         _expDate = drugs[_drugName].expDate;
         _upstreamDrugCount = drugs[_drugName].upstreamDrugCount;
         _downstreamDrugCount = drugs[_drugName].downstreamDrugCount;
    }

    function getUpstreamDrugInfoByIndex(string _curDrugName, uint index) constant returns(string _name, uint _amount, bool _ifOwnerAckUpstreamDrug, bool _ifUpstreamOwnerAck) {
        _name = drugs[_curDrugName].upstreamDrugName[index];
        _amount = drugs[_curDrugName].upstreamDrugAmount[index];
        _ifOwnerAckUpstreamDrug = drugs[_curDrugName].ifOwnerAckUpstreamDrug[index];
        _ifUpstreamOwnerAck = drugs[_curDrugName].ifUpstreamOwnerAck[index];
    }

    function getDownstreamDrugInfoByIndex(string _curDrugName, uint index) constant returns(string _name, uint _amount, bool _ifOwnerAckDownstreamDrug, bool _ifDownstreamOwnerAck) {
        _name = drugs[_curDrugName].downstreamDrugName[index];
        _amount = drugs[_curDrugName].downstreamDrugAmount[index];
        _ifOwnerAckDownstreamDrug = drugs[_curDrugName].ifOwnerAckDownstreamDrug[index];
        _ifDownstreamOwnerAck = drugs[_curDrugName].ifDownstreamOwnerAck[index];
    }

    function getUpstreamDrugInfo(string _curDrugName, string _upstreamDrugName) constant returns(uint _amount, bool _ifOwnerAckUpstreamDrug, bool _ifUpstreamOwnerAck) {
        uint index = drugs[_curDrugName].upstreamDrugIndex[_upstreamDrugName];
        _amount = drugs[_curDrugName].upstreamDrugAmount[index];
        _ifOwnerAckUpstreamDrug = drugs[_curDrugName].ifOwnerAckUpstreamDrug[index];
        _ifUpstreamOwnerAck = drugs[_curDrugName].ifUpstreamOwnerAck[index];
    }

    function getDownStreamDrugInfo(string _curDrugName, string _downstreamDrugName) constant returns(uint _amount, bool _ifOwnerAckDownstreamDrug, bool _ifDownstreamOwnerAck) {
        uint index = drugs[_curDrugName].downstreamDrugIndex[_downstreamDrugName];
        _amount = drugs[_curDrugName].downstreamDrugAmount[index];
        _ifOwnerAckDownstreamDrug = drugs[_curDrugName].ifOwnerAckDownstreamDrug[index];
        _ifDownstreamOwnerAck = drugs[_curDrugName].ifDownstreamOwnerAck[index];
    }

    // Verify drug
    function isDrugDistributeValid(string _curDrugName) constant returns(bool isValid) {
        uint downStreamDistributeAmount = 0;
        for(var i = 1 ; i <= drugs[_curDrugName].downstreamDrugCount ; i++) {
            if(drugs[_curDrugName].ifOwnerAckDownstreamDrug[i] && drugs[_curDrugName].ifDownstreamOwnerAck[i]) {
                downStreamDistributeAmount += drugs[_curDrugName].downstreamDrugAmount[i];
            }
        }
        isValid = downStreamDistributeAmount < drugs[_curDrugName].amount;
    }

    // Add participant
    function addNewParticipant(address _participant){
        participants[participantCount + 1] = _participant;
        participantCount += 1;
    }

    // Add drug and detatil
    function addNewDrug(string _drugName, string _manudate, string _expdate, uint _drugAmount) {
        require(drugs[_drugName].owner == 0x0);
        drugs[_drugName].owner = msg.sender;
        drugName[drugAmount]=_drugName;
        drugAmount += 1;
        drugs[_drugName].amount = _drugAmount;
        drugs[_drugName].manuDate = _manudate;
        drugs[_drugName].expDate = _expdate;

        manufacturers[msg.sender].drugName[manufacturers[msg.sender].amount] = _drugName;
        manufacturers[msg.sender].amount += 1;
    }

    function addDrugStream(string _upstreamDrugName, string _downstreamDrugName, uint _amount) {
        require(getDrugOwner(_upstreamDrugName) != getDrugOwner(_downstreamDrugName));
        require(msg.sender == getDrugOwner(_upstreamDrugName) || msg.sender == getDrugOwner(_downstreamDrugName));
        assert(sha3(_upstreamDrugName) != sha3(_downstreamDrugName));
        addUpstreamDrug(_downstreamDrugName, _upstreamDrugName, _amount);
        addDownstreamDrug(_upstreamDrugName, _downstreamDrugName, _amount);
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
        else {
            require(drugs[_curDrugName].upstreamDrugAmount[index] == _amount);
        }
        if(msg.sender == getDrugOwner(_curDrugName)) {
            drugs[_curDrugName].ifOwnerAckUpstreamDrug[index] = true;
        }
        else {
            drugs[_curDrugName].ifUpstreamOwnerAck[index] = true;
        }
    }
    function addDownstreamDrug(string _curDrugName, string _downstreamDrugName, uint _amount) internal {
        uint index = drugs[_curDrugName].downstreamDrugIndex[_downstreamDrugName];
        if(drugs[_curDrugName].ifOwnerAckDownstreamDrug[index] == false && drugs[_curDrugName].ifDownstreamOwnerAck[index] == false) {
            index = drugs[_curDrugName].downstreamDrugCount + 1;
            drugs[_curDrugName].downstreamDrugName[index] = _downstreamDrugName;
            drugs[_curDrugName].downstreamDrugIndex[_downstreamDrugName] = index;
            drugs[_curDrugName].downstreamDrugAmount[index] = _amount;
            drugs[_curDrugName].downstreamDrugCount += 1;
        }
        else {
            require(drugs[_curDrugName].downstreamDrugAmount[index] == _amount);
        }
        if(msg.sender == getDrugOwner(_curDrugName)) {
            drugs[_curDrugName].ifOwnerAckDownstreamDrug[index] = true;
        }
        else {
            drugs[_curDrugName].ifDownstreamOwnerAck[index] = true;
        }
    }
}