const express = require("express");
const { BlockChain } = require("./blockchain");
const bodyParser = require("body-parser");

const app = express();
const blockchain = new BlockChain();

app.use(bodyParser.json());
app.get("/app/blocks", (req, res) => {
  res.send(blockchain);
});

app.post("/app/mine", (req, res) => {
  const { data } = req.body;
  blockchain.addNewBlock({ data });
  res.redirect("/app/blocks");
});

const PORT = 8000;

app.listen(PORT, () => {
  console.info(`server is running in port ${PORT}`);
});
