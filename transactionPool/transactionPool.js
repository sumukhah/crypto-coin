const Transaction = require("../transaction");
// {id: transaction}
class TransactionPool {
  transactionMap = {};
  setTransaction(transaction) {
    this.transactionMap[transaction.id] = transaction;
  }
  existingTransaction({ inputAddress }) {
    return Object.values(this.transactionMap).find(
      (transaction) => transaction.input.sender === inputAddress
    );
  }
  clear() {
    this.transactionMap = {};
  }

  replaceTransactionMap = (transactionMap) => {
    this.transactionMap = transactionMap;
  };

  clearDoubleSpends(blockchain) {
    const { chain } = blockchain;
    for (i = 1; i < chain.length; i++) {
      for (let transaction of chain[i].data) {
        if (this.transactionMap[transaction.id]) {
          delete this.transactionMap[transaction.id];
        }
      }
    }
  }

  getValidTransactions = () => {
    const validTransactions = [];

    Object.values(this.transactionMap).forEach((transaction) => {
      const isValid = Transaction.isValidTransaction(transaction);
      if (isValid) {
        validTransactions.push(transaction);
      }
    });

    return validTransactions;
  };
}

module.exports = TransactionPool;
