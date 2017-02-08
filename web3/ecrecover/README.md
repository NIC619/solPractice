#simple web3 web app
##this is a simple demo of using web3 to interact with Ethereum blockchain
##an web app using web3 to sign message and ecrecover to recover the address who signed the message
##Note: 
1. need to deploy a simple [contract](https://github.com/NIC619/solPractice/blob/master/ecrecover.sol) to use *ecrecover*
2. need to fill in the contract address deployed and passphrase of your first account in order to unlock and sign (hardcoded into app.js file)
3. and make sure your RPC node opens up 'personal' api to unlock account