module.exports = {
    deploy: function(web3, abi, bytecode, authority, cb) {
        web3.eth.contract(abi).new({from: authority, data: bytecode, gas: 4700000}, function(err, instance) {
            if(err) {
                console.log(err);
                throw "error deploying contract";
            }
            else {
                if (typeof instance.address !== 'undefined') {
                    console.log("contract deployed at " + instance.address)
                    cb(instance);
                }
            }
        });
    }
}