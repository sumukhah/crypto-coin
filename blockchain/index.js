const Block = require("./block");
const { sha256 } = require("../utils/crypto.js");

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
    this.chain = newChain;
    console.info("block chian is synced");
  }
}

const blockchain = new BlockChain();
module.exports = { BlockChain, blockchain };
