const Http = require("http");
const Url = require("url");

function serverError(response, err) {
    response.writeHeader(500, {"Content-Type": "text/plain"});
    response.write(err.toString());
    response.end();                    
}

function notFound(response) {
    response.writeHeader(404);
    response.end();
}

Http.createServer(function(request,response){
    console.log(request.url);
    var pathname = Url.parse(request.url).pathname;
    console.log(pathname);

    if (request.method == "GET") {
        if (pathname.startsWith("/tx/")) {
            var txHash = pathname.slice(4, 70);
            web3.eth.getTransaction(txHash, function (err, tx) {
                if (err) {
                    serverError(response, err);
                } else {
                    response.writeHeader(200, {"Content-Type": "application/json"});
                    response.write(JSON.stringify(tx));
                    response.end();
                }
            });
        } else if (pathname.startsWith("/balance/")) {
            var address = pathname.slice(9, 51);
            MetaCoin.deployed().getBalance.call(address)
                .then(function (balance) {
                    response.writeHeader(200, {"Content-Type": "application/json"});
                    response.write(JSON.stringify({
                        address: address,
                        balance: balance.toString(10)
                    }));
                    response.end();
                })
                .catch(function (err) {
                    serverError(response, err);
                });
        } else {
            notFound(response);
        }
    } else if (request.method == "POST") {
        if (pathname.startsWith("/sendOneTo/")) {
            var address = pathname.slice(11, 53);
            console.log(address);
            MetaCoin.deployed().sendCoin(address, 1, { from: web3.eth.accounts[0] })
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
        } else {
            notFound(response);
        }
    } else {
        notFound(response);
    }
}).listen(8080);
