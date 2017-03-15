import "./AbstractIndex.sol";
pragma solidity ^0.4.2;
contract Poll
{
    address public owner;
    // Index Contract
    address public indexContractAddr;

    // Overall
    enum ContractStatus {
        Preparing,
        Open,
        ShutDown,
        Close
    }
    // poll meta-data
    bytes32 public                      pollID;
    ContractStatus public               contractStatus;
    uint public                         expireTime;
    uint64 public                       totalNeeded;
    uint64 public                       totalAnswered;
    bool public                         ifEncrypt;
    address public                      encryptionKey;
    // lock time
    uint public                         paymentLockTime;                // time to wait until user can withdraw
    uint public                         shutDownTime;                   // time until which user can no longer add answer
    // user 
    mapping(address => User) public     mapUsers;                       // mapping of user address to user record
    // question
    uint8 public                        numberOfQuestions;              
    Question[] public                   listOfQuestions;
    mapping(uint8 => uint8) public      numberOfOptions;                // number of options for certain question
    mapping(address => RevealedAnswer)  mapRevealedAnswer;              // mapping of user address to revealed answer record

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
        //uint8            questionNumber;
        bool             answered;
        uint8[]          choices;
        string           shortAnswer;
    }
    struct RevealedAnswer {
        bool                            ifAllRevealed;
        mapping(uint8 => Answer)        revealedAnswers;
        uint8                           revealedAnswersCount;
    }

    // User
    enum UserStatus {
        NotSet,
        Answering,
        Answered,
        Paid,
        Revoked
    }
    struct User {
        UserStatus                      status;
        uint                            timeToPay;
        mapping(uint8 => Answer)        answers;
        uint8                           answeredCount;
    }

    // Constructor
    function Poll(bytes32 _pollID ,address _owner, uint _expireTime, uint64 _totalNeeded, bool _ifEncrypt, address _encryptionKey, uint _paymentLockTime, uint8 _numberOfQuestions ) {
        pollID                  =   _pollID;
        indexContractAddr       =   msg.sender;
        owner                   =   _owner;
        expireTime              =   _expireTime;
        totalNeeded             =   _totalNeeded;
        contractStatus          =   ContractStatus.Preparing;
        if(_ifEncrypt)
            encryptionKey       =   _encryptionKey;
        numberOfQuestions       =   _numberOfQuestions;
        listOfQuestions.length  =   _numberOfQuestions;
        paymentLockTime         =   _paymentLockTime;
    }

    // only owner can call
    modifier onlyOwner {
        if(msg.sender == owner) {
            _;
        }
    }
    // only index contract can call
    modifier onlyIndex {
        if(msg.sender == indexContractAddr) {
            _;
        }
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
        return(mapRevealedAnswer[user].revealedAnswers[answerNumber].shortAnswer, mapUsers[user].answers[answerNumber].choices);
    }

    // Add Question function
    function addQuestion(uint8 _questionNumber, uint8 _questionType, string _question, uint8 _numberOfOptions, bytes32[] _options) onlyOwner {
        // contract status check:   question only be added in Preparing stage
        if(contractStatus == ContractStatus.Open || contractStatus == ContractStatus.Close || contractStatus == ContractStatus.ShutDown) throw;
        
        // input format check
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

    // Add Answer function
    function addAnswer(uint8 _questionNumber, string _shortAnswer, uint8[] _choices) {
        // contract status check:
        // Open stage:  everyone can add answer
        // ShutDown or Close stage: can only finish unfinished questions, before shutDownTime
        if(now > expireTime) throw;
        if(contractStatus == ContractStatus.Preparing) throw;
        if(contractStatus == ContractStatus.ShutDown) {
            if(mapUsers[msg.sender].answeredCount == 0) throw;
            if(shutDownTime > 0 && now > shutDownTime) throw;
        }

        // input format check
        if(_questionNumber >= numberOfQuestions) throw;
        if(mapUsers[msg.sender].answeredCount == numberOfQuestions) throw;
        if(mapUsers[msg.sender].answers[_questionNumber].answered) throw;

        // if it's first time the user answer, increment totalAnswered by 1 and close the poll if limit reached
        if(mapUsers[msg.sender].status == UserStatus.NotSet) {
            mapUsers[msg.sender].status = UserStatus.Answering;
            totalAnswered  += 1;
            if(totalAnswered >= totalNeeded) 
                contractStatus = ContractStatus.Close;
        }

        if(listOfQuestions[_questionNumber].questionType == QuestionType.SingleChoice) {
            if(_choices.length != 1) throw;
            if(_choices[0] >= numberOfOptions[_questionNumber]) throw;
            mapUsers[msg.sender].answers[_questionNumber].choices.push(_choices[0]);
        }
        else if(listOfQuestions[_questionNumber].questionType == QuestionType.MultipleChoice) {
            if(_choices.length == 0) throw;
            for(var i = 0; i <= _choices.length; i++) {
                if(_choices[i] >= numberOfOptions[_questionNumber]) throw;
                mapUsers[msg.sender].answers[_questionNumber].choices.push( _choices[i]);
            }
        }
        else {
            mapUsers[msg.sender].answers[_questionNumber].shortAnswer = _shortAnswer;
        }

        mapUsers[msg.sender].answers[_questionNumber].answered = true;
        mapUsers[msg.sender].answeredCount += 1;
        if(mapUsers[msg.sender].answeredCount == numberOfQuestions) {
            mapUsers[msg.sender].timeToPay      = now + paymentLockTime;
            mapUsers[msg.sender].status         = UserStatus.Answered;
        }
    }

    // status change and !inform index contract
    function openPoll() onlyOwner {
        if(contractStatus == ContractStatus.Preparing) {
            //AbstractIndex index = AbstractIndex(indexContractAddr);
            //if(!index.updatePollStatus(id, PollContractStatus.Open)) throw;
            contractStatus = ContractStatus.Open;
        }
        else throw;
    }
    function shutDownPoll() onlyOwner {
        if(contractStatus == ContractStatus.Preparing || contractStatus == ContractStatus.Open) {
            //AbstractIndex index = AbstractIndex(indexContractAddr);
            //if(!index.updatePollStatus(id, PollContractStatus.ShutDown)) throw;
            contractStatus = ContractStatus.ShutDown;
            shutDownTime = now + 2 * paymentLockTime;                                                               //need to adjust the lock time
        }
        else throw;
    }
    /*
    function closePoll() onlyOwner {
        if(contractStatus == ContractStatus.Close) {
            //AbstractIndex index = AbstractIndex(indexContractAddr);
            //if(!index.updatePollStatus(id, PollContractStatus.Close)) throw;
        }
        else throw;
    }
    */
    
    // reveal user answer
    function revealAnswer(address _user, uint8 _questionNumber, string _shortAnswer, uint8[] _choices) onlyOwner {
        if(contractStatus == ContractStatus.Preparing) throw;
        if(_questionNumber >= numberOfQuestions) throw;
        if(mapUsers[_user].status != UserStatus.Answered) throw;
        if(mapRevealedAnswer[_user].revealedAnswersCount == numberOfQuestions) throw;
        if(mapRevealedAnswer[_user].revealedAnswers[_questionNumber].answered) throw;
        if(listOfQuestions[_questionNumber].questionType == QuestionType.SingleChoice) {
            if(_choices.length != 1) throw;
            mapRevealedAnswer[_user].revealedAnswers[_questionNumber].choices.push(_choices[0]);
        }
        else if(listOfQuestions[_questionNumber].questionType == QuestionType.MultipleChoice) {
            if(_choices.length == 0) throw;
            mapRevealedAnswer[_user].revealedAnswers[_questionNumber].choices = _choices;
        }
        else {
            mapRevealedAnswer[_user].revealedAnswers[_questionNumber].shortAnswer = _shortAnswer;
        }

        mapRevealedAnswer[_user].revealedAnswers[_questionNumber].answered = true;
        mapRevealedAnswer[_user].revealedAnswersCount += 1;
        if(mapRevealedAnswer[_user].revealedAnswersCount == numberOfQuestions) {
            mapRevealedAnswer[_user].ifAllRevealed  = true;
            mapUsers[_user].status                  = UserStatus.Revoked;
            AbstractIndex index = AbstractIndex(indexContractAddr);
            index.userAnswerRevoke(pollID, _user);
        }
    }

    function userWithdraw() {
        if(mapUsers[msg.sender].status == UserStatus.Answered && mapUsers[msg.sender].timeToPay <= now) {
            mapUsers[msg.sender].status = UserStatus.Paid;
            AbstractIndex index = AbstractIndex(indexContractAddr);
            if(!index.userAnswerConfirm(pollID, msg.sender)) throw;
        }
        else throw;
    }

}
