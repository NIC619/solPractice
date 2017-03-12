pragma solidity ^0.4.2;
contract Index {


    // Overall
    address public                          anonymousUserAddr;
    mapping(string=>PollRecord) public      titleToPollRecordMapping;
    mapping(address=>UserRecord) public     userRecordMapping;


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
        uint32                  expireTime;
        uint64                  totalNeeded;
        uint64                  price;
        uint64                  issuedCount;
        string                  title;
    }
    // Poll owner record
    struct PollOwner {
        uint                        totalPollStarted;
        mapping(uint=>PollRecord)   pollRecordList;
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
    function getPollAddrByTitle(string _title) constant returns(address) {
        return titleToPollRecordMapping[_title].pollContractAddr;
    }
    function getPollOwnerByTitle(string _title) constant returns(address) {
        return titleToPollRecordMapping[_title].owner;
    }
    function getPollStatusByTitle(string _title) constant returns(uint) {
        return titleToPollRecordMapping[_title].contractStatus;
    }
    function getPollStartTimeByTitle(string _title) constant returns(uint32) {
        return titleToPollRecordMapping[_title].startTime;
    }
    function getPollExpireTimeByTitle(string _title) constant returns(uint32) {
        return titleToPollRecordMapping[_title].expireTime;
    }
    function getPollPriceByTitle(string _title) constant returns(uint64) {
        return titleToPollRecordMapping[_title].price;
    }
    function getPollIssuedCountByTitle(string _title) constant returns(uint64) {
        return titleToPollRecordMapping[_title].issuedCount;
    }
    function getPollTotalNeededByTitle(string _title) constant returns(uint64) {
        return titleToPollRecordMapping[_title].totalNeeded;
    }

}