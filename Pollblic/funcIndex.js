module.exports = {
    newPoll: function(instance, _owner, _id, _totalNeeded, _price, _title, _lifeTime, _paymentLockTime, _ifEncrypt, _encryptionKey,  _numberOfQuestions, cb) {
        instance.newPoll(_id, _totalNeeded, _price, _title, _lifeTime, _paymentLockTime, _ifEncrypt, _encryptionKey,  _numberOfQuestions,
            {from: _owner, value: _price*Math.pow(10,18), gas: 4700000},
            function(err, tx_id){
                if (err) {
                    console.log("in newPoll: " + err);
                    return;
                } else {
                    console.log("newPoll tx id: " + tx_id);
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
            cb(addr);
        });
    }
}