const prepared = require("./prepare.js");

const listen = () => {
    prepared.MetaCoin.deployed()
        .then(instance => {
                return instance
                    .Transfer(
                        {},
                        { fromBlock: 0, toBlock: "latest" })
                    .watch((err, newEvent) => {
                        err ? console.error(err) : console.log(newEvent);
                    });
            }
        )
        .catch(console.error);
};

/**
 * Small hack to avoid a possible race condition on Web3's JsonRPC.messageId here:
 * https://github.com/ethereum/web3.js/blob/develop/lib/web3/jsonrpc.js#L42
 */
setTimeout(listen, 100);