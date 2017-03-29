module.exports = {
    newPoll: function(instance, _owner, _id, _totalNeeded, _price, _title, _lifeTime, _paymentLockTime, _ifEncrypt, _encryptionKey,  _numberOfQuestions) {
        return new Promise(function(resolve, reject){
            instance.newPoll(_id, _totalNeeded, _price, _title, _lifeTime, _paymentLockTime, _ifEncrypt, _encryptionKey,  _numberOfQuestions,
                {from: _owner, value: _price*Math.pow(10,18), gas: 4700000},
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
    getAddrByID: function(instance, _id) {
        return new Promise(function(resolve, reject){
            instance.getPollAddrByID(_id, function(err, addr){
                if (err) {
                    console.log("in getAddrByID: " + err);
                    reject(err);
                } else {
                    console.log("Poll addr: " + addr.toString());
                    resolve();
                }
            });
        });
    },
    getOwnerByID: function(instance, _id) {
        return new Promise(function(resolve, reject){
            instance.getPollOwnerByID(_id, function(err, owner){
                if (err) {
                    console.log("in getOwnerrByID: " + err);
                    reject(err);
                } else {
                    console.log("Poll owner: " + owner.toString());
                    resolve();
                }
            });
        });
    },
    getStatusByID: function(instance, _id) {
        return new Promise(function(resolve, reject){
            instance.getPollStatusByID(_id, function(err, status){
                if (err) {
                    console.log("in getStatusByID: " + err);
                    reject(err);
                } else {
                    console.log("Poll status: " + status.toString());
                    resolve();
                }
            });
        });
    },
    getIssuedCountByID: function(instance, _id) {
        return new Promise(function(resolve, reject){
            instance.getPollIssuedCountByID(_id, function(err, count){
                if (err) {
                    console.log("in getPollIssuedCountByID: " + err);
                    reject(err);
                } else {
                    console.log("Poll issued count: " + count.toString());
                    resolve();
                }
            });
        });
    },
    getUserAnswered: function(instance, _user) {
        return new Promise(function(resolve, reject){
            instance.getUserTotalAnswered(_user, function(err, count){
                if (err) {
                    console.log("in getUserTotalAnswered: " + err);
                    reject(err);
                } else {
                    console.log(_user + " totally answered: " + count.toString());
                    resolve();
                }
            });
        });
    },
    getUserAccepted: function(instance, _user) {
        return new Promise(function(resolve, reject){
            instance.getUserTotalAccepted(_user, function(err, count){
                if (err) {
                    console.log("in getUserTotalAccepted: " + err);
                    reject(err);
                } else {
                    console.log(_user + " totally answered: " + count.toString());
                    resolve();
                }
            });
        });
    }
}