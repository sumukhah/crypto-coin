const { sha256 } = require("./crypto");

const INITIAL_DIFFICULTY = 2; // sets the initial difficulty of the genesis block, which will be carried to further blocks
const MINE_RATE = 1000; // mining difficulty adjusted

const GENESIS_DATA = {
  timestamp: +new Date("01/01/2000"),
  data: [],
  lastBlock: "---",
  difficulty: INITIAL_DIFFICULTY,
  nonce: 0,
  hash: "", // will be changed below
};
GENESIS_DATA.hash = sha256(
  GENESIS_DATA.data,
  GENESIS_DATA.lastBlock,
  GENESIS_DATA.timestamp
);

module.exports = { GENESIS_DATA, MINE_RATE };
