module.exports = {
    getDrugOwner: function(instance, user, _drugName) {
        return new Promise(function(resolve, reject){
            instance.getDrugOwner(_drugName, {from: user},
                function(err, owner){
                    if (err) {
                        console.log("Error in getDrugOwner: " + err);
                        reject(err);
                    } else {
                        resolve(owner);
                    }
                }
            );
        });   
    },
    getUpstreamDrugInfo: function(instance, user, _drugName, _upstreamDrugName) {
        return new Promise(function(resolve, reject){
            instance.getUpstreamDrugInfo(_drugName, _upstreamDrugName, {from: user},
                function(err, info){
                    if (err) {
                        console.log("Error in getUpstreamDrugInfo: " + err);
                        reject(err);
                    } else {
                        resolve(info);
                    }
                }
            );
        });   
    },
    getDownStreamInfo: function(instance, user, _drugName, _downstreamDrugName) {
        return new Promise(function(resolve, reject){
            instance.getDownStreamInfo(_drugName, _downstreamDrugName,{from: user},
                function(err, info){
                    if (err) {
                        console.log("Error in getDownStreamInfo: " + err);
                        reject(err);
                    } else {
                        resolve(info);
                    }
                }
            );
        });   
    },
    addNewParticipant: function(instance, _newParticipant) {
        return new Promise(function(resolve, reject){
            instance.addNewParticipant(_newParticipant, {from: _newParticipant},
                function(err, tx_id){
                    if (err) {
                        console.log("Error in addNewParticipant: " + err);
                        reject(err);
                    } else {
                        console.log("addNewParticipant tx id: " + tx_id);
                        resolve();
                    }
                }
            );
        });   
    },
    addNewDrug: function(instance, _owner, _drugName, _manuDate, _expDate, _drugAmount) {
        return new Promise(function(resolve, reject){
            instance.addNewDrug(_drugName, _manuDate, _expDate, _drugAmount, {from: _owner, gas: 1000000},
                function(err, tx_id){
                    if (err) {
                        console.log("Error in addNewDrug: " + err);
                        reject(err);
                    } else {
                        console.log("addNewDrug tx id: " + tx_id);
                        resolve();
                    }
                }
            );
        });   
    },
    addDrugStream: function(instance, _owner, _upstreamDrugName, _downstreamDrugName, _amount) {
        return new Promise(function(resolve, reject){
            instance.addDrugStream(_upstreamDrugName, _downstreamDrugName, _amount, {from: _owner, gas: 1000000},
                function(err, tx_id){
                    if (err) {
                        console.log("Error in addDrugStream: " + err);
                        reject(err);
                    } else {
                        console.log("addDrugStream tx id: " + tx_id);
                        resolve();
                    }
                }
            );
        });   
    },
}