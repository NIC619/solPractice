module.exports = {
    newPatientData: function(instance, authority, _patientAddr, _name, _sex,
                                _age, _birthdate, _mednumber, _id, _record, _status, _content) {
        return new Promise(function(resolve, reject){
            instance.newPatientData(_patientAddr, _name, _sex, _age, _birthdate, _mednumber,
                                    _id, _record, _status, _content, {from: authority, gas: 1000000},
                function(err, tx_id){
                    if (err) {
                        console.log("in newPatientData: " + err);
                        reject(err);
                    } else {
                        console.log("newPatientData tx id: " + tx_id);
                        resolve();
                    }
                }
            );
        });   
    },
    getName: function(instance, authority, _patientAddr) {
        return new Promise(function(resolve, reject){
            instance.getName(_patientAddr, {from: authority},
                function(err, name){
                    if (err) {
                        console.log("in getName: " + err);
                        reject(err);
                    } else {
                        resolve(name);
                    }
                }
            );
        });   
    },
    getSex: function(instance, authority, _patientAddr) {
        return new Promise(function(resolve, reject){
            instance.getSex(_patientAddr, {from: authority},
                function(err, sex){
                    if (err) {
                        console.log("in getSex: " + err);
                        reject(err);
                    } else {
                        resolve(sex);
                    }
                }
            );
        });   
    },
    modifyName: function(instance, authority, _patientAddr, _name) {
        return new Promise(function(resolve, reject){
            instance.modifyName(_patientAddr, _name, {from: authority},
                function(err, tx_id){
                    if (err) {
                        console.log("in modfiyName: " + err);
                        reject(err);
                    } else {
                        console.log("modfiyName tx id: " + tx_id);
                        resolve();
                    }
                }
            );
        });   
    },
    modifySex: function(instance, authority, _patientAddr, _sex) {
        return new Promise(function(resolve, reject){
            instance.modifySex(_patientAddr, _sex, {from: authority},
                function(err, tx_id){
                    if (err) {
                        console.log("in modfiySex: " + err);
                        reject(err);
                    } else {
                        console.log("modfiySex tx id: " + tx_id);
                        resolve();
                    }
                }
            );
        });   
    },
}