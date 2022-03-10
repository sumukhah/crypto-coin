const TransactionPool = require("../transactionPool/transactionPool.js");
const Transaction = require("../transaction/index");
const Wallet = require("../wallet/index");

describe("Transaction Pool", () => {
  let transaction, transactionPool, senderWallet;

  beforeEach(() => {
    transactionPool = new TransactionPool();
    senderWallet = new Wallet();

    transaction = new Transaction({
      senderWallet,
      recipient: "fake-recipient-id",
      amount: 10,
    });
  });

  describe("setTransaction()", () => {
    it("Adds a transaction to transaction pool", () => {
      transactionPool.setTransaction(transaction);

      expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
    });
  });

  describe("existingTransaction()", () => {
    it("checks if a transaction exist with same sender public key", () => {
      transactionPool.setTransaction(transaction);
      expect(
        transactionPool.existingTransaction({
          inputAddress: transaction.input.sender,
        })
      ).toBe(transaction);
    });
  });

  describe("validTransactions()", () => {
    let validTransactions;

    beforeEach(() => {
      validTransactions = [];
      for (i = 0; i < 10; i++) {
        const transaction = new Transaction({
          senderWallet,
          recipient: `fake-recepient-${i}`,
          amount: 1,
        });

        if (i % 3 === 0) {
          transaction.input.amount = 1000;
        } else if (i % 3 === 1) {
          transaction.input.signature = "fake-signature";
        } else {
          validTransactions.push(transaction);
        }
        transactionPool.setTransaction(transaction);
      }
    });

    it("get all valid transaction from pool", () => {
      expect(transactionPool.getValidTransactions()).toEqual(validTransactions);
    });
  });
});
