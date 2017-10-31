const Http = require("http");
const Url = require("url");
const prepared = require("./prepare.js");
const EthUtil = require("ethereumjs-util");

function serverError(err, response) {
    response.writeHeader(500, {"Content-Type": "text/plain"});
    response.write(err.toString());
    response.end();                    
}

function invalidMethod(response) {
    response.writeHeader(405);
    response.end();
}

function notFound(err, response) {
    response.writeHeader(404, {"Content-Type": "text/plain"});
    response.write(err.toString());
    response.end();
}

function badRequest(err, response) {
    response.writeHeader(400, {"Content-Type": "text/plain"});
    response.write(err.toString());
    response.end();
}

Http.createServer(function(request,response){
    console.log(request.url);
    const pathname = Url.parse(request.url).pathname;

    if (request.method == "GET") {
        if (pathname.startsWith("/tx/")) {
            const txHash = pathname.slice(4, 70);
            web3.eth.getTransaction(txHash, function (err, tx) {
                if (err) {
                    serverError(err, response);
                } else if (tx == null) {
                    notFound(txHash + " is not a known transaction\n", response);
                } else {
                    response.writeHeader(200, {"Content-Type": "application/json"});
                    response.write(JSON.stringify(tx) + '\n');
                    response.end();
                }
            });
        } else if (pathname.startsWith("/balance/")) {
            const who = pathname.slice(9, 51);
            if (!EthUtil.isValidAddress(who)) {
                badRequest(who + " is not a valid address", response);
            } else {
                prepared.MetaCoin.deployed()
                    .then(instance => instance.getBalance.call(who))
                    .then(balance => {
                        response.writeHeader(200, {"Content-Type": "application/json"});
                        response.write(JSON.stringify({
                            "address": who,
                            "balance": balance.toString(10)
                        }) + '\n');
                        response.end();
                    })
                    .catch(err => serverError(err, response));
            }
        } else {
            notFound(pathname + " not found", response);
        }
    } else if (request.method == "PATCH") {
        if (pathname.startsWith("/sendOneTo/")) {
            const toWhom = pathname.slice(11, 53);
            if (!EthUtil.isValidAddress(toWhom)) {
                badRequest(toWhom + " is not a valid address", response);
            } else {
                web3.eth.getAccountsPromise()
                    .then(accounts => prepared.MetaCoin.deployed()
                        .then(instance => instance
                            .sendCoin.sendTransaction(toWhom, 1, { from: accounts[0] })))
                    .then(txHash => {
                        response.writeHeader(200, {"Content-Type": "application/json"});
                        response.write(JSON.stringify({
                            txHash: txHash
                        }));
                        response.end();
                    })
                    .catch(err => serverError(err, response));
            }
        } else {
            notFound(pathname + " not found", response);
        }
    } else {
        invalidMethod(response);
    }
    
}).listen(8080);
