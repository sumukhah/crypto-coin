const Block = require("./block");
const { sha256 } = require("../utils/crypto.js");
const { REWARD_TRANSACTION } = require("../config");
const Transaction = require("../transaction");
const Wallet = require("../wallet");

class BlockChain {
  chain = [];

  constructor() {
    const genesisBlock = Block.genesis();
    this.chain.push(genesisBlock);
  }

  addNewBlock({ data }) {
    const lastBlock = this.chain[this.chain.length - 1];
    const newBlock = Block.mineBlock({ lastBlock, data });
    this.chain.push(newBlock);
    return newBlock.hash;
  }

  static isValidChain(chain) {
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
      console.error("doesn't start with valid genesis");
      return false;
    }
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const { timestamp, data, lastBlock, difficulty, nonce } = block;

      if (lastBlock !== chain[i - 1].hash) return false;

      const hash = sha256(timestamp, data, lastBlock, difficulty, nonce);
      if (hash !== block.hash) {
        console.error("not a valid block");
        return false;
      }
    }
    return true;
  }

  replaceChain(newChain) {
    if (newChain.length <= this.chain.length) {
      console.error("new chain is not longer");
      return;
    }
    if (!BlockChain.isValidChain(newChain)) {
      console.error("new chain is not valid");
      return;
    }
    if (!this.validTransactionsData({ chain: newChain })) {
      console.log("invalid transactions in new chain");
    }
    this.chain = newChain;
    console.info("block chian is synced");
  }

  validTransactionsData({ chain }) {
    for (let i = 1; i < chain.length; i++) {
      let rewardCount = 0;
      const blockTransactions = {};
      for (let transaction of chain[i].data) {
        if (blockTransactions[transaction.id]) {
          console.error("Duplicate transactions");
          return false;
        } else {
          blockTransactions[transaction.id] = true;
        }
        if (transaction.input.sender === REWARD_TRANSACTION.sender) {
          rewardCount += 1;
        }
        if (!Transaction.isValidTransaction(transaction)) {
          return false;
        }
        if (transaction.input.sender !== REWARD_TRANSACTION.sender) {
          const trueBalance = Wallet.calculateBalance({
            chain: this.chain,
            publicKey: transaction.input.sender,
          });
          if (trueBalance !== transaction.input.amount) {
            console.error("malformed wallet detected");
            return false;
          }
        }
      }
      if (rewardCount > 1) return false;
    }

    return true;
  }
}

const blockchain = new BlockChain();
module.exports = { BlockChain, blockchain };
