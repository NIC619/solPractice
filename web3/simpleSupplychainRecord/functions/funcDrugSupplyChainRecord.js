module.exports = {
    getDrugOwner: function(instance, user, _drugName) {
        return new Promise(function(resolve, reject) {
            instance.getDrugOwner(_drugName, {from: user},
                function(err, owner) {
                    if (err) {
                        console.log("Error in getDrugOwner: " + err);
                        reject(err);
                    } else {
                        console.log("owner: " + owner);
                        resolve(owner);
                    }
                }
            );
        });   
    },
    getDrugsAmountByOwner: function(instance, user, _owner) {
        return new Promise(function(resolve, reject) {
            instance.getDrugsAmountByOwner(_owner, {from: user},
                function(err, amount) {
                    if (err) {
                        console.log("Error in getDrugsAmountByOwner: " + err);
                        reject(err);
                    } else {
                        resolve(amount);
                    }
                }
            );
        });   
    },
    getDrugsOwnedByOwner: function(instance, user, _drugName, _index) {
        return new Promise(function(resolve, reject) {
            instance.getDrugsOwnedByOwner(_drugName, _index, {from: user},
                function(err, drugName) {
                    if (err) {
                        console.log("Error in getDrugsOwnedByOwner: " + err);
                        reject(err);
                    } else {
                        resolve(drugName);
                    }
                }
            );
        });   
    },
    getDrugDetail: function(instance, user, _drugName) {
        return new Promise(function(resolve, reject) {
            instance.getDrugDetail(_drugName, {from: user},
                function(err, drugDetail) {
                    if (err) {
                        console.log("Error in getDrugDetail: " + err);
                        reject(err);
                    } else {
                        resolve(drugDetail);
                    }
                }
            );
        });   
    },
    getUpstreamDrugInfoByIndex: function(instance, user, _drugName, index) {
        return new Promise(function(resolve, reject) {
            instance.getUpstreamDrugInfoByIndex(_drugName, index, {from: user},
                function(err, info) {
                    if (err) {
                        console.log("Error in getUpstreamDrugInfoByIndex: " + err);
                        reject(err);
                    } else {
                        resolve(info);
                    }
                }
            );
        });   
    },
    getDownstreamDrugInfoByIndex: function(instance, user, _drugName, index) {
        return new Promise(function(resolve, reject) {
            instance.getDownstreamDrugInfoByIndex(_drugName, index,{from: user},
                function(err, info) {
                    if (err) {
                        console.log("Error in getDownstreamDrugInfoByIndex: " + err);
                        reject(err);
                    } else {
                        resolve(info);
                    }
                }
            );
        });   
    },
    getUpstreamDrugInfo: function(instance, user, _drugName, _upstreamDrugName) {
        return new Promise(function(resolve, reject) {
            instance.getUpstreamDrugInfo(_drugName, _upstreamDrugName, {from: user},
                function(err, info) {
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
    getDownStreamDrugInfo: function(instance, user, _drugName, _downstreamDrugName) {
        return new Promise(function(resolve, reject) {
            instance.getDownStreamDrugInfo(_drugName, _downstreamDrugName,{from: user},
                function(err, info) {
                    if (err) {
                        console.log("Error in getDownStreamDrugInfo: " + err);
                        reject(err);
                    } else {
                        resolve(info);
                    }
                }
            );
        });   
    },
    addNewParticipant: function(instance, _newParticipant) {
        return new Promise(function(resolve, reject) {
            instance.addNewParticipant(_newParticipant, {from: _newParticipant},
                function(err, tx_id) {
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
        return new Promise(function(resolve, reject) {
            instance.addNewDrug(_drugName, _manuDate, _expDate, _drugAmount, {from: _owner, gas: 1000000},
                function(err, tx_id) {
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
        return new Promise(function(resolve, reject) {
            instance.addDrugStream(_upstreamDrugName, _downstreamDrugName, _amount, {from: _owner, gas: 1000000},
                function(err, tx_id) {
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
    isDrugDistributeValid: function(instance, _authority, _drugName) {
        return new Promise(function(resolve, reject) {
            instance.isDrugDistributeValid(_drugName, {from: _authority},
                function(err, isValid) {
                    if(err) {
                        console.log("Error in isDrugDistributeValid: " + err);
                        reject(err);
                    } else {
                        resolve(isValid);
                    }
                }
            );
        })
    },
}