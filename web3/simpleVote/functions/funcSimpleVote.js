module.exports = {
    vote: function(instance, _user, candidate) {
        return new Promise(function(resolve, reject){
            instance.vote(candidate, {from: _user, gas: 300000},
                function(err, tx_id){
                    if (err) {
                        console.log("in vote: " + err);
                        reject(err);
                    } else {
                        console.log("vote tx id: " + tx_id);
                        resolve();
                    }
                }
            );
        });   
    }
}