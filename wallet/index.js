const { ec } = require("../utils/ellipticCurve");
const { sha256 } = require("../utils/crypto");
const Transaction = require("../transaction");
class Wallet {
  constructor() {
    // this.publicKeys = [];
    this.balance = 1000;
    this.generateKeys();
  }
  generateKeys() {
    this.key = ec.genKeyPair();
    const publicKey = this.key.getPublic().encode("hex");
    // this.publicKeys.push(publicKey);
    this.publicKey = publicKey;
  }
  sign(msg) {
    return this.key.sign(sha256(msg));
    // return this.key;
  }
  createTransaction({ recipient, amount }) {
    if (amount > this.balance) {
      throw new Error("invalid amount provided for the transaction");
    }
    const transaction = new Transaction({
      senderWallet: this,
      recipient,
      amount,
    });
    return transaction;
  }
}

module.exports = Wallet;
