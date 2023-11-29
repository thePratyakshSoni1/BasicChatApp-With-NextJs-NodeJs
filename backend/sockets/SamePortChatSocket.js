const http = require("http");
const { EventEmitter } = require("events");
const crypto = require("crypto");
const {
  verifyLoginCookies,
  extractCookiesFromReq,
} = require("../repository/cookiesRepo");
const file = require("fs");
const {
  getChatsUpdateAfter,
  getSpecificChatHistory,
  getLastUpdate,
  addNewTextToUser,
} = require("../repository/chatsRepo");

//--------------IMPORTS-👆----------------

function sleep(mills) {
  return new Promise((reo, rjo) => {
    setTimeout(() => {
      reo();
    }, mills);
  });
}

async function waier() {
  return new Promise((res, rej) => {
    setTimeout(res, 1500);
  });
}

class SamePortChatSocket extends EventEmitter {
  // initialize object and add port
  constructor(options = {}) {
    super();
    this.port = options.port || 3200;
    this.GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
    this.OPCODES = { text: 0x01, close: 0x08 };
    this.connections = []; // { chatSessionId:string, userId: string, connectedAt: Date }[]
    this.connectionsAdded = 0;
    this.connectionsClosed = 0;
    this.isShowingSocketHealth = true;
    this.init();
  }

  async init() {
    if (this.server) throw new Error(`Server already initialized`);

    this.timelyShowSocketConditionLogs();
    
    this.on("upgradeRequest", (req, socket)=>{
      this.onConnectionUpgradeReq(req, socket)
    })

  }

  onConnectionUpgradeReq(req, socket) {
    console.log("Upgrade req received...");
    this.emit("headers", req);
    console.log("Cooks: ", req.headers.cookie);
    let socketFood = extractCookiesFromReq(req.headers.cookie);

    if (this.isVerifiedClientSocketReq(req)) {
      console.log("Is verified and logged user");
      this.connectionsAdded = this.connectionsAdded + 1;

      this.sendUpgradeConnectionResponse(socket, req);
      this.addSocketEventListeners(socket, socketFood.userId);
      
      this.onNewConnection(socket, socketFood.userId);
      this.checkLiveSocketUpdates(socket, socketFood);

      console.log("Out of promise callback");
    } else {
      socket.end("HTTP/1.1 400 Bad Request");
      return;
    }

  }

  closeSocketOnNumbConnection(socket) {
    let lastActivity = new Date(socket.connection.lastActivityAt);
    let currentTime = new Date();
    let connectionNumbFor = (currentTime - lastActivity) / 1000; //in seconds
    if (connectionNumbFor > 60 * 3) {
      console.log("Conection found Numb: 🗿🗿🗿🗿🗿");
      this.emit("closeSpecific", socket.connection.sessionId);
    }
  }

  isVerifiedClientSocketReq(req) {
    let isVerifiedLoggedUser =
      req.headers.cookie &&
      verifyLoginCookies(req.headers.cookie.split("; ")).isVerified;

    if (req.headers.upgrade !== "websocket") {
      return false;
    } else if (!isVerifiedLoggedUser) {
      return false;
    }

    return true;
  }

  addNewConnectionToList(socketFood) {
    this.connections.push({
      chatSessionId: socketFood.chatSession,
      userId: socketFood.userId,
      connectedAt: new Date(),
    });
    console.log(
      "Connections now: ",
      this.connectionsAdded + this.connectionsClosed,
      "\n====",
      this.connections,
      "\n===="
    );
  }

  sendUpgradeConnectionResponse(socket, req) {
    const acceptKey = req.headers["sec-websocket-key"];
    const acceptValue = this.generateAcceptValue(acceptKey);

    const responseHeaders = [
      "HTTP/1.1 101 Switching Protocols",
      "Upgrade: websocket",
      "Connection: Upgrade",
      `Sec-WebSocket-Accept: ${acceptValue}`,
    ];

    console.log("Writing Upgrade resp...");
    socket.write(responseHeaders.concat("\r\n").join("\r\n"));
  }

  checkLiveSocketUpdates(socket, socketFood) {
    new Promise(async (resCloseUserSocket, rejCloseUserSocket) => {
      this.listenToUserMessageUpdates(socket, socketFood, resCloseUserSocket);

      socket.on("error", (e) => {
        console.log(
          "Uncaught Socket error on: ",
          socket.connection.userId,
          socket.connection.sessionId,
          "\n==========\n",
          e,
          "\n=======\n"
        );
        this.emit("closeSpecific", socket.connection.sessionId);
      });
    }).then(() => console.log("Callback state settled"));
  }

  async timelyShowSocketConditionLogs() {
    new Promise(async (res, rej) => {
      while (this.isShowingSocketHealth) {
        console.log(
          "\n====\n",
          "Connections now: ",
          this.connectionsAdded + this.connectionsClosed,
          "\n",
          this.connections.map(
            (it) => `${it.userId} || ${it.chatSessionId} || ${it.connectedAt}`
          ),
          "\n===="
        );
        await sleep(5 * 60 * 1000);
      }
      console.log("Stopping health logs");
      res();
    });
  }

  listenToUserMessageUpdates(socket, socketFood, onListenerClose) {
    let isConnected = true;
    new Promise(async (resStoplistenning, rejStoplistenning) => {
      let lastUpdated = undefined;

      this.on("closeSpecific", (sessionId) => {
        if (socket.connection.sessionId === sessionId) {
          console.log("Closing socket: ", socket.connection.sessionId);
          isConnected = false;
          this.connectionsClosed = this.connectionsClosed - 1;

          let closedIndx = undefined;
          this.connections.find((it, indx) => {
            if (it.chatSessionId === socket.connection.sessionId) {
              closedIndx = indx;
              return true;
            }
          });

          if (closedIndx) {
            this.connections = [
              ...this.connections.slice(0, closedIndx),
              ...this.connections.slice(
                closedIndx + 1,
                this.connections.length
              ),
            ];
            console.log(
              "Now Connections: ",
              "\n>>>>\n",
              this.connections,
              "\n>>>>\n"
            );
          }
          onListenerClose();
        }
      });

      this.on("closeAllConnection", () => {
        console.log("Closing socket: ", socket.connection);
        isConnected = false;
        this.connectionsClosed = this.connectionsClosed - 1;

        let closedIndx = undefined;
        this.connections.find((it, indx) => {
          if (it.chatSessionId === socketFood.chatSessionId) {
            closedIndx = indx;
            return true;
          }
        });

        if (closedIndx) {
          this.connections = [
            ...this.connections.slice(0, closedIndx),
            ...this.connections.slice(closedIndx + 1, this.connections.length),
          ];
          console.log(
            "Now Connections: ",
            "\n>>>>\n",
            this.connections,
            "\n>>>>\n"
          );
        }
        onListenerClose();
      });

      while (isConnected) {
        let updates = await getChatsUpdateAfter(socketFood.userId, lastUpdated);

        if (updates) {
          socket.lastActivityAt = (new Date()).toUTCString()
          lastUpdated = updates.lastUpdated;
          socket.write(this.createFrame(updates));
        } else {
          // console.log("No updates...");
          this.closeSocketOnNumbConnection(socket);
        }
        await sleep(2000);
      }
      resStoplistenning();
    }).then(() =>
      console.log("Updates Listener settled: ", socket.connection.sessionId)
    );
  }

  addSocketEventListeners(socket, userId) {

    // this.server.on("close", () => {
    //   this.isShowingSocketHealth = false;
    //   console.log("CLOSING SOCKET SERVER ⛔⛔⛔", socket);
    //   socket.destroy();
    // });

    socket.on("data", (buffer) => {
      // console.log("socket on data received: ...", buffer.toString());
      // this.emit("data", this.parseFrame(buffer), userId, (data) => {
      //   socket.write(this.createFrame(data));
      // });
      
      socket.lastActivityAt = (new Date()).toUTCString()
      this.emit("data", this.parseFrame(buffer, socket), userId, socket);
    });
  }

  generateAcceptValue(acceptKey) {
    return crypto
      .createHash("sha1")
      .update(acceptKey + this.GUID, "binary")
      .digest("base64");
  }

  parseFrame(buffer, socket) {
    // First byte processing ( to get opCode i.e. to close connection or is a msg )
    const firstByte = buffer.readUInt8(0);
    const finBit = firstByte & 0b10000000;
    const opCode = firstByte & 0b00001111; //  get last 4 bits of a byte

    console.log("OPCODE: ", opCode, "FIN: ", finBit)
    if (opCode === this.OPCODES.close) {
      console.log("OPCODE Received: closing");
      this.emit("close", socket.connection.sessionId);
      return null;
    } else if (opCode !== this.OPCODES.text) {
      return;
    }

    // If opCode denotes a txt msg
    // Second byte processing to set msg payload length offset
    const secondByte = buffer.readUInt8(1);

    let offset = 2; // we already read 2 bytes of frame
    let payloadLength = secondByte & 0b01111111; // get last 7 bits

    /***
     * 125, 126, 127 => are length of data payload size and therefore actual length of data will
     * be know by knowing in which category data falls depending on that we will know data length will be stored in
     * 2 bytes or 8 bytes
     *
     * when(payLoadData.length){
     *     <= 125 -> { it's length value is same as payloadDataLength }
     *     >= 125 -> { value could be either 126 or 127 }
     * }
     *
     * b/w 126 -> 65,535 bytes of data ( length of it will be stored in 2 bytes )
     * b/w 127 -> ~9223372036.85 Gigabytes of data ( apprx 90K Petabytes ) ( length of it will be stored in 8 bytes )
     *
     ***/

    if (payloadLength === 126) {
      offset += 2; //next 2 bytes of frame
    } else if (payloadLength === 127) {
      offset += 8; ////next 8 bytes of frame
    }

    // Futher processing to extract mask bit ( stored in 1st bit of second byte )
    const isMasked = Boolean((secondByte >>> 7) & 0b00000001); // get first bit of second byte

    if (isMasked) {
      const maskingKey = buffer.readUInt32BE(offset); //read 4-byte (32 bit) masking key present after given offset/bytes
      // console.log("Masking key: ", maskingKey)
      offset += 4; // read next 4 bytes of frame i.e masking key
      const payload = buffer.subarray(offset);
      // console.log("Mansked payload is: ", payload, "\n", new Uint8Array(payload));
      const result = this.unmask(payload, maskingKey.toString());
      return result.toString("utf-8");
      //   return result;
    }

    return buffer.subarray(offset).toString("utf-8");
  }

  unmask(payload, maskingKey) {
    const result = Buffer.alloc(Buffer.byteLength(payload));

    for (let i = 0; i < Buffer.byteLength(payload); ++i) {
      const j = i % 4;
      const maskingKeyByteShift = j === 3 ? 0 : (3 - j) << 3;
      const maskingKeyByte =
        (maskingKeyByteShift === 0
          ? maskingKey
          : maskingKey >>> maskingKeyByteShift) & 0b11111111;
      const transformedByte = maskingKeyByte ^ payload.readUInt8(i);
      result.writeUInt8(transformedByte, i);
    }

    // console.log("Unmased fun result: ", new Uint8Array(result));
    return result;
  }

  createFrame(data) {
    /***
     * 1st byte -> FIN,  RSV1 , RSV2 , RSV3, OPCODE : each 1 bit
     * 2nd byte -> Data length category 126 or 127 ( decides data length would be stored in 2bytes or 8bytes )
     *
     * ***/

    const payload = JSON.stringify(data);

    const payloadByteLength = Buffer.byteLength(payload);
    let payloadBytesOffset = 2;
    let payloadLength = payloadByteLength;

    if (payloadByteLength > 65535) {
      // data length more that 2 bytes
      payloadBytesOffset += 8;
      payloadByteLength = 127;
    } else if (payloadByteLength > 125) {
      payloadBytesOffset += 2;
      payloadLength = 126;
    }

    const buffer = Buffer.alloc(payloadBytesOffset + payloadByteLength);

    // frist byte
    // Sets value to: [FIN (1), RSV1 (0), RSV2 (0), RSV3 (0), Opсode (0x01 - text frame)]
    buffer.writeUint8(0b10000001, 0);

    // Second byte: Actual payload size ( if <= 125 ) or 126 or 127
    buffer[1] = payloadLength;

    if (payloadLength === 126) {
      // write actual payload length as 16-bit unsigned int ( 2 bytes ) starting from 2nd byte
      buffer.writeUInt16BE(payloadByteLength, 2);
    } else if (payloadByteLength === 127) {
      // write actual payload length as 64-bit unsigned int ( 8 bytes ) starting from 2nd byte
      buffer.writeBigUInt64BE(BigInt(payloadByteLength), 2);
    }

    // finally write data to buffer
    buffer.write(payload, payloadBytesOffset);
    return buffer;
  }


  /** Adds `socket.connection: { userId:String, addedAt: string, sessionId: string, lastActivityAt: string },`
   * Send `sessionId` as firstPing,
   * Adds connection details to list
   */
  onNewConnection(socket, userId) {
    const randomId = `CHATSESSION_${parseInt(
      (Math.random() * 500000).toString()
    )}${userId.split("@")[0]}`;

    socket.connection = {
      userId: userId,
      addedAt: new Date().toUTCString(),
      sessionId: randomId,
      lastActivityAt: new Date().toUTCString(),
    }

    socket.write(
      this.createFrame(
        JSON.stringify({
          isFirstPing: true,
          chatSessionId: socket.connection.sessionId,
        })
      )
    )

    this.addNewConnectionToList({
      userId: userId,
      chatSession: socket.connection.sessionId,
    })

  }

}

function activateChatSocket() {
  const chatSocketHandler = new SamePortChatSocket();
  chatSocketHandler.on("headers", ({ headers }) =>
    console.log("Headers Received: \n", headers)
  );

  chatSocketHandler.on("data", (message, userId, socket) => {
    if (!message) return;

    // console.log("Received for parsing; ", message);
    const data = JSON.parse(message);
    if (data.isCloseReq) {
      console.log("GIT CLOSE REQ");
      chatSocketHandler.emit("closeSpecific", socket.connection.sessionId);
    } else {
      addNewTextToUser(userId, data);
    }
    console.log(`Message ${socket.connection.sessionId}:`, "data");

  });

  chatSocketHandler.on("close", (sessionId) => {
    console.log("Conn closed");
    chatSocketHandler.emit("closeSpecific", sessionId);
  });

  console.log(`🚀🚀 ChatSocket Activated on same port !`);
  return chatSocketHandler

}


module.exports = { activateChatSocket };