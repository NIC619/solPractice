pragma solidity ^0.4.2;
contract AbstractIndex {

    // modifier onlyThePoll(bytes32 _id) {
    //     if(idToPollRecordMapping[_id].pollContractAddr == msg.sender)
    //         _;
    //     else throw;
    // }
                                       // should be made as a withdraw pattern instead of send
    function userAnswerConfirm(bytes32, address) returns(bool);
    // poll revoke user answer function
    function userAnswerRevoke(bytes32, address);
}