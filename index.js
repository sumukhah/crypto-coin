const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

let port = 8000;
// const { initializeP2P, p2pConnection } = require("./socket/index");
const { blockchain } = require("./blockchain");
const P2PConnection = require("./socket");

const args = require("yargs/yargs")(process.argv.slice(2)).argv;
const app = express();
const p2pConnection = new P2PConnection(blockchain);

app.use(bodyParser.json());

app.get("/app/blocks", (req, res) => {
  res.send(blockchain);
});
app.post("/app/mine", (req, res) => {
  const { data } = req.body;
  blockchain.addNewBlock({ data });
  p2pConnection.brodcastMinedBlock();
  res.redirect("/app/blocks");
});

if (process.env.GENERATE_PORT === "true") {
  port = port + Math.floor(Math.random() * 1000);
}

if (args.port) {
  port = args.port;
}

app.listen(port, () => {
  console.info(`server is running in port ${port}`);
});
