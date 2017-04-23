module.exports = {
    addQ: function (instance, _owner, _questionNumber, _questionType, _question, _numberOfOptions, _options, cb) {
        instance.addQuestion.sendTransaction(_questionNumber, _questionType, _question, _numberOfOptions, _options, {
            from: _owner,
            gas: 300000
        }, function (err, result) {
            if (err) {
                console.log("in addQ: " + err);
                return;
            } else {
                console.log("addQ tx id: " + result);
            }
            cb(result);
        });
    },

    getQ: function (instance, _questionNumber, cb) {
        instance.getQuestion(_questionNumber, function (err, result) {
            if (err) {
                console.log("in getQ: " + err);
                return;
            } else {
                console.log(result[0].toString());
            }
            cb();
        })
    },

    addA: function (instance, _user, _questionNumber, _shortAnswer, _choices, cb) {
        instance.addAnswer(_questionNumber, _shortAnswer, _choices, {
            from: _user,
            gas: 300000
        }, function (err, tx_id) {
            if (err) {
                console.log("in addA: " + err);
                return;
            } else {
                console.log("addA tx id: " + tx_id);
            }
            cb();
        })
    },

    getA: function (instance, _user, _questionNumber, cb) {
        instance.getAnswer(_user, _questionNumber, function (err, result) {
            if (err) {
                console.log("in getA: " + err);
                return;
            } else {
                var ans = "short answer: " + result[0] + ", choice: ";
                for (var i = 0; i < result[1].length; i++) {
                    ans += (result[1][i].toString() + " ");
                }
                console.log(ans);
            }
            cb();
        })
    },

    revealA: function (instance, _owner, _user, _questionNumber, _shortAnswer, _choices, cb) {
        instance.revealAnswer(_user, _questionNumber, _shortAnswer, _choices, {
            from: _owner,
            gas: 300000
        }, function (err, tx_id) {
            if (err) {
                console.log("in revealA: " + err);
                return;
            } else {
                console.log("revealA tx id: " + tx_id);
            }
            cb();
        })
    },

    getRevealA: function (instance, _user, _questionNumber, cb) {
        instance.getRevealedAnswer(_user, _questionNumber, function (err, result) {
            if (err) {
                console.log("in getRevealA: " + err);
                return;
            } else {
                var ans = "short answer: " + result[0] + ", choice: ";
                for (var i = 0; i < result[1].length; i++) {
                    ans += (result[1][i].toString() + " ");
                }
                console.log(ans);
            }
            cb();
        })
    },

    getUserStatus: function (instance, _user, cb) {
        instance.getUserStatus(_user, function (err, result) {
            if (err) {
                console.log("in getA: " + err);
                return;
            } else {
                console.log("User status: " + result[0].toString() + ", please withdraw in " + ((new Date()).getTime() / 1000 - result[1].toString()) + " secondes.");
            }
            cb();
        })
    },

    openP: function (instance, _owner, cb) {
        instance.openPoll({
            from: _owner,
            gas: 300000
        }, function (err, tx_id) {
            if (err) {
                console.log("in openP: " + err);
                return;
            } else {
                console.log("contract open!");
            }
            cb();
        });
    },

    shutP: function (instance, _owner, cb) {
        instance.shutDownPoll({
            from: _owner,
            gas: 300000
        }, function (err, tx_id) {
            if (err) {
                console.log("in shutP: " + err);
                return;
            } else {
                console.log("contract shutted down!");
            }
            cb();
        });
    }
}