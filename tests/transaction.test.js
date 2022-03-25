const Transaction = require("../transaction");
const { verifySignature } = require("../utils/ellipticCurve");
const Wallet = require("../wallet");
const { MINING_REWARD, REWARD_TRANSACTION } = require("../config");

describe("Transactions", () => {
  let transaction, senderWallet, recipient, amount;

  beforeEach(() => {
    senderWallet = new Wallet();
    recipient = "recipient-public-key";
    amount = 50;
    transaction = new Transaction({ senderWallet, recipient, amount });
  });

  it("should have an `id`", () => {
    expect(transaction).toHaveProperty("id");
  });

  it("should have `outputMap` property", () => {
    expect(transaction).toHaveProperty("outputMap");
  });

  describe("output", () => {
    it("outputs amount to recipient", () => {
      expect(transaction.outputMap[recipient]).toBe(amount);
    });

    it("calculates and outputs balence of the sender as output", () => {
      expect(transaction.outputMap[senderWallet.publicKey]).toBe(
        senderWallet.balance - amount
      );
    });
  });

  describe("input", () => {
    it("has `input` property", () => {
      expect(transaction).toHaveProperty("input");
    });

    it("has `timestamp` in the input", () => {
      expect(transaction.input).toHaveProperty("timestamp");
    });

    // it("sets the amount to `senderWallet` balance", () => {
    //   expect(senderWallet.balance).toHaveProperty("timestamp");
    // });

    it("sets the sender address to sender wallet public key", () => {
      expect(transaction.input.sender).toBe(senderWallet.publicKey);
    });

    it("signs the input", () => {
      expect(
        verifySignature(
          senderWallet.publicKey,
          transaction.outputMap,
          transaction.input.signature
        )
      ).toBe(true);
    });
  });

  describe("isValidTransaction()", () => {
    it("should return true if valid", () => {
      expect(Transaction.isValidTransaction(transaction)).toBe(true);
    });
    it("should return false if transaction outputMap not valid", () => {
      transaction.outputMap[senderWallet.publicKey] = 2000;
      expect(Transaction.isValidTransaction(transaction)).toBe(false);
    });
    it("should return false if transaction input not valid", () => {
      transaction.input.signature = new Wallet().sign("hola");
      expect(Transaction.isValidTransaction(transaction)).toBe(false);
    });
  });

  describe("update()", () => {
    let originalOutput,
      newRecepient = "lakdjflasdjflasjdlfjsadj-new-recipient",
      newSignature,
      oldBalance,
      oldSignature,
      nextAmount = 50;

    beforeEach(() => {
      oldSignature = transaction.input.signature;
      oldBalance = senderWallet.balance;
      originalOutput = transaction.outputMap[senderWallet.publicKey];

      transaction.update({
        senderWallet,
        recipient: newRecepient,
        amount: nextAmount,
      });
      newSignature = transaction.input.signature;
    });

    it("ouputs the amount to next recepient", () => {
      expect(transaction.outputMap[newRecepient]).toBe(nextAmount);
    });

    it("subtracts amount from original sender wallet", () => {
      expect(transaction.outputMap[senderWallet.publicKey]).toBe(
        originalOutput - nextAmount
      );
    });

    it("maintains total sum of input amounts", () => {
      const totalOutputAmount = Object.values(transaction.outputMap).reduce(
        (b1, b2) => b1 + b2
      );
      expect(totalOutputAmount).toBe(transaction.input.amount);
    });

    it("should update the signature", () => {
      expect(newSignature).not.toEqual(oldSignature);
    });
  });

  describe("rewardTransaction()", () => {
    let minerWallet, rewardTransaction;
    beforeEach(() => {
      minerWallet = new Wallet();
      rewardTransaction = Transaction.rewardTransaction({ minerWallet });
    });

    test("creates a transaction for miner with the reward input", () => {
      expect(rewardTransaction.input).toBe(REWARD_TRANSACTION);
    });

    test("creates a transaction object for miner", () => {
      expect(rewardTransaction.outputMap[minerWallet.publicKey]).toBe(
        MINING_REWARD
      );
    });
  });
});
