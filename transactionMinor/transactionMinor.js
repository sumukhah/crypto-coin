import P2PConnection from "../socket";
class TransactionMinor {
  constructor(wallet, transactionPool, blockchain, network) {
    this.wallet = wallet;
    this.transactionPool = transactionPool;
    this.blockchain = blockchain;
    this.network = network;
  }

  mineTransaction = () => {
    // get valid transactions from pool
    // const validTransactions = this.transactionPool.getValidTransactions();
    // this.blockchain.addNewBlock({ data: validTransactions });
    // console.log(this.blockchain);
  };
}
