const Web3 = require("web3");
const net = require("net");

module.exports = {
    networks: {
        development: {
            provider: new Web3.providers.IpcProvider(process.env['HOME'] + "/.ethereum/net42/geth.ipc", net),
            network_id: "*",
            gas: 3000000
        }
    }
};
