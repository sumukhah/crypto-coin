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

  replaceTransactionMap = (transactionMap) => {
    this.transactionMap = transactionMap;
  };

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
