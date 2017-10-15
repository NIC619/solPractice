import "./Poll.sol";
pragma solidity ^0.4.10;
contract Index {


    // Overall
    // address[] public                        allOwnerList;                       // list of all owners of polls
    uint public                                 numberOfOwner = 1;
    mapping(uint => address) public             listOfOwner;             
    mapping(address => uint) public             ownerIndex;                 // index of owner in the above list
    mapping(address => PollOwner)               ownerRecord;                // mapping of owner to their record
    mapping(bytes32 => PollRecord)              pollRecord;                 // mapping of poll id to poll
    mapping(address => UserRecord)              userRecord;                 // mapping of user address to their record

    // only the poll contract can call this function 
    modifier onlyThePoll(bytes32 _id) {
        require(pollRecord[_id].contractAddr == msg.sender);
        _;
    }

    // Contructor
    // function Index() {
    // }

    // Poll contract status
    // enum PollContractStatus {
    //     Preparing,
    //     Open,
    //     ShutDown,
    //     Close
    // }
    // Poll record
    struct PollRecord {
        address                 contractAddr;
        address                 owner;
        string                  title;
        //PollContractStatus      contractStatus;
        // uint                    startTime;
        // uint                    expireTime;
        // uint                  totalNeeded;
        uint                    price;
        uint                    issuedCount;
    }
    // Poll owner record
    struct PollOwner {
        uint                        numberOfPollOwned;
        bytes32[]                   pollIDList;
    }
    
    // user
    struct UserRecord {
        uint                    totalAnswered;
        uint                    totalAccepted;
    }
    
    // GET functions
    function getUserTotalAnswered(address _user) constant returns(uint) {
        return userRecord[_user].totalAnswered;
    }
    function getUserTotalAccepted(address _user) constant returns(uint) {
        return userRecord[_user].totalAccepted;
    }
    function getPollAddrByID(bytes32 _id) constant returns(address) {
         return pollRecord[_id].contractAddr;
    }
    function getPollOwnerByID(bytes32 _id) constant returns(address) {
        return pollRecord[_id].owner;
    }
    // function getPollStatusByID(bytes32 _id) constant returns(uint) {
    //     return pollRecord[_id].contractStatus;
    // }
    // function getPollStartTimeByID(bytes32 _id) constant returns(uint) {
    //     return pollRecord[_id].startTime;
    // }
    // function getPollExpireTimeByID(bytes32 _id) constant returns(uint) {
    //     return pollRecord[_id].expireTime;
    // }
    function getPollPriceByID(bytes32 _id) constant returns(uint) {
        return pollRecord[_id].price;
    }
    function getPollIssuedCountByID(bytes32 _id) constant returns(uint) {
        return pollRecord[_id].issuedCount;
    }
    // function getPollTotalNeededByID(bytes32 _id) constant returns(uint) {
    //     return pollRecord[_id].totalNeeded;
    // }

    // Add Poll functions
    function newPoll(
                bytes32 _id,
                uint _totalNeeded,
                uint _price,
                string _title,
                uint _timePollLast,
                uint _periodForAnswerReview,
                // bool _ifEncrypt,
                // address _encryptionKey,
                uint8 _numberOfQuestions
            ) payable {
        // throw if id already exist
        // if(pollRecord[_id].startTime != 0) throw;
        require(pollRecord[_id].contractAddr == 0x0);
        
        // initiate the poll
        var newPollAddr = new Poll(
                                _id,
                                msg.sender,
                                _timePollLast,
                                _totalNeeded,
                                // _ifEncrypt,
                                // _encryptionKey,
                                _periodForAnswerReview,
                                _numberOfQuestions
                              );
        //initialize poll struct
        PollRecord memory newPollRecord = PollRecord(
                                        newPollAddr,
                                        msg.sender,
                                        _title,
                                        //PollContractStatus.Preparing,
                                        // now,
                                        // now + _timePollLast,
                                        // _totalNeeded,
                                        _price,
                                        0
                                   );
        pollRecord[_id] = newPollRecord;
        
        // update owner record
        if(ownerIndex[msg.sender] == 0) {
            ownerIndex[msg.sender] = numberOfOwner;
            listOfOwner[numberOfOwner] = msg.sender;
            numberOfOwner += 1;   
            ownerRecord[msg.sender].numberOfPollOwned = 1;
            ownerRecord[msg.sender].pollIDList.push(_id);
        }
        else {
            ownerRecord[msg.sender].numberOfPollOwned += 1;
            ownerRecord[msg.sender].pollIDList.push(_id);
        }
    }

    // update poll status, may be called by the poll only
    /*
    function updatePollStatus(bytes32 _id, uint8 _contractStatus) onlyThePoll(_id) return(bool) {
        // open the poll
        if(PollContractStatus(_contractStatus) == PollContractStatus.Open) {
            if(pollRecord[_id].contractStatus == PollContractStatus.Preparing){
                pollRecord[_id].contractStatus = PollContractStatus.Open;
                return true;
            }
            else
                return false;
        }
        // shut down the poll
        else if(PollContractStatus(_contractStatus) == PollContractStatus.ShutDown) {
            if(pollRecord[_id].contractStatus == PollContractStatus.Preparing || pollRecord[_id].contractStatus == PollContractStatus.Open){
                pollRecord[_id].contractStatus = PollContractStatus.ShutDown;
                return true;
            }
            else
                return false;
        }
        // close the poll, optional by owner because there has not yet been a function to enforce
        else {
            if(pollRecord[_id].contractStatus == PollContractStatus.Open){
                pollRecord[_id].contractStatus = PollContractStatus.Close;
                return true;
            }
            else
                return false;
        }
        
    }
    */

    // poll confirm user answer function, return true if payment made successfully
    function userAnswerConfirm(bytes32 _id, address _user) onlyThePoll(_id) external returns(bool) {
        if(_user.send(pollRecord[_id].price * (10**18) )) {
            pollRecord[_id].issuedCount += 1;
            if(userRecord[_user].totalAnswered == 0) {
                userRecord[_user] = UserRecord(1, 1);
            }
            else {
                userRecord[_user].totalAnswered += 1;
                userRecord[_user].totalAccepted += 1;
            }
            return true;
        }
        else return false;
    }
    // poll revoke user answer function
    function userAnswerRevoke(bytes32 _id, address _user) onlyThePoll(_id) external returns(bool){
        if(userRecord[_user].totalAnswered == 0) {
            userRecord[_user] = UserRecord(1, 0);
        }
        else {
            userRecord[_user].totalAnswered += 1;
        }
        return true;
    }
}