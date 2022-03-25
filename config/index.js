const { sha256 } = require("../utils/crypto");

const INITIAL_DIFFICULTY = 2; // sets the initial difficulty of the genesis block, which will be carried to further blocks
const MINE_RATE = 20; // mining difficulty adjusted

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
  GENESIS_DATA.timestamp,
  GENESIS_DATA.difficulty,
  GENESIS_DATA.nonce
);

const INITIAL_BALANCE = 500;

MINING_REWARD = 50;
REWARD_TRANSACTION = {
  sender: "*authorized-reward*",
  amount: MINING_REWARD,
};
module.exports = {
  GENESIS_DATA,
  MINE_RATE,
  MINING_REWARD,
  REWARD_TRANSACTION,
  INITIAL_BALANCE,
};
