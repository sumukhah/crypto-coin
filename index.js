const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios").default;

require("dotenv").config();

let port = 8000;
// const { initializeP2P, p2pConnection } = require("./socket/index");
const { blockchain } = require("./blockchain");
const P2PConnection = require("./socket");

const Wallet = require("./wallet/index");
const TransactionPool = require("./transactionPool/transactionPool");

const args = require("yargs/yargs")(process.argv.slice(2)).argv;
const app = express();

const wallet = new Wallet();
const transactionPool = new TransactionPool();
const p2pConnection = new P2PConnection(blockchain, transactionPool);

app.use(bodyParser.json());
const DEFAULT_ROOT_NODE = "http://localhost:3000";

const syncWithRoot = async () => {
  // request transaction pool from a root node

  try {
    // get all the transaction map
    let response = await axios.get(
      `${DEFAULT_ROOT_NODE}/app/transaction-pool-map`
    );
    const transactionMap = response.data;
    transactionPool.replaceTransactionMap(transactionMap);

    // get the blockchain from root node
    response = await axios.get(`${DEFAULT_ROOT_NODE}/app/block`);
  } catch (e) {
    console.log(e.message);
  }
  // transactionPool.replaceTransactionMap()
};

syncWithRoot();

app.get("/app/blocks", (req, res) => {
  res.send(blockchain);
});

app.post("/app/mine", (req, res) => {
  const { data } = req.body;
  blockchain.addNewBlock({ data });
  p2pConnection.brodcastMinedBlock();
  res.redirect("/app/blocks");
});

app.get("/app/transaction-pool-map", (req, res) => {
  return res.json(transactionPool.transactionMap);
});

app.post("/app/transaction", (req, res) => {
  const { amount, recipient } = req.body;

  let transaction = transactionPool.existingTransaction({
    inputAddress: wallet.publicKey,
  });

  try {
    if (transaction) {
      transaction.update({ senderWallet: wallet, recipient, amount });
    } else {
      transaction = wallet.createTransaction({
        amount,
        recipient,
      });
    }
  } catch (err) {
    return res.status(400).json({ message: err.message, type: "failed" });
  }

  transactionPool.setTransaction(transaction);
  // brodcast new transaction to all peers
  p2pConnection.brodcastTransactions(transaction);
  res.json({ type: "success", transaction });
});

app.get("/app/wallet", (req, res) => {
  res.json({
    address: wallet.publicKey,
    balance: Wallet.calculateBalance({
      publicKey: wallet,
      chain: blockchain.chain,
    }),
  });
});

if (process.env.GENERATE_PORT === "true") {
  port = port + Math.floor(Math.random() * 1000);
}

if (args.port) {
  port = args.port;
}

app.listen(port, () => {
  console.log("server is running on ", port);
  // console.info(`server is running in port ${port}`);
});
