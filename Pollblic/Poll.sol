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
    mapping(address => User) public     mapUsers;
    mapping(address => RevealedAnswer)  mapRevealedAnswer;
    uint8 public                        numberOfQuestions;
    Question[] public                   listOfQuestions;
    mapping(uint8 => uint8) public      numberOfOptions;        //number of options for certain question

    // Question
    enum QuestionType {
        NotSet,
        SingleChoice,
        MultipleChoice,
        ShortAnswer
    }
    struct Question {
        QuestionType    questionType;
        string          question;
        mapping(uint8 => bytes32)        options;
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

    // Constructor
    function Poll(bool _ifEncrypt, address _encryptionKey, uint8 _numberOfQuestions ) {
        indexContractAddr   =   msg.sender;
        contractStatus      =   ContractStatus.Preparing;
        if(_ifEncrypt)
            encryptionKey   =   _encryptionKey;
        numberOfQuestions   =   _numberOfQuestions;
        listOfQuestions.length  =   _numberOfQuestions;
        
    }

    // GET functions
    function getQuestion(uint8 questionNumber) constant returns(QuestionType, string) {
        if(questionNumber >= numberOfQuestions) throw;
        return(listOfQuestions[questionNumber].questionType, listOfQuestions[questionNumber].question);
    }
    function getQuestionOption(uint8 questionNumber, uint8 optionNumber) constant returns(bytes32) {
        if(questionNumber >= numberOfQuestions) throw;
        if(optionNumber >= numberOfOptions[questionNumber]) throw;
        if(listOfQuestions[questionNumber].questionType == QuestionType.ShortAnswer || listOfQuestions[questionNumber].questionType == QuestionType.NotSet) return 0x0;
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

    // Add Question function
    function addQuestion(uint8 _questionNumber, uint8 _questionType, string _question, uint8 _numberOfOptions, bytes32[] _options) {
        if(_questionNumber >= numberOfQuestions) throw;
        if(_questionType > 3 || _questionType <= 0) throw;
        if(listOfQuestions[_questionNumber].questionType != QuestionType.NotSet) throw;
        listOfQuestions[_questionNumber].questionType       =   QuestionType(_questionType);
        listOfQuestions[_questionNumber].question           =   _question;
        if(_questionType != 3) {
            numberOfOptions[_questionNumber]                =   _numberOfOptions;
            for(var i = 0 ; i < _numberOfOptions ; i++){
                listOfQuestions[_questionNumber].options[i] =   _options[i];
            }
        }      
    }
    function addAnswer(uint8 _questionNumber, string _shortAnswer, uint8[] _choices) {
        
    }
}
