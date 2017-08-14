pragma solidity ^ 0.4.10;

contract simpleVote {
    address[] public candidateList;
    mapping(address => uint8) public votesReceived;
    mapping(address => bool) public isCandidateValid;

    function simpleVote(address[] candidates) {
        for(var i = 0; i< candidates.length; i++){
            isCandidateValid[candidates[i]] = true;
        }

        candidateList = candidates;
    }

    // GET vote count of the candidate
    // function totalVotesFor(address candidate) returns(uint8) {
    //     if (isCandidateValid[candidate]) == false) throw;
    //     return votesReceived[candidate];
    // }

    // vote for the candidate
    function vote(address candidate) {
        if (isCandidateValid[candidate] == false) throw;
        votesReceived[candidate] += 1;
    }
}