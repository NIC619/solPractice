module.exports = {
    addQuestion: function (instance, _owner, _questionNumber, _questionType, _question, _numberOfOptions, _choices) {
        return new Promise(function(resolve, reject){
            instance.addQuestion.sendTransaction(_questionNumber, _questionType, _question, _numberOfOptions, _choices, {
                from: _owner,
                gas: 300000
            }, function (err, tx_id) {
                if (err) {
                    console.log("in addQuestion: " + err);
                    reject(err);
                } else {
                    console.log("addQuestion tx id: " + tx_id);
                    resolve();
                }
            });
        });
    },

    getQuestion: function (instance, _questionNumber) {
        return new Promise(function(resolve, reject){
            instance.getQuestion(_questionNumber, function (err, result) {
                if (err) {
                    console.log("in getQuestion: " + err);
                    reject(err);
                } else {
                    console.log(result[0].toString());
                    console.log(result[1]);
                    resolve([result[0].toString(), result[1]]);
                }
            });
        });
    },

    getQuestionChoice: function (instance, _questionNumber, _choiceNumber) {
        return new Promise(function(resolve, reject){
            instance.getQuestionChoice(_questionNumber, _choiceNumber, function (err, result) {
                if (err) {
                    console.log("in getQuestionChoice: " + err);
                    reject(err);
                } else {
                    // console.log(result);
                    resolve(result);
                }
            });
        });
    },

    addAnswer: function (instance, _user, _questionNumber, _shortAnswer, _choices) {
        return new Promise(function(resolve, reject){
            instance.addAnswer(_questionNumber, _shortAnswer, _choices, {
                from: _user,
                gas: 300000
            }, function (err, tx_id) {
                if (err) {
                    console.log("in addAnswer: " + err);
                    reject(err);
                } else {
                    console.log("addAnswer tx id: " + tx_id);
                    resolve();
                }
            });
        });
    },

    getAnswer: function (instance, _user, _questionNumber) {
        return new Promise(function(resolve, reject){
            instance.getAnswer(_user, _questionNumber, function (err, result) {
                if (err) {
                    console.log("in getAnswer: " + err);
                    reject(err);
                } else {
                    var ans = "short answer: " + result[0] + ", choice: ";
                    for (var i = 0; i < result[1].length; i++) {
                        ans += (result[1][i].toString() + " ");
                    }
                    console.log(ans);
                    resolve(result[0], result[1]);
                }
            });
        });
    },

    // revealA: function (instance, _owner, _user, _questionNumber, _shortAnswer, _choices) {
    //     return new Promise(function(resolve, reject){
    //         instance.revealAnswer(_user, _questionNumber, _shortAnswer, _choices,  {
    //             from: _owner,
    //             gas: 300000
    //         }, function (err, tx_id) {
    //             if (err) {
    //                 console.log("in revealA: " + err);
    //                 reject(err);
    //             } else {
    //                 console.log("revealA tx id: " + tx_id);
    //                 resolve();
    //             }
    //         });
    //     });
    // },

    // getRevealA: function (instance, _user, _questionNumber) {
    //     return new Promise(function(resolve, reject){
    //         instance.getRevealedAnswer(_user, _questionNumber, function (err, result) {
    //             if (err) {
    //                 console.log("in getRevealA: " + err);
    //                 reject(err);
    //             } else {
    //                 var ans = "short answer: " + result[0] + ", choice: ";
    //                 for (var i = 0; i < result[1].length; i++) {
    //                     ans += (result[1][i].toString() + " ");
    //                 }
    //                 console.log(ans);
    //                 resolve();
    //             }
    //         });
    //     });
    // },

    getUserStatus: function (instance, _user) {
        return new Promise(function(resolve, reject){
            instance.getUserStatus(_user, function (err, result) {
                if (err) {
                    console.log("in getUserStatus: " + err);
                    reject(err);
                } else {
                    if(+result[0].toString() == 'Answered')
                        console.log("User status: " + result[0] + ", please withdraw after block no." + result[1].toString());
                    else
                        console.log("User status: " + result[0]);
                    resolve(result[0], result[1].toString());
                }
            });
        });
    },

    openPoll: function (instance, _owner) {
        return new Promise(function(resolve, reject){
            instance.openPoll({
                from: _owner,
                gas: 300000
            }, function (err, tx_id) {
                if (err) {
                    console.log("in openPoll: " + err);
                    reject(err);
                } else {
                    console.log("Poll opened!");
                    resolve();
                }
            });
        });
    },

    shutDownPoll: function (instance, _owner) {
        return new Promise(function(resolve, reject){
            instance.shutDownPoll({
                from: _owner,
                gas: 300000
            }, function (err, tx_id) {
                if (err) {
                    console.log("in shutDownPoll: " + err);
                    reject(err);
                } else {
                    console.log("Poll shutted down!");
                    resolve();
                }
            });
        });
    },

    revokeUser: function (instance, _owner, _user) {
        return new Promise(function(resolve, reject){
            instance.revokeUser(_user, { from: _owner, gas: 300000}, function(err, tx_id){
                if (err) {
                    console.log("in revokeUser: " + err);
                    reject(err);
                } else {
                    console.log("revoke user: " + _user);
                    resolve();
                }
            });
        });
    },

    userWithdraw: function (instance, _user) {
        return new Promise(function(resolve, reject){
            instance.userWithdraw({ from: _user, gas: 300000}, function(err, tx_id){
                if (err) {
                    console.log("in userWithdraw: " + err);
                    reject(err);
                } else {
                    console.log("user: " + _user + " withdraw!");
                    resolve();
                }
            });
        });
    }
}