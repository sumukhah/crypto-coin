const Wallet = require("../wallet");
const { verifySignature } = require("../utils/ellipticCurve");
const Transaction = require("../transaction");
const { BlockChain } = require("../blockchain/index");
const { INITIAL_BALANCE } = require("../config/index");
//  bitcoin use public key cryptography to create a key pair that controls
// access to bitcoins. The key pair consists of a private key and—derived from
// it—a unique public key. The public key is used to receive bitcoins, and the
// private key is used to sign transactions to spend those bitcoins.

// private key is a number(binary) with 256 digits

describe("Wallet", () => {
  let wallet;
  beforeEach(() => {
    wallet = new Wallet();
  });

  // describe("createNewWallet()", () => { it();
  // });
  // describe("wallet", () => {
  // });
  it("should have a valid `public keys`", () => {
    expect(wallet).toHaveProperty("publicKey");
    // hexa decimal form of public key should be 64 string long
    // expect(wallet.publicKey.length).toBe(64);
  });

  describe("signData", () => {
    const message = "foo-bar";

    it("should verify the signature using public keys", () => {
      const { publicKey } = wallet;
      expect(verifySignature(publicKey, message, wallet.sign(message))).toBe(
        true
      );
    });

    it("should not verify the signature using invalid public keys", () => {
      const newWallet = new Wallet();
      expect(
        verifySignature(newWallet.publicKey, message, wallet.sign(message))
      ).toBe(false);
    });
  });

  describe("createTransaction()", () => {
    // beforeEach(() => {})
    describe("when transaction amount greater than the wallet balance", () => {
      it("should reject the transacation", () => {
        expect(() => {
          wallet.createTransaction({
            amount: 9999,
            recipient: "some-random-guy",
          });
        }).toThrow("invalid amount provided for the transaction");
      });
    });
    describe("when amount is valid", () => {
      let recipient, amount, transaction;
      beforeEach(() => {
        recipient = "some-random-girl";
        amount = 1;
        transaction = wallet.createTransaction({
          recipient,
          amount,
        });
      });
      it("should create the transacation", () => {
        expect(transaction instanceof Transaction).toBe(true);
      });
      it("transaction input is valid and transfered from sender wallet", () => {
        expect(transaction.input.sender).toBe(wallet.publicKey);
      });
      it("should create the transacation", () => {
        expect(transaction.outputMap[recipient]).toBe(amount);
      });
    });

    describe("when chain is passed", () => {
      it("should call `Wallet.calculateBalance`", () => {
        const mockFunction = jest.fn();
        const calcBalance = Wallet.calculateBalance;
        Wallet.calculateBalance = mockFunction;
        wallet.createTransaction({
          recipient: "foo",
          amount: 20,
          blockchain: new BlockChain(),
        });
        expect(mockFunction).toHaveBeenCalled();
        Wallet.calculateBalance = calcBalance;
      });
    });
  });
  describe("calculateBalance()", () => {
    let blockchain;
    beforeEach(() => {
      blockchain = new BlockChain();
    });
    describe("If no transaction made so far", () => {
      it("should show the initial wallet balance", () => {
        expect(
          Wallet.calculateBalance({
            publicKey: wallet.publicKey,
            chain: blockchain.chain,
          })
        ).toBe(INITIAL_BALANCE);
      });
    });
    describe("If wallet recieved transaction", () => {
      let expectedBalance;
      beforeEach(() => {
        expectedBalance = 0;
        for (let i = 0; i < 2; i++) {
          const newWallet = new Wallet();
          const transaction = newWallet.createTransaction({
            recipient: wallet.publicKey,
            amount: 20,
          });
          blockchain.addNewBlock({ data: [transaction] });

          expectedBalance += 20;
        }
      });
      it("should show remaining balance", () => {
        expect(
          Wallet.calculateBalance({
            publicKey: wallet.publicKey,
            chain: blockchain.chain,
          })
        ).toBe(expectedBalance + INITIAL_BALANCE);
      });
    });

    describe("If wallet has made a trasaction", () => {
      let recentTransaction;
      beforeEach(() => {
        recentTransaction = wallet.createTransaction({
          recipient: "foo",
          amount: 20,
        });
        blockchain.addNewBlock({ data: [recentTransaction] });
      });
      it("should show output for recent transaction", () => {
        expect(
          Wallet.calculateBalance({
            publicKey: wallet.publicKey,
            chain: blockchain.chain,
          })
        ).toBe(recentTransaction.outputMap[wallet.publicKey]);
      });

      describe("if there are transaction in same or subsequent block", () => {
        let sameBlockBalance, nextBlockBalance;
        beforeEach(() => {
          recentTransaction = wallet.createTransaction({
            recipient: "fo-k",
            amount: 50,
          });
          const recentTransaction1 = new Wallet().createTransaction({
            recipient: wallet.publicKey,
            amount: 20,
          });
          sameBlockBalance = Math.abs(
            recentTransaction1.outputMap[wallet.publicKey] +
              recentTransaction.outputMap[wallet.publicKey]
          );

          blockchain.addNewBlock({
            data: [recentTransaction, recentTransaction1],
          });

          const nextTransaction = new Wallet().createTransaction({
            recipient: wallet.publicKey,
            amount: 20,
          });
          blockchain.addNewBlock({
            data: [nextTransaction],
          });
          nextBlockBalance = nextTransaction.outputMap[wallet.publicKey];
        });
        it("includes output balance in the returned balance", () => {
          const amount = Wallet.calculateBalance({
            publicKey: wallet.publicKey,
            chain: blockchain.chain,
          });
          expect(amount).toBe(nextBlockBalance + sameBlockBalance);
        });
      });
    });
  });
});
