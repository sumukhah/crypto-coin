const Block = require("../blockchain/block");
const { GENESIS_DATA, MINE_RATE } = require("../config");
const { sha256 } = require("../utils/crypto");

describe("Block", () => {
  const data = ["blockchain", "data"];
  const lastBlock = "foo";
  const hash = "bar";
  const timestamp = +new Date("01/01/2000");
  const difficulty = 1;
  const nonce = 1;

  const block = new Block({
    data,
    lastBlock,
    hash,
    timestamp,
    difficulty,
    nonce,
  });

  it("has a block containing timestamp, data, last hash, hash", () => {
    expect(block.timestamp).toBe(timestamp);
    expect(block.data).toBe(data);
    expect(block.hash).toBe(hash);
    expect(block.lastBlock).toBe(lastBlock);
    expect(block.difficulty).toBe(difficulty);
    expect(block.nonce).toBe(nonce);
  });

  describe("Genesis", () => {
    const genesisBlock = Block.genesis();

    it("creates a genesis block", () => {
      expect(genesisBlock instanceof Block).toBe(true);
    });

    it("Genesis block has GEN_DATA", () => {
      expect(genesisBlock).toEqual(GENESIS_DATA);
    });
  });

  describe("mineblock()", () => {
    const lastBlock = new Block(GENESIS_DATA);
    const data = "some data";
    const minedBlock = Block.mineBlock({ lastBlock, data });

    it("should match `lastBlock` to the prev block `hash`", () => {
      expect(minedBlock.lastBlock).toEqual(lastBlock.hash);
    });
    it("should have neccessary data", () => {
      expect(minedBlock.timestamp).not.toBe(undefined);
      expect(minedBlock.data).toBe(data);
    });
    it("can hash a block", () => {
      expect(minedBlock.hash).toBe(
        sha256(
          minedBlock.timestamp,
          minedBlock.data,
          minedBlock.lastBlock,
          minedBlock.nonce,
          minedBlock.difficulty
        )
      );
    });
    it("should set the `hash` based on difficulty criteria", () => {
      expect(minedBlock.hash.slice(0, minedBlock.difficulty)).toBe(
        "0".repeat(minedBlock.difficulty)
      );
    });
    it("difficulty adjusted automatically", () => {
      const possibleValues1 = [
        lastBlock.difficulty + 1,
        lastBlock.difficulty - 1,
      ];
      const possibleValues2 = [
        minedBlock.difficulty + 1,
        minedBlock.difficulty - 1,
      ];
      const anotherNewBlock = Block.mineBlock({
        data: "abcd",
        lastBlock: minedBlock,
      });

      expect(possibleValues1.includes(minedBlock.difficulty)).toBe(true);
      expect(possibleValues2.includes(anotherNewBlock.difficulty)).toBe(true);
    });

    describe("adujustDifficulty()", () => {
      it("increases the difficulty if it takes too short", () => {
        expect(
          Block.adjustDifficulty({
            originalBlock: block,
            timestamp: block.timestamp + MINE_RATE - 500,
          })
        ).toBe(block.difficulty + 1);
      });

      it("decreases the difficulty if it takes too long", () => {
        expect(
          Block.adjustDifficulty({
            originalBlock: block,
            timestamp: block.timestamp + MINE_RATE + 500,
          })
        ).toBe(block.difficulty - 1 || 1);
      });
    });
  });
});
