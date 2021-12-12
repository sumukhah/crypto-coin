const WebSocket = require("ws");
const peers = require("./peersList");
const args = require("yargs/yargs")(process.argv.slice(2)).argv;

const P2P_PORT = args.socket; // address of port

class P2PConnection {
  constructor(blockchain) {
    this.blockchain = blockchain;
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

    console.log("socket server is running on ", P2P_PORT);

    // subscribe to other peers
    this.connectToPeers();
  }

  connectSocket(socket) {
    this.sockets.push(socket);
    console.log("socket connected");
    this._brodcastMessage(socket);
    this.messageHandler(socket);
  }

  _brodcastMessage(socket) {
    socket.send(JSON.stringify(this.blockchain));
  }

  brodcastMinedBlock = () => {
    console.log("trying to brodcast");
    this.sockets.forEach((socket) => {
      this._brodcastMessage(socket);
    });
  };

  messageHandler(socket) {
    socket.on("message", (message) => {
      const peerBlockChain = JSON.parse(message);
      this.blockchain.replaceChain(peerBlockChain.chain);
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
        const socket = new WebSocket(`ws://localhost:${peer}`);
        // if peer is available
        socket.on("open", () => {
          this.connectSocket(socket);
        });
        // if the peer is not available
        socket.onerror = () => {
          console.log("unable to connect to ", peer);
        };
      }
    });
  }
}

module.exports = P2PConnection;
