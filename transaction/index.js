const { v4: uuidv4 } = require("uuid");
const { verifySignature } = require("../utils/ellipticCurve");
const { REWARD_TRANSACTION, MINING_REWARD } = require("../config/index");

class Transaction {
  constructor({ senderWallet, recipient, amount, input, outputMap }) {
    this.id = uuidv4();
    this.outputMap =
      outputMap || this.createOutputMap({ recipient, amount, senderWallet });
    this.input = input || this.createInputMap({ senderWallet });
  }

  static isValidTransaction(transaction) {
    const {
      input: { sender, amount, signature },
      outputMap,
    } = transaction;
    if (transaction.input.sender === REWARD_TRANSACTION.sender) {
      return true;
    }

    if (
      amount !== Object.values(outputMap).reduce((prev, curr) => prev + curr)
    ) {
      return false;
    }

    if (!verifySignature(sender, outputMap, signature)) {
      return false;
    }

    return true;
  }

  createOutputMap({ senderWallet, recipient, amount }) {
    const outputMap = {};
    outputMap[recipient] = amount;
    outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
    return outputMap;
  }

  createInputMap({ senderWallet }) {
    const input = {
      timestamp: Date.now(),
      sender: senderWallet.publicKey,
      amount: senderWallet.balance,
      signature: senderWallet.sign(this.outputMap),
    };
    return input;
  }

  static rewardTransaction({ minerWallet }) {
    return new this({
      input: REWARD_TRANSACTION,
      outputMap: { [minerWallet.publicKey]: MINING_REWARD },
    });
  }

  update({ recipient, senderWallet, amount }) {
    if (amount > senderWallet.balance) {
      throw Error("Invalid amount");
    }
    this.outputMap[recipient] = amount;
    this.outputMap[senderWallet.publicKey] -= amount;
    this.input = this.createInputMap({ senderWallet });
  }
}

module.exports = Transaction;
