const Web3 = require("web3");

// Good practice, we could have already defined web3.
if (typeof web3 !== 'undefined') {
    // Use its provider.
    web3 = new Web3(web3.currentProvider);
} else {
    // Use IPC.
    web3 = new Web3(new Web3.providers.IpcProvider(
        process.env['HOME'] + '/.ethereum/net42/geth.ipc',
        require('net')));
}

web3.eth.getAccounts((err, acc) => console.log("acc", acc));

const truffleContractFactory = require("truffle-contract");
// ABI and Truffle goodies
const MetaCoinJson = require("../build/contracts/MetaCoin.json");
const MetaCoin = truffleContractFactory(MetaCoinJson);
const MigrationsJson = require("../build/contracts/Migrations.json");
const Migrations = truffleContractFactory(MigrationsJson);

// Instruct the contracts to use the prepared Geth node.
[MetaCoin, Migrations].forEach(contract =>
    contract.setProvider(web3.currentProvider));

// Convenience method
web3.eth.getAccountsPromise = () => 
    new Promise((resolve, reject) =>
        web3.eth.getAccounts((error, accounts)  =>
            error ? reject(error) : resolve(accounts)));

// Get the first account's balance
web3.eth.getAccountsPromise()
    .then(accounts => MetaCoin.deployed()
        .then(instance => instance.getBalance.call(accounts[0]))
    )
    .then(balance => console.log("balance: " + balance.toString(10)))
    .catch(console.error);

module.exports = {
    web3: web3,
    MetaCoin: MetaCoin,
    Migrations: Migrations
};