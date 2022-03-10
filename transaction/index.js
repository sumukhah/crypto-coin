const { v4: uuidv4 } = require("uuid");
const { verifySignature } = require("../utils/ellipticCurve");

class Transaction {
  constructor({ senderWallet, recipient, amount }) {
    this.id = uuidv4();
    this.createOutputMap({ recipient, amount, senderWallet });
    this.createInputMap({ senderWallet });
  }

  static isValidTransaction(transaction) {
    const {
      input: { sender, amount, signature },
      outputMap,
    } = transaction;

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
    this.outputMap = outputMap;
  }

  createInputMap({ senderWallet }) {
    const input = {
      timestamp: Date.now(),
      sender: senderWallet.publicKey,
      amount: senderWallet.balance,
      signature: senderWallet.sign(this.outputMap),
    };
    this.input = input;
  }

  update({ recipient, senderWallet, amount }) {
    if (amount > senderWallet.balance) {
      throw Error("Invalid amount");
    }
    this.outputMap[recipient] = amount;
    this.outputMap[senderWallet.publicKey] -= amount;
    this.createInputMap({ senderWallet });
  }
}

module.exports = Transaction;
