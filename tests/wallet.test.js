const Wallet = require("../wallet");
const { verifySignature } = require("../utils/ellipticCurve");
const Transaction = require("../transaction");
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
    let wallet;
    const message = "foo-bar";

    beforeEach(() => {
      wallet = new Wallet();
    });

    it("should verify the signature using public keys", () => {
      const { publicKey } = wallet;
      expect(verifySignature(publicKey, message, wallet.sign(message))).toBe(
        true
      );
    });

    it("should not verify the signature using invalid public keys", () => {
      const invalidPublicKey = "1".repeat(64);
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
  });
});
