pragma solidity ^0.4.2;
contract Index {


    // Overall
    address public                          anonymousUserAddr;
    address[] public                        allOwnerList;
    mapping(address=>uint)                  ownerIndexInAllOwnerList;
    mapping(address=>PollOwner)             ownerRecordMapping;
    mapping(bytes32=>PollRecord)            idToPollRecordMapping;
    mapping(address=>UserRecord)            userRecordMapping;
    mapping(address=>bool)                  ifPollContractCanCall;      //true only if poll contract status is open

    modifier canPollCall {
        if(!ifPollContractCanCall[msg.sender]) throw;
    }

    // Contructor
    function Index(address _anonymousUserAddr) {
        anonymousUserAddr = _anonymousUserAddr;
        allOwnerList.push(0x0);
    }

    // Poll contract status
    enum PollContractStatus {
        Preparing,
        Open,
        Close
    }
    // Poll record
    struct PollRecord {
        address                 pollContractAddr;
        address                 owner;
        PollContractStatus      contractStatus;
        uint32                  startTime;
        uint32                  expireTime;             //currently not used
        uint64                  totalNeeded;
        uint64                  price;
        uint64                  issuedCount;
        string                  title;
    }
    // Poll owner record
    struct PollOwner {
        uint                        totalPollStarted;
        bytes32[]                   pollIDList;
    }
    
    // user
    struct UserRecord {
        uint                    totalAnswered;
        uint                    totalAccepted;
    }
    
    // GET functions
    function getUserTotalAnswered(address _user) constant returns(uint) {
        return userRecordMapping[_user].totalAnswered;
    }
    function getUserTotalAccepted(address _user) constant returns(uint) {
        return userRecordMapping[_user].totalAccepted;
    }
    function getPollAddrByID(bytes32 _id) constant returns(address) {
        return idToPollRecordMapping[_id].pollContractAddr;
    }
    function getPollOwnerByID(bytes32 _id) constant returns(address) {
        return idToPollRecordMapping[_id].owner;
    }
    function getPollStatusByID(bytes32 _id) constant returns(uint) {
        return idToPollRecordMapping[_id].contractStatus;
    }
    function getPollStartTimeByID(bytes32 _id) constant returns(uint32) {
        return idToPollRecordMapping[_id].startTime;
    }
    function getPollExpireTimeByID(bytes32 _id) constant returns(uint32) {
        return idToPollRecordMapping[_id].expireTime;
    }
    function getPollPriceByID(bytes32 _id) constant returns(uint64) {
        return idToPollRecordMapping[_id].price;
    }
    function getPollIssuedCountByID(bytes32 _id) constant returns(uint64) {
        return idToPollRecordMapping[_id].issuedCount;
    }
    function getPollTotalNeededByID(bytes32 _id) constant returns(uint64) {
        return idToPollRecordMapping[_id].totalNeeded;
    }

    // Add Poll functions
    function newPoll(
                bytes32 _id,
                uint64 _totalNeeded,
                uint64 _price,
                string _title,
                uint32 _lifeTime,
                bool _ifEncrypt,
                address _encryptionKey,
                uint8 _numberOfQuestions
            ) payable {
        // throw if id already exist
        if(idToPollRecordMapping[_id].startTime != 0) throw;

        // initiate the poll
        var newPollAddr = new Poll(_id, msg.sender, _ifEncrypt, _encryptionKey, _numberOfQuestions);
        PollRecord newPollRecord = PollRecord(
                                        newPollAddr,
                                        msg.sender,
                                        PollContractStatus.Preparing,
                                        now,
                                        now + _lifeTime,
                                        _totalNeeded,
                                        _price,
                                        0,
                                        _title
                                   );
        idToPollRecordMapping[_id] = newPollRecord;
        
        // update owner record
        if(ownerIndexInAllOwnerList[msg.sender] == 0) {
            ownerIndexInAllOwnerList[msg.sender] = allOwnerList.length;
            allOwnerList.push(msg.sender);   
            ownerRecordMapping[msg.sender].totalPollStarted = 1;
            ownerRecordMapping[msg.sender].pollIDList.push(_id);
        }
        else {
            ownerRecordMapping[msg.sender].totalPollStarted += 1;
            ownerRecordMapping[msg.sender].pollIDList.push(_id);
        }
    }

    // poll inform its status
    function updatePollStatus(bytes32 _id, bool trueForOpen) return(bool) {
        if(idToPollRecordMapping[_id].pollContractAddr != msg.sender) throw;
        if(trueForOpen) {
            if(idToPollRecordMapping[_id].contractStatus == PollContractStatus.Preparing){
                idToPollRecordMapping[_id].contractStatus = PollContractStatus.Open;
                ifPollContractCanCall[msg.sender] = true;
                return true;
            }
            else
                return false;
        }
        else {
            if(idToPollRecordMapping[_id].contractStatus == PollContractStatus.Open){
                idToPollRecordMapping[_id].contractStatus = PollContractStatus.Close;
                ifPollContractCanCall[msg.sender] = false;
                return true;
            }
            else
                return false;
        }
        
    }

    // poll confirm user answer function
    function userAnswerConfirm(bytes32 _id, address _user) canPollCall returns(bool) {
        if(user.send(idToPollRecordMapping[_id].price)) {
            idToPollRecordMapping[_id].issuedCount += 1;
            if(userRecordMapping[_user].totalAnswered == 0) {
                userRecordMapping[_user] = UserRecord(1, 1);
            }
            else {
                userRecordMapping[_user].totalAnswered += 1;
                userRecordMapping[_user].totalAccepted += 1;
            }
            return true;
        }
        else return false;
    }
    // poll revoke user answer function
    function userAnswerRevoke(bytes32 _id, address _user) canPollCall {
        if(userRecordMapping[_user].totalAnswered == 0) {
            userRecordMapping[_user] = UserRecord(1, 0);
        }
        else {
            userRecordMapping[_user].totalAnswered += 1;
        }
    }
}