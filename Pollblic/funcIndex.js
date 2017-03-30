module.exports = {
    newPoll: function(instance, _owner, _id, _totalNeeded, _price, _title, _lifeTime, _paymentLockTime, _ifEncrypt, _encryptionKey,  _numberOfQuestions, cb) {
        instance.newPoll(_id, _totalNeeded, _price, _title, _lifeTime, _paymentLockTime, _ifEncrypt, _encryptionKey,  _numberOfQuestions,
            {from: _owner, value: _price*Math.pow(10,18), gas: 4700000},
            function(err, tx_id){
                if (err) {
                    console.log("in newPoll: " + err);
                    return;
                } else {
                    // console.log("newPoll tx id: " + tx_id);
                }
                cb();
            }
        );
    },
    getAddrByID: function(instance, _id, cb) {
        instance.getPollAddrByID(_id, function(err, addr){
            if (err) {
                console.log("in getAddrByID: " + err);
                return;
            } else {
                console.log("Poll addr: " + addr.toString());
            }
            cb();
        });
    },
    getOwnerByID: function(instance, _id, cb) {
        instance.getPollOwnerByID(_id, function(err, owner){
            if (err) {
                console.log("in getOwnerrByID: " + err);
                return;
            } else {
                console.log("Poll owner: " + owner.toString());
            }
            cb();
        });
    },
    getStatusByID: function(instance, _id, cb) {
        instance.getPollStatusByID(_id, function(err, status){
            if (err) {
                console.log("in getStatusByID: " + err);
                return;
            } else {
                console.log("Poll status: " + status.toString());
            }
            cb();
        });
    },
    getIssuedCountByID: function(instance, _id, cb) {
        instance.getPollIssuedCountByID(_id, function(err, count){
            if (err) {
                console.log("in getIssuedCountByID: " + err);
                return;
            } else {
                console.log("Poll issued count: " + count.toString());
            }
            cb();
        });
    },
    getUserAnswered: function(instance, _user, cb) {
        instance.getUserTotalAnswered(_user, function(err, count){
            if (err) {
                console.log("in getUserAnswered: " + err);
                return;
            } else {
                console.log(_user + " totally answered: " + count.toString());
            }
            cb();
        });
    },
    getUserAccepted: function(instance, _user, cb) {
        instance.getUserTotalAccepted(_user, function(err, count){
            if (err) {
                console.log("in getUserAccepted: " + err);
                return;
            } else {
                console.log(_user + " totally accepted: " + count.toString());
            }
            cb();
        });
    }
}