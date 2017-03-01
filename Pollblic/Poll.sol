pragma solidity ^0.4.2;
contract Poll
{
    // Index Contract
    address public indexContractAddr;

    // Overall
    enum ContractStatus {
        Preparing,
        Open,
        Close
    }
    ContractStatus public               contractStatus;
    bool public                         ifEncrypt;
    address public                      encryptionKey;
    mapping(address => User)            mapUsers;
    mapping(address => RevealedAnswer)  mapRevealedAnswer;
    uint8 public                        numberOfQuestions;
    Question[] public                   listOfQuestions;
    mapping(uint8 => uint8) public      numberOfOptions;        //number of options for certain question

    // Question
    enum QuestionType {
        SingleChoice,
        MultipleChoice,
        ShortAnswer
    }
    struct Question {
        QuestionType    questionType;
        string          question;
        string[]        options;
    }

    // Answer
    struct Answer {
        uint8            questionNumber;
        uint8[]          choices;
        string           shortAnswer;
    }
    struct RevealedAnswer {
        mapping(uint8 => Answer)        answers;
    }

    // User
    enum UserStatus {
        Answering,
        Answered,
        Paid,
        Revoked
    }
    struct User {
        UserStatus                      status;
        uint                            timeToPay;
        mapping(uint8 => Answer)         answers;
    }


    // GET functions
    function getQuestion(uint8 questionNumber) constant returns(QuestionType, string) {
        if(questionNumber >= numberOfQuestions) throw;
        return(listOfQuestions[questionNumber].questionType, listOfQuestions[questionNumber].question);
    }
    function getQuestionOption(uint8 questionNumber, uint8 optionNumber) constant returns(string) {
        if(questionNumber >= numberOfQuestions) throw;
        if(optionNumber >= listOfQuestions[questionNumber].options.length) throw;
        if(listOfQuestions[questionNumber].questionType == QuestionType.ShortAnswer) throw;
        return(listOfQuestions[questionNumber].options[optionNumber]);
    }
    function getUserStatus(address user) constant returns(UserStatus, uint) {
        return(mapUsers[user].status, mapUsers[user].timeToPay);
    }
    function getAnswer(address user, uint8 answerNumber) constant returns(string, uint8[]) {
        if(answerNumber >= numberOfQuestions) throw;
        return(mapUsers[user].answers[answerNumber].shortAnswer, mapUsers[user].answers[answerNumber].choices);
    }
    function getRevealedAnswer(address user, uint8 answerNumber) constant returns(string, uint8[]) {
        if(answerNumber >= numberOfQuestions) throw;
        return(mapRevealedAnswer[user].answers[answerNumber].shortAnswer, mapUsers[user].answers[answerNumber].choices);
    }
}
