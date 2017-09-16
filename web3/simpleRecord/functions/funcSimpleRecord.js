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
    }
}