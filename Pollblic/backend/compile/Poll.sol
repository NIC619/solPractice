import "./Index.sol";
pragma solidity ^0.4.10;
contract Poll
{
    // Status of the poll
    enum PollStatus {
        Preparing,
        Open,
        ShutDown
    }
    // Poll owner
    address public owner;
    // Index Contract
    address public indexContractAddr;

    // Poll meta-data
    bytes32 public                      pollID;
    PollStatus public                   contractStatus;
    uint public                         timePollEnd;
    uint public                       totalNeeded;
    uint public                       totalAnswered;
    // Remove answer encryption for now until feasible cryptography
    // can be used to protect privacy effactively
    // bool public                         ifEncrypt;
    // address public                      encryptionKey;
    // Time to wait until user can withdraw
    uint public                         periodForAnswerReview;
    mapping(address => User) public     users;
    // Questions
    uint8 public                        numberOfQuestions;              
    mapping(uint8 => Question) public   questions;
    // Number of choices to the question
    mapping(uint8 => uint8) public      numberOfChoices;
    // Revealed answers of the user
    // mapping(address => RevealedAnswer)  revealedAnswers;

    // Question details
    uint8 public NUMBER_OF_QUESTION_TYPE = 3;
    enum QuestionType {
        NotSet,
        SingleChoice,
        MultipleChoice,
        ShortAnswer
    }
    struct Question {
        QuestionType    questionType;
        string          question;
        mapping(uint8 => bytes32)        choices;
    }

    // Answer details
    struct Answer {
        bool             answered;
        mapping(uint8 => uint8)     choices;
        string           shortAnswer;
    }
    // struct RevealedAnswer {
    //     mapping(uint8 => Answer)        revealedAnswers;
    //     uint8                           numberOfRevealedAnswers;
    // }

    // User details
    // enum UserStatus {
    //     Answering,
    //     Answered,
    //     Paid,
    //     Revoked
    // }
    uint public MAX_WAIT_TIME_TO_CLAIM_REWARD = 10000000000000;
    struct User {
        // UserStatus                      status;
        // bytes32                         encryptedUserKey;
        bool                            isPaid;
        uint                            timeToClaimReward;
        mapping(uint8 => Answer)        answers;
        uint8                           numberOfAnswered;
    }

    // Constructor
    function Poll(
        bytes32 _pollID ,
        address _owner,
        uint _timePollLast,
        uint _totalNeeded,
        // bool _ifEncrypt,
        // address _encryptionKey,
        uint _periodForAnswerReview,
        uint8 _numberOfQuestions
    ) {
        pollID                  =   _pollID;
        indexContractAddr       =   msg.sender;
        owner                   =   _owner;
        timePollEnd              =   now + _timePollLast;
        totalNeeded             =   _totalNeeded;
        contractStatus          =   PollStatus.Preparing;
        // if(_ifEncrypt)
            // encryptionKey       =   _encryptionKey;
        numberOfQuestions       =   _numberOfQuestions;
        periodForAnswerReview         =   _periodForAnswerReview;
    }

    // only owner can call
    modifier onlyOwner {
        if(msg.sender == owner) {
            _;
        }
    }
    // only index contract can call
    // modifier onlyIndex {
    //     if(msg.sender == indexContractAddr) {
    //         _;
    //     }
    // }

    // GET functions
    function getQuestion(uint8 questionNumber) constant returns(QuestionType, string) {
        require(0 <= questionNumber && questionNumber < numberOfQuestions);
        return(questions[questionNumber].questionType, questions[questionNumber].question);
    }
    function getQuestionChoice(uint8 questionNumber, uint8 choiceNumber) constant returns(bytes32) {
        require(0 <= questionNumber && questionNumber < numberOfQuestions);
        require(0 <= choiceNumber && choiceNumber < numberOfChoices[questionNumber]);
        return(questions[questionNumber].choices[choiceNumber]);
    }
    function getUserStatus(address user) constant returns(string, uint) {
        if(users[user].isPaid) return("Paid", 0);
        else if(users[user].timeToClaimReward == MAX_WAIT_TIME_TO_CLAIM_REWARD)
            return("Revoked", MAX_WAIT_TIME_TO_CLAIM_REWARD);
        else if(users[user].numberOfAnswered == numberOfQuestions)
            return("Answered", users[user].timeToClaimReward);
        else if(users[user].numberOfAnswered > numberOfQuestions)
            return("Answering", 0);
        else return("No answer yet", 0);
    }
    // function getUserKey(address user) constant returns(bytes32) {
    //     return(users[user].encryptedUserKey);
    // }
    function getAnswer(address user, uint8 questionNumber) constant returns(string, uint8[]) {
        require(0 <= questionNumber && questionNumber < numberOfQuestions);
        uint8[] choices;
        for(var i=0 ; i<numberOfChoices[questionNumber] ; i++)
            choices.push(users[user].answers[questionNumber].choices[i]);
        return(users[user].answers[questionNumber].shortAnswer, choices);
    }
    // function getRevealedAnswer(address user, uint8 answerNumber) constant returns(string, uint8[]) {
    //     if(answerNumber >= numberOfQuestions) throw;
    //     return(revealedAnswers[user].revealedAnswers[answerNumber].shortAnswer, revealedAnswers[user].revealedAnswers[answerNumber].choices);
    // }

    // Add Question function
    function addQuestion(uint8 _questionNumber, uint8 _questionType, string _question, uint8 _numberOfChoices, bytes32[] _choices) onlyOwner {
        // Contract status check:   question only be added in Preparing stage
        require(contractStatus == PollStatus.Preparing);
        
        // Question format check
        require(0 <= _questionNumber && _questionNumber >= numberOfQuestions);
        require(0 < _questionType && _questionType <= NUMBER_OF_QUESTION_TYPE);
        require(questions[_questionNumber].questionType == QuestionType.NotSet);
        // Choice format check
        require(_choices.length == _numberOfChoices);
        
        questions[_questionNumber].questionType       =   QuestionType(_questionType);
        questions[_questionNumber].question           =   _question;
        if(QuestionType(_questionType) != QuestionType.ShortAnswer) {
            numberOfChoices[_questionNumber]                =   _numberOfChoices;
            for(var i = 0 ; i < _numberOfChoices ; i++){
                questions[_questionNumber].choices[i] =   _choices[i];
            }
        }      
    }

    // Remove answer encryption for now until feasible cryptography
    // can be used to protect privacy effactively
    // function addEncryptedUserKey(bytes32 _encryptedUserKey) {
    //     if(users[msg.sender].encryptedUserKey == 0x0) {
    //         users[msg.sender].encryptedUserKey = _encryptedUserKey;
    //         if(users[msg.sender].numberOfAnswered == numberOfQuestions && users[msg.sender].status == UserStatus.Answering) {
    //             users[msg.sender].timeToClaimReward      = now + periodForAnswerReview;
    //             users[msg.sender].status         = UserStatus.Answered;
    //         }
    //     }
    //     else throw;
    // }

    // Add Answer function
    function addAnswer(uint8 _questionNumber, string _shortAnswer, uint8[] _choices) {
        // Contract status check:
        require((now <= timePollEnd && contractStatus != PollStatus.Preparing)
            || (contractStatus == PollStatus.ShutDown && users[msg.sender].numberOfAnswered == 0));

        // Answer format check
        require(0 <= _questionNumber && _questionNumber < numberOfQuestions);
        // User eligibility check
        require(users[msg.sender].numberOfAnswered < numberOfQuestions
            && users[msg.sender].timeToClaimReward == 0
            && users[msg.sender].answers[_questionNumber].answered == false
        );


        if(questions[_questionNumber].questionType == QuestionType.SingleChoice) {
            require(_choices.length == 1);
            require(_choices[0] < numberOfChoices[_questionNumber]);
            users[msg.sender].answers[_questionNumber].choices[0] = _choices[0];
        }
        else if(questions[_questionNumber].questionType == QuestionType.MultipleChoice) {
            require(0 < _choices.length && _choices.length <= numberOfChoices[_questionNumber]);
            for(var i=0 ; i<=_choices.length ; i++) {
                require(_choices[i] < numberOfChoices[_questionNumber]);
                users[msg.sender].answers[_questionNumber].choices[i] = _choices[i];
            }
        }
        else {
            users[msg.sender].answers[_questionNumber].shortAnswer = _shortAnswer;
        }

        // If it's first time the user answer, increment totalAnswered by 1
        if(users[msg.sender].numberOfAnswered == 0) totalAnswered  += 1;
        users[msg.sender].answers[_questionNumber].answered = true;
        users[msg.sender].numberOfAnswered += 1;
        if(users[msg.sender].numberOfAnswered == numberOfQuestions) {
            users[msg.sender].timeToClaimReward      = now + periodForAnswerReview;
            // if((ifEncrypt && users[msg.sender].encryptedUserKey!=0) || (!ifEncrypt)) {
            //     users[msg.sender].timeToClaimReward      = now + periodForAnswerReview;
            // } 
        }
    }

    // status change and !inform index contract
    function openPoll() onlyOwner {
        require(contractStatus == PollStatus.Preparing);
        contractStatus = PollStatus.Open;
    }
    function shutDownPoll() onlyOwner {
        require(contractStatus != PollStatus.ShutDown);
        contractStatus = PollStatus.ShutDown;
        timePollEnd = now + 2 * periodForAnswerReview;
    }
    
    // Deprecate reveal user answer, leave the abusement problem to doorkeeping mechanism
    // reveal user answer
    // function revealAnswer(address _user, uint8 _questionNumber, string _shortAnswer, uint8[] _choices) onlyOwner {
    //     if(contractStatus == PollStatus.Preparing) throw;
    //     if(_questionNumber >= numberOfQuestions) throw;
    //     if(users[_user].status != UserStatus.Answered) throw;
    //     if(revealedAnswers[_user].numberOfRevealedAnswers == numberOfQuestions) throw;
    //     if(revealedAnswers[_user].revealedAnswers[_questionNumber].answered) throw;
    //     if(questions[_questionNumber].questionType == QuestionType.SingleChoice) {
    //         if(_choices.length != 1) throw;
    //         revealedAnswers[_user].revealedAnswers[_questionNumber].choices.push(_choices[0]);
    //     }
    //     else if(questions[_questionNumber].questionType == QuestionType.MultipleChoice) {
    //         if(_choices.length == 0) throw;
    //         revealedAnswers[_user].revealedAnswers[_questionNumber].choices = _choices;
    //     }
    //     else {
    //         revealedAnswers[_user].revealedAnswers[_questionNumber].shortAnswer = _shortAnswer;
    //     }

    //     revealedAnswers[_user].revealedAnswers[_questionNumber].answered = true;
    //     revealedAnswers[_user].numberOfRevealedAnswers += 1;
    //     if(revealedAnswers[_user].numberOfRevealedAnswers == numberOfQuestions) {
    //         users[_user].status                  = UserStatus.Revoked;
    //         Index index = Index(indexContractAddr);
    //         index.userAnswerRevoke(pollID, _user);
    //     }
    // }
    function revokeUser(address _user) onlyOwner {
        // Can only revoke user if he/she is answering
        // or answered but still in owner verification period
        require(users[_user].numberOfAnswered > 0 && users[_user].timeToClaimReward > now);

        users[_user].timeToClaimReward = MAX_WAIT_TIME_TO_CLAIM_REWARD;
        Index index = Index(indexContractAddr);
        index.userAnswerRevoke(pollID, _user);
    }

    function userWithdraw() {
        // User withdrawal eligibility check
        require(users[msg.sender].numberOfAnswered == numberOfQuestions && users[msg.sender].timeToClaimReward <= now);
        Index index = Index(indexContractAddr);
        require(index.userAnswerConfirm(pollID, msg.sender)) ;
        users[msg.sender].isPaid = true;
    }

}
