const { ec } = require("../utils/ellipticCurve");
const { sha256 } = require("../utils/crypto");
const Transaction = require("../transaction");
const { INITIAL_BALANCE } = require("../config");

class Wallet {
  constructor() {
    // this.publicKeys = [];
    this.balance = INITIAL_BALANCE;
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

  createTransaction({ recipient, amount, blockchain }) {
    if (blockchain) {
      this.balance = Wallet.calculateBalance({
        wallet: this,
        blockchain,
      });
    }
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

  static calculateBalance({ publicKey, chain }) {
    let totalBalance = 0;
    let madeTransaction = false;

    for (let i = chain.length - 1; i > 0; i--) {
      const block = chain[i];
      for (let transaction of block.data) {
        if (transaction.input.sender === publicKey) {
          madeTransaction = true;
        }
        if (transaction.outputMap[publicKey]) {
          totalBalance += transaction.outputMap[publicKey];
        }
      }
      if (madeTransaction) {
        break;
      }
    }
    return madeTransaction ? totalBalance : INITIAL_BALANCE + totalBalance;
  }
}

module.exports = Wallet;
