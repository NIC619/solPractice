module.exports = {
    newPoll: function(instance, _owner,
        _id, _totalNeeded, _price, _title, _timePollLast,
        _periodForAnswerReview,  _numberOfQuestions
        // _ifEncrypt, _encryptionKey
    ) {
        return new Promise(function(resolve, reject){
            instance.newPoll(_id, _totalNeeded, _price, _title, _timePollLast,
                _periodForAnswerReview,  _numberOfQuestions,
                //  _ifEncrypt, _encryptionKey,
                {from: _owner, value: _totalNeeded*_price*Math.pow(10,18), gas: 4700000},
                function(err, tx_id){
                    if (err) {
                        console.log("in newPoll: " + err);
                        reject(err);
                    } else {
                        console.log("newPoll tx id: " + tx_id);
                        resolve();
                    }
                }
            );
        });
        
    },
    getPollAddrByID: function(instance, _id) {
        return new Promise(function(resolve, reject){
            instance.getPollAddrByID(_id, function(err, addr){
                if (err) {
                    console.log("in getPollAddrByID: " + err);
                    reject(err);
                } else {
                    console.log("Poll addr: " + addr.toString());
                    resolve(addr.toString());
                }
            });
        });
    },
    getPollOwnerByID: function(instance, _id) {
        return new Promise(function(resolve, reject){
            instance.getPollOwnerByID(_id, function(err, owner){
                if (err) {
                    console.log("in getPollOwnerByID: " + err);
                    reject(err);
                } else {
                    console.log("Poll owner: " + owner.toString());
                    resolve(owner.toString());
                }
            });
        });
    },
    getPollOwnedByOwner: function(instance, _owner) {
        return new Promise(function(resolve, reject){
            instance.getPollOwnedByOwner(_owner, function(err, poll_list){
                if (err) {
                    console.log("in getPollOwnedByOwner: " + err);
                    reject(err);
                } else {
                    console.log("List of poll: " + poll_list);
                    resolve(poll_list);
                }
            });
        });
    },
    // No need for this, just use public variable 'contractStatus' in Poll
    // getStatusByID: function(instance, _id) {
    //     return new Promise(function(resolve, reject){
    //         instance.getPollStatusByID(_id, function(err, status){
    //             if (err) {
    //                 console.log("in getStatusByID: " + err);
    //                 reject(err);
    //             } else {
    //                 console.log("Poll status: " + status.toString());
    //                 resolve();
    //             }
    //         });
    //     });
    // },
    // getIssuedCountByID: function(instance, _id) {
    //     return new Promise(function(resolve, reject){
    //         instance.getPollIssuedCountByID(_id, function(err, count){
    //             if (err) {
    //                 console.log("in getPollIssuedCountByID: " + err);
    //                 reject(err);
    //             } else {
    //                 console.log("Poll issued count: " + count.toString());
    //                 resolve();
    //             }
    //         });
    //     });
    // },
    // getUserAnswered: function(instance, _user) {
    //     return new Promise(function(resolve, reject){
    //         instance.getUserTotalAnswered(_user, function(err, count){
    //             if (err) {
    //                 console.log("in getUserTotalAnswered: " + err);
    //                 reject(err);
    //             } else {
    //                 console.log(_user + " totally answered: " + count.toString());
    //                 resolve();
    //             }
    //         });
    //     });
    // },
    // getUserAccepted: function(instance, _user) {
    //     return new Promise(function(resolve, reject){
    //         instance.getUserTotalAccepted(_user, function(err, count){
    //             if (err) {
    //                 console.log("in getUserTotalAccepted: " + err);
    //                 reject(err);
    //             } else {
    //                 console.log(_user + " totally accepted: " + count.toString());
    //                 resolve();
    //             }
    //         });
    //     });
    // }
}