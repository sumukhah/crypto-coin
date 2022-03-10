const WebSocket = require("ws");
const peers = require("./peersList");
const args = require("yargs/yargs")(process.argv.slice(2)).argv;

const P2P_PORT = args.socket; // address of socket to run ws
const BLOCK_TRANSMISSION = "BLOCK_TRANSMISSION";
const TRANSACTION_TRANSMISSION = "TRANSACTION_TRANSMISSION";

class P2PConnection {
  constructor(blockchain, transactionPool) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.sockets = [];
    this.init();
  }

  init() {
    // start socket server
    const server = new WebSocket.Server({ port: P2P_PORT });

    server.on("connection", (socket) => {
      this.connectSocket(socket);
    });

    // server.on("close", (socket) => {
    //   this.disconnectSocket(socket);
    // });

    console.info("socket server is running on ", P2P_PORT);

    // subscribe to other peers
    this.connectToPeers();
  }

  connectSocket(socket) {
    this.sockets.push(socket);

    this._brodcastData(socket, BLOCK_TRANSMISSION, this.blockchain);
    this.messageHandler(socket);
  }

  _brodcastData(socket, type, payload) {
    socket.send(JSON.stringify({ type, payload }));
  }

  brodcastMinedBlock = () => {
    console.info("trying to brodcast block chain");
    this.sockets.forEach((socket) => {
      this._brodcastData(socket, BLOCK_TRANSMISSION, this.blockchain);
    });
  };

  brodcastTransactions = (transaction) => {
    console.info("trying to brodcast transactions");
    this.sockets.forEach((socket) =>
      this._brodcastData(socket, TRANSACTION_TRANSMISSION, transaction)
    );
  };

  // on recieved brodcast
  messageHandler(socket) {
    socket.on("message", (message) => {
      const { type, payload } = JSON.parse(message);

      switch (type) {
        case BLOCK_TRANSMISSION:
          this.blockchain.replaceChain(payload.chain);
          break;
        case TRANSACTION_TRANSMISSION:
          // console.log(payload, typeof payload);
          // const pool = new Map(payload);
          console.log(payload, "payload");
          this.transactionPool.setTransaction(payload);
          break;
      }
    });
  }

  // disconnectSocket(socket) {
  //   this.sockets = this.sockets.filter((s) => s !== socket);
  //   console.log("disconnected sockets");
  // }

  connectToPeers() {
    peers.forEach((peer) => {
      if (peer == P2P_PORT) {
        // do not connect to your own server port.
      } else {
        const socket = new WebSocket(`ws://192.168.0.132:${peer}`);

        // if peer is available
        socket.on("open", () => {
          this.connectSocket(socket);
        });
        // if the peer is not available
        socket.onerror = (err) => {
          console.error("unable to connect to ", peer, "\n", err.message);
        };
      }
    });
  }
}

module.exports = P2PConnection;
