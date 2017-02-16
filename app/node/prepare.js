const Web3 = require("web3");
const ConvertLib = require(__dirname + "/../contracts/ConvertLib.sol.js");
const MetaCoin = require(__dirname + "/../contracts/MetaCoin.sol.js");
const Migrations = require(__dirname + "/../contracts/Migrations.sol.js");

// Supports Mist, and other wallets that provide 'web3'.
if (typeof web3 !== 'undefined') {
    // Use the Mist/wallet provider.
    web3 = new Web3(web3.currentProvider);
} else {
    // Use the provider from the config.
    web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
}
[ConvertLib, MetaCoin, Migrations].forEach(function(contract) {
    contract.setProvider(web3.currentProvider);
});

web3.eth.getAccountsPromise = function() {
    return new Promise(function (resolve, reject) {
            try {
                web3.eth.getAccounts(function (error, accounts) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(accounts);
                    }
                });
            } catch(error) {
                reject(error);
            }
        });
}

web3.eth.getAccountsPromise()
    .then(function (accounts) {
        console.log(web3.eth.accounts);
        return MetaCoin.deployed().getBalance.call(web3.eth.accounts[0]);            
    })
    .then(function (balance) {
        console.log("balance: " + balance.toString(10));
    })
    .catch(function (err) {
        console.error(err);
    });
