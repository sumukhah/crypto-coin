const { GENESIS_DATA, MINE_RATE } = require("./config.js");
const { sha256 } = require("./crypto.js");

class Block {
  static mineBlock({ lastBlock, data }) {
    let { difficulty } = lastBlock;
    let nonce = 0;
    let hash, timestamp;

    do {
      nonce++;
      timestamp = Date.now();
      difficulty = Block.adjustDifficulty({
        originalBlock: lastBlock,
        timestamp,
      });

      hash = sha256(timestamp, data, lastBlock.hash, nonce, difficulty);
    } while (hash.slice(0, difficulty) !== "0".repeat(difficulty));

    return new this({
      timestamp,
      lastBlock: lastBlock.hash,
      data,
      hash,
      nonce,
      difficulty,
    });
  }

  static adjustDifficulty({ originalBlock, timestamp }) {
    if (originalBlock.difficulty <= 1) return 1;
    if (timestamp - originalBlock.timestamp > MINE_RATE) {
      return originalBlock.difficulty - 1;
    }

    return originalBlock.difficulty + 1;
  }

  static genesis() {
    const genesisBlock = new this(GENESIS_DATA);
    return genesisBlock;
  }

  // only for the genesis block
  constructor({ timestamp, lastBlock, data, hash, difficulty, nonce }) {
    this.lastBlock = lastBlock;
    this.data = data;
    this.timestamp = timestamp;
    this.hash = hash;
    this.difficulty = difficulty;
    this.nonce = nonce;
  }
}

module.exports = Block;
