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
    getAge: function(instance, authority, _patientAddr) {
        return new Promise(function(resolve, reject){
            instance.getAge(_patientAddr, {from: authority},
                function(err, age){
                    if (err) {
                        console.log("in getAge: " + err);
                        reject(err);
                    } else {
                        if(age.toString() === "0") {
                            reject("Patient data not exist");
                        }
                        resolve(age);
                    }
                }
            );
        });   
    },
    getBirthdate: function(instance, authority, _patientAddr) {
        return new Promise(function(resolve, reject){
            instance.getBirthdate(_patientAddr, {from: authority},
                function(err, bdate){
                    if (err) {
                        console.log("in getBirthdate: " + err);
                        reject(err);
                    } else {
                        resolve(bdate);
                    }
                }
            );
        });   
    },
    getMednumber: function(instance, authority, _patientAddr) {
        return new Promise(function(resolve, reject){
            instance.getMednumber(_patientAddr, {from: authority},
                function(err, mednumber){
                    if (err) {
                        console.log("in getMednumber: " + err);
                        reject(err);
                    } else {
                        resolve(mednumber);
                    }
                }
            );
        });   
    },
    getId: function(instance, authority, _patientAddr) {
        return new Promise(function(resolve, reject){
            instance.getId(_patientAddr, {from: authority},
                function(err, id){
                    if (err) {
                        console.log("in getId: " + err);
                        reject(err);
                    } else {
                        resolve(id);
                    }
                }
            );
        });   
    },
    getRecord: function(instance, authority, _patientAddr) {
        return new Promise(function(resolve, reject){
            instance.getRecord(_patientAddr, {from: authority},
                function(err, record){
                    if (err) {
                        console.log("in getRecord: " + err);
                        reject(err);
                    } else {
                        resolve(record);
                    }
                }
            );
        });   
    },
    getStatus: function(instance, authority, _patientAddr) {
        return new Promise(function(resolve, reject){
            instance.getStatus(_patientAddr, {from: authority},
                function(err, status){
                    if (err) {
                        console.log("in getStatus: " + err);
                        reject(err);
                    } else {
                        resolve(status);
                    }
                }
            );
        });   
    },
    getContent: function(instance, authority, _patientAddr) {
        return new Promise(function(resolve, reject){
            instance.getContent(_patientAddr, {from: authority},
                function(err, content){
                    if (err) {
                        console.log("in getContent: " + err);
                        reject(err);
                    } else {
                        resolve(content);
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
                        console.log("in modifySex: " + err);
                        reject(err);
                    } else {
                        console.log("modifySex tx id: " + tx_id);
                        resolve();
                    }
                }
            );
        });   
    },
    modifyAge: function(instance, authority, _patientAddr, _age) {
        return new Promise(function(resolve, reject){
            instance.modifyAge(_patientAddr, _age, {from: authority},
                function(err, tx_id){
                    if (err) {
                        console.log("in modifyAge: " + err);
                        reject(err);
                    } else {
                        console.log("modifyAge tx id: " + tx_id);
                        resolve();
                    }
                }
            );
        });   
    },
    modifyBirthdate: function(instance, authority, _patientAddr, _bdate) {
        return new Promise(function(resolve, reject){
            instance.modifyBirthdate(_patientAddr, _bdate, {from: authority},
                function(err, tx_id){
                    if (err) {
                        console.log("in modifyBirthdate: " + err);
                        reject(err);
                    } else {
                        console.log("modifyBirthdate tx id: " + tx_id);
                        resolve();
                    }
                }
            );
        });   
    },
    modifyMednumber: function(instance, authority, _patientAddr, _mednumber) {
        return new Promise(function(resolve, reject){
            instance.modifyMednumber(_patientAddr, _mednumber, {from: authority},
                function(err, tx_id){
                    if (err) {
                        console.log("in modifyMednumber: " + err);
                        reject(err);
                    } else {
                        console.log("modifyMednumber tx id: " + tx_id);
                        resolve();
                    }
                }
            );
        });   
    },
    modifyId: function(instance, authority, _patientAddr, _id) {
        return new Promise(function(resolve, reject){
            instance.modifyId(_patientAddr, _id, {from: authority},
                function(err, tx_id){
                    if (err) {
                        console.log("in modifyId: " + err);
                        reject(err);
                    } else {
                        console.log("modifyId tx id: " + tx_id);
                        resolve();
                    }
                }
            );
        });   
    },
    modifyRecord: function(instance, authority, _patientAddr, _record) {
        return new Promise(function(resolve, reject){
            instance.modifyRecord(_patientAddr, _record, {from: authority},
                function(err, tx_id){
                    if (err) {
                        console.log("in modifyRecord: " + err);
                        reject(err);
                    } else {
                        console.log("modifyRecord tx id: " + tx_id);
                        resolve();
                    }
                }
            );
        });   
    },
    modifyStatus: function(instance, authority, _patientAddr, _status) {
        return new Promise(function(resolve, reject){
            instance.modifyStatus(_patientAddr, _status, {from: authority},
                function(err, tx_id){
                    if (err) {
                        console.log("in modifyStatus: " + err);
                        reject(err);
                    } else {
                        console.log("modifyStatus tx id: " + tx_id);
                        resolve();
                    }
                }
            );
        });   
    },
    modifyContent: function(instance, authority, _patientAddr, _content) {
        return new Promise(function(resolve, reject){
            instance.modifyContent(_patientAddr, _content, {from: authority},
                function(err, tx_id){
                    if (err) {
                        console.log("in modifyContent: " + err);
                        reject(err);
                    } else {
                        console.log("modifyContent tx id: " + tx_id);
                        resolve();
                    }
                }
            );
        });   
    }
}