import "./Poll.sol";
pragma solidity ^0.4.2;
contract Index {


    // Overall
    address[] public                        allOwnerList;                       // list of all owners of polls
    mapping(address=>uint)                  ownerIndexInAllOwnerList;           // index of owner in the above list
    mapping(address=>PollOwner)             ownerRecordMapping;                 // mapping of owner to their record
    mapping(bytes32=>PollRecord)            idToPollRecordMapping;              // mapping of poll id to poll
    mapping(address=>UserRecord)            userRecordMapping;                  // mapping of user address to their record

    // only the poll contract can call this function 
    modifier onlyThePoll(bytes32 _id) {
        if(idToPollRecordMapping[_id].pollContractAddr == msg.sender)
            _;
        else throw;
    }

    // Contructor
    function Index() {
        allOwnerList.push(0x0);
    }

    // Poll contract status
    enum PollContractStatus {
        Preparing,
        Open,
        ShutDown,
        Close
    }
    // Poll record
    struct PollRecord {
        address                 pollContractAddr;
        address                 owner;
        //PollContractStatus      contractStatus;
        uint                    startTime;
        uint                    expireTime;
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
    // function getPollStatusByID(bytes32 _id) constant returns(uint) {
    //     return idToPollRecordMapping[_id].contractStatus;
    // }
    function getPollStartTimeByID(bytes32 _id) constant returns(uint) {
        return idToPollRecordMapping[_id].startTime;
    }
    function getPollExpireTimeByID(bytes32 _id) constant returns(uint) {
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
                uint _lifeTime,
                uint _paymentLockTime,
                bool _ifEncrypt,
                address _encryptionKey,
                uint8 _numberOfQuestions
            ) payable {
        // throw if id already exist
        if(idToPollRecordMapping[_id].startTime != 0) throw;

        // initiate the poll
        var newPollAddr = new Poll(_id, msg.sender, now + _lifeTime, _totalNeeded, _ifEncrypt, _encryptionKey, _paymentLockTime, _numberOfQuestions);
        //initialize poll struct
        PollRecord memory newPollRecord = PollRecord(
                                        newPollAddr,
                                        msg.sender,
                                        //PollContractStatus.Preparing,
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

    // update poll status, may be called by the poll only
    /*
    function updatePollStatus(bytes32 _id, uint8 _contractStatus) onlyThePoll(_id) return(bool) {
        // open the poll
        if(PollContractStatus(_contractStatus) == PollContractStatus.Open) {
            if(idToPollRecordMapping[_id].contractStatus == PollContractStatus.Preparing){
                idToPollRecordMapping[_id].contractStatus = PollContractStatus.Open;
                return true;
            }
            else
                return false;
        }
        // shut down the poll
        else if(PollContractStatus(_contractStatus) == PollContractStatus.ShutDown) {
            if(idToPollRecordMapping[_id].contractStatus == PollContractStatus.Preparing || idToPollRecordMapping[_id].contractStatus == PollContractStatus.Open){
                idToPollRecordMapping[_id].contractStatus = PollContractStatus.ShutDown;
                return true;
            }
            else
                return false;
        }
        // close the poll, optional by owner because there has not yet been a function to enforce
        else {
            if(idToPollRecordMapping[_id].contractStatus == PollContractStatus.Open){
                idToPollRecordMapping[_id].contractStatus = PollContractStatus.Close;
                return true;
            }
            else
                return false;
        }
        
    }
    */

    // poll confirm user answer function, return true if payment made successfully
                                                                                              // should be made as a withdraw pattern instead of send
    function userAnswerConfirm(bytes32 _id, address _user) onlyThePoll(_id) returns(bool) {
        if(_user.send(idToPollRecordMapping[_id].price)) {
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
    function userAnswerRevoke(bytes32 _id, address _user) onlyThePoll(_id) {
        if(userRecordMapping[_user].totalAnswered == 0) {
            userRecordMapping[_user] = UserRecord(1, 0);
        }
        else {
            userRecordMapping[_user].totalAnswered += 1;
        }
    }
}