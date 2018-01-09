module.exports = {
    deploy: function(web3, abi, bytecode, authority) {
        return new Promise(function(resolve, reject){
            web3.eth.contract(abi).new({from: authority, data: bytecode, gas: 4700000}, function(err, instance) {
                if(err) {
                    console.log("Error deploying contract:", err);
                    reject(err);
                }
                else {
                    if (typeof instance.address !== 'undefined') {
                        console.log("contract deployed at " + instance.address)
                        resolve(instance);
                    }
                }
            });
        });
    }
}