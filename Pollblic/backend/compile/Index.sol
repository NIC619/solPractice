import "./Poll.sol";
pragma solidity ^0.4.10;
contract Index {


    // Overall
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

    // Poll record
    struct PollRecord {
        address                 contractAddr;
        address                 owner;
        string                  title;
        //PollContractStatus      contractStatus;
        // uint                    startTime;
        // uint                    expireTime;
        // uint                  totalNeeded;
        // uint                    price;
        // uint                    issuedCount;
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
    
    // Events
    event NewPoll(
        address owner,
        bytes32 pollID
    );

    event NewUserActivity(
        address user,
        bool ifRevoke
    );
    
    // GET functions
    // function getUserTotalAnswered(address _user) constant returns(uint) {
    //     return userRecord[_user].totalAnswered;
    // }
    // function getUserTotalAccepted(address _user) constant returns(uint) {
    //     return userRecord[_user].totalAccepted;
    // }
    function getPollOwnedByOwner(address _owner) constant returns(bytes32[]) {
        return ownerRecord[_owner].pollIDList;
    }
    function getPollAddrByID(bytes32 _id) constant returns(address) {
        return pollRecord[_id].contractAddr;
    }
    function getPollOwnerByID(bytes32 _id) constant returns(address) {
        return pollRecord[_id].owner;
    }
    // function getPollPriceByID(bytes32 _id) constant returns(uint) {
    //     return pollRecord[_id].price;
    // }
    // function getPollIssuedCountByID(bytes32 _id) constant returns(uint) {
    //     return pollRecord[_id].issuedCount;
    // }
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
                uint8 _numberOfQuestions
                // bool _ifEncrypt,
                // address _encryptionKey,
            ) payable {
        // throw if id already exist
        // if(pollRecord[_id].startTime != 0) throw;
        require(pollRecord[_id].contractAddr == 0x0);
        
        // initiate the poll
        var newPollAddr = (new Poll).value(msg.value)(
                                _id,
                                msg.sender,
                                _timePollLast,
                                _totalNeeded,
                                _price,
                                // _ifEncrypt,
                                // _encryptionKey,
                                _periodForAnswerReview,
                                _numberOfQuestions
                              );
        //initialize poll struct
        PollRecord memory newPollRecord = PollRecord(
                                        newPollAddr,
                                        msg.sender,
                                        _title
                                        // block.number,
                                        // block.number + _timePollLast,
                                        // _totalNeeded,
                                        // _price,
                                        // 0
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
        NewPoll(msg.sender, _id);
    }

    // poll confirm user answer
    function userAnswerConfirm(bytes32 _id, address _user) onlyThePoll(_id) external returns(bool) {
        if(userRecord[_user].totalAnswered == 0) {
            userRecord[_user] = UserRecord(1, 1);
        }
        else {
            userRecord[_user].totalAnswered += 1;
            userRecord[_user].totalAccepted += 1;
        }
        NewUserActivity(_user, true);
        return true;
    }
    // poll revoke user answer
    function userAnswerRevoke(bytes32 _id, address _user) onlyThePoll(_id) external returns(bool){
        if(userRecord[_user].totalAnswered == 0) {
            userRecord[_user] = UserRecord(1, 0);
        }
        else {
            userRecord[_user].totalAnswered += 1;
        }
        NewUserActivity(_user, false);
        return true;
    }
}