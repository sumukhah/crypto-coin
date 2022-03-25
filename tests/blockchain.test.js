const { BlockChain } = require("../blockchain");
const { GENESIS_DATA } = require("../config");
const { sha256 } = require("../utils/crypto");
const Wallet = require("../wallet");
const Transaction = require("../transaction");

describe("Block chain", () => {
  jest.spyOn(console, "info").mockImplementation((a) => {
    // console.log(a);
  });
  let blockchain;
  beforeEach(() => {
    blockchain = new BlockChain();
  });

  it("contains the genesis block", () => {
    expect(blockchain.chain[0]).toEqual(GENESIS_DATA);
  });
  it("can add a block to the chain", () => {
    const addedBlockHash = blockchain.addNewBlock({ data: [1, 2, 3] });
    expect(blockchain.chain[blockchain.chain.length - 1].hash).toEqual(
      addedBlockHash
    );
  });

  describe("is a valid chain()", () => {
    beforeEach(() => {
      blockchain.addNewBlock({
        data: [
          new Transaction({
            senderWallet: new Wallet(),
            amount: 20,
            recipient: "me-1",
          }),
        ],
      });
      blockchain.addNewBlock({
        data: [
          new Transaction({
            senderWallet: new Wallet(),
            amount: 30,
            recipient: "me-2",
          }),
        ],
      });
      blockchain.addNewBlock({
        data: [
          new Transaction({
            senderWallet: new Wallet(),
            amount: 1000,
            recipient: "me-3",
          }),
        ],
      });
    });

    describe("when the chain does't start with genesis block", () => {
      it("should return false ", () => {
        console.error = jest.fn();
        // jest.spyOn(console, "error").mockImplementation((a) => {
        //   // console.log(a);
        // });
        blockchain.chain[0].data = "tampered-data";
        expect(BlockChain.isValidChain(blockchain.chain)).toBe(false);
        expect(console.error).toHaveBeenCalled();
      });
    });

    describe("If the last block hash is not matching", () => {
      it("shold return false", () => {
        blockchain.chain[1].lastBlock = "mola";
        expect(BlockChain.isValidChain(blockchain.chain)).toBe(false);
      });
    });

    describe("If the data is tampered", () => {
      it("shold return false", () => {
        blockchain.chain[1].data = "fake-data";
        expect(BlockChain.isValidChain(blockchain.chain)).toBe(false);
      });
    });

    describe("If the chain does not contain any invalid blocks", () => {
      it("shold return true", () => {
        expect(BlockChain.isValidChain(blockchain.chain)).toBe(true);
      });
    });
  });

  describe("Replace chain()", () => {
    let newChain, originalChain;
    beforeEach(() => {
      newChain = new BlockChain();
      originalChain = newChain.chain;
    });
    describe("If the new chain is not longer", () => {
      // const originalChain = newChain.chain.copy();
      it("Should not replace the chain", () => {
        blockchain.replaceChain(newChain.chain);
        expect(blockchain.chain).toEqual(originalChain);
      });
    });

    describe("If the new chain is longer", () => {
      beforeEach(() => {
        newChain.addNewBlock({
          data: [
            new Transaction({
              senderWallet: new Wallet(),
              amount: 20,
              recipient: "me-1",
            }),
          ],
        });
        newChain.addNewBlock({
          data: [
            new Transaction({
              senderWallet: new Wallet(),
              amount: 30,
              recipient: "me-2",
            }),
          ],
        });
        newChain.addNewBlock({
          data: [
            new Transaction({
              senderWallet: new Wallet(),
              amount: 1000,
              recipient: "me-3",
            }),
          ],
        });
      });
      it("should not replace if the chain is not valid", () => {
        originalChain = blockchain.chain;
        newChain.chain[2].hash = "some-fake-data";
        expect(blockchain.chain).toEqual(originalChain);
      });
      it("should replace the chain if valid", () => {
        blockchain.replaceChain(newChain.chain);
        expect(blockchain.chain).toEqual(newChain.chain);
      });
    });

    describe("validTransaction()", () => {
      let transaction, wallet, rewardTransaction;
      beforeEach(() => {
        wallet = new Wallet();
        transaction = new Transaction({
          senderWallet: wallet,
          amount: 10,
          recipient: "foo-bar",
        });
        rewardTransaction = Transaction.rewardTransaction({
          minerWallet: wallet,
        });
      });

      it("returns true if transaction if valid", () => {
        newChain.addNewBlock({ data: [transaction, rewardTransaction] });
        expect(blockchain.validTransactionsData(newChain)).toBe(true);
      });

      it("returns false if chain data has multiple rewards", () => {
        newChain.addNewBlock({
          data: [transaction, rewardTransaction, rewardTransaction],
        });
        expect(blockchain.validTransactionsData(newChain)).toBe(false);
      });

      it("returns false if chain data has malformed transaction outputMap", () => {
        transaction.outputMap[wallet.publicKey] = 9999;
        newChain.addNewBlock({
          data: [transaction, rewardTransaction],
        });
        expect(blockchain.validTransactionsData(newChain)).toBe(false);
      });

      it("returns false if wallet balance is malformed", () => {
        let malformedWallet = new Wallet();
        malformedWallet.balance = 1000000;
        transaction = new Transaction({
          senderWallet: malformedWallet,
          recipient: "another-hacker",
          amount: 900000,
        });

        newChain.addNewBlock({
          data: [transaction, rewardTransaction],
        });
        expect(blockchain.validTransactionsData(newChain)).toBe(false);
      });
    });
  });
});
