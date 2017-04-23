module.exports = {
    addQ: function (instance, _owner, _questionNumber, _questionType, _question, _numberOfOptions, _options) {
        return new Promise(function(resolve, reject){
            instance.addQuestion.sendTransaction(_questionNumber, _questionType, _question, _numberOfOptions, _options, {
                from: _owner,
                gas: 300000
            }, function (err, tx_id) {
                if (err) {
                    console.log("in addQ: " + err);
                    reject(err);
                } else {
                    console.log("addQ tx id: " + tx_id);
                    resolve();
                }
            });
        });
    },

    getQ: function (instance, _questionNumber) {
        return new Promise(function(resolve, reject){
            instance.getQuestion(_questionNumber, function (err, result) {
                if (err) {
                    console.log("in getQ: " + err);
                    reject(err);
                } else {
                    console.log(result[0].toString());
                    resolve();
                }
            });
        });
    },

    addA: function (instance, _user, _questionNumber, _shortAnswer, _choices) {
        return new Promise(function(resolve, reject){
            instance.addAnswer(_questionNumber, _shortAnswer, _choices, {
                from: _user,
                gas: 300000
            }, function (err, tx_id) {
                if (err) {
                    console.log("in addA: " + err);
                    reject(err);
                } else {
                    console.log("addA tx id: " + tx_id);
                    resolve();
                }
            });
        });
    },

    getA: function (instance, _user, _questionNumber) {
        return new Promise(function(resolve, reject){
            instance.getAnswer(_user, _questionNumber, function (err, result) {
                if (err) {
                    console.log("in getA: " + err);
                    reject(err);
                } else {
                    var ans = "short answer: " + result[0] + ", choice: ";
                    for (var i = 0; i < result[1].length; i++) {
                        ans += (result[1][i].toString() + " ");
                    }
                    console.log(ans);
                    resolve();
                }
            });
        });
    },

    revealA: function (instance, _owner, _user, _questionNumber, _shortAnswer, _choices) {
        return new Promise(function(resolve, reject){
            instance.revealAnswer(_user, _questionNumber, _shortAnswer, _choices,  {
                from: _owner,
                gas: 300000
            }, function (err, tx_id) {
                if (err) {
                    console.log("in revealA: " + err);
                    reject(err);
                } else {
                    console.log("revealA tx id: " + tx_id);
                    resolve();
                }
            });
        });
    },

    getRevealA: function (instance, _user, _questionNumber) {
        return new Promise(function(resolve, reject){
            instance.getRevealedAnswer(_user, _questionNumber, function (err, result) {
                if (err) {
                    console.log("in getRevealA: " + err);
                    reject(err);
                } else {
                    var ans = "short answer: " + result[0] + ", choice: ";
                    for (var i = 0; i < result[1].length; i++) {
                        ans += (result[1][i].toString() + " ");
                    }
                    console.log(ans);
                    resolve();
                }
            });
        });
    },

    getUserStatus: function (instance, _user) {
        return new Promise(function(resolve, reject){
            instance.getUserStatus(_user, function (err, result) {
                if (err) {
                    console.log("in getUserStatus: " + err);
                    reject(err);
                } else {
                    if(+result[0].toString() == 2)
                        console.log("User status: " + result[0].toString() + ", please withdraw in " + ( result[1].toString() - (new Date()).getTime() / 1000) + " secondes.");
                    else
                        console.log("User status: " + result[0].toString());
                    resolve();
                }
            });
        });
    },

    openP: function (instance, _owner) {
        return new Promise(function(resolve, reject){
            instance.openPoll({
                from: _owner,
                gas: 300000
            }, function (err, tx_id) {
                if (err) {
                    console.log("in openP: " + err);
                    reject(err);
                } else {
                    console.log("contract open!");
                    resolve();
                }
            });
        });
    },

    shutP: function (instance, _owner) {
        return new Promise(function(resolve, reject){
            instance.shutDownPoll({
                from: _owner,
                gas: 300000
            }, function (err, tx_id) {
                if (err) {
                    console.log("in shutP: " + err);
                    reject(err);
                } else {
                    console.log("contract shutted down!");
                    resolve();
                }
            });
        });
    },
    withD: function (instance, _user, _locktime) {
        return new Promise(function(resolve, reject){
            setTimeout(function(){
            instance.userWithdraw({ from: _user, gas: 300000}, function(err, tx_id){
                if (err) {
                    console.log("in withD: " + err);
                    reject(err);
                } else {
                    console.log("user withdraw!");
                    resolve();
                }
            })
            }, (_locktime + 1)*1000);
        });
    }
}