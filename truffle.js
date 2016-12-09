module.exports = {
  build: {
    "index.html": "index.html",
    "app.js": [
      "javascripts/app.js"
    ],
    "node/server.js": [
      "node/prepare.js",
      "node/server.js"
    ],
    "node/listen.js": [
      "node/prepare.js",
      "node/listen.js"
    ],
    "app.css": [
      "stylesheets/app.css"
    ],
    "images/": "images/"
  },
  rpc: {
    host: "localhost",
    port: 8545
  }
};
