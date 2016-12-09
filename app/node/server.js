const Http = require("http");
const Url = require("url");
const EthUtil = require("ethereumjs-util");

function serverError(response, err) {
    response.writeHeader(500, {"Content-Type": "text/plain"});
    response.write(err.toString());
    response.end();                    
}

function invalidMethod(response) {
    response.writeHeader(405);
    response.end();
}

function notFound(response, err) {
    response.writeHeader(404, {"Content-Type": "text/plain"});
    response.write(err.toString());
    response.end();
}

function badRequest(response, err) {
    response.writeHeader(400, {"Content-Type": "text/plain"});
    response.write(err.toString());
    response.end();
}

Http.createServer(function(request,response){
    console.log(request.url);
    var pathname = Url.parse(request.url).pathname;

    if (request.method == "GET") {
        if (pathname.startsWith("/tx/")) {
            var txHash = pathname.slice(4, 70);
            web3.eth.getTransaction(txHash, function (err, tx) {
                if (err) {
                    serverError(response, err);
                } else if (tx == null) {
                    notFound(response, txHash + " is not a known transaction\n");
                } else {
                    response.writeHeader(200, {"Content-Type": "application/json"});
                    response.write(JSON.stringify(tx) + '\n');
                    response.end();
                }
            });
        } else if (pathname.startsWith("/balance/")) {
            var who = pathname.slice(9, 51);
            if (!EthUtil.isValidAddress(who)) {
                badRequest(response, who + " is not a valid address");
            } else {
                MetaCoin.deployed().getBalance.call(who)
                    .then(function (balance) {
                        response.writeHeader(200, {"Content-Type": "application/json"});
                        response.write(JSON.stringify({
                            "address": who,
                            "balance": balance.toString(10)
                        }) + '\n');
                        response.end();
                    })
                    .catch(function (err) {
                        serverError(response, err);
                    });
            }
        } else {
            notFound(response, "");
        }
    } else if (request.method == "PATCH") {
        if (pathname.startsWith("/sendOneTo/")) {
            var toWhom = pathname.slice(11, 53);
            if (!EthUtil.isValidAddress(toWhom)) {
                badRequest(response, toWhom + " is not a valid address");
            } else {
                MetaCoin.deployed()
                    .sendCoin.sendTransaction(toWhom, 1, { from: web3.eth.accounts[0] })
                    .then(function (txHash) {
                        response.writeHeader(200, {"Content-Type": "application/json"});
                        response.write(JSON.stringify({
                            txHash: txHash
                        }));
                        response.end();
                    })
                    .catch(function (err) {
                        serverError(response, err);
                    });
            }
        } else {
            notFound(response);
        }
    } else {
        invalidMethod(response);
    }
    
}).listen(8080);
