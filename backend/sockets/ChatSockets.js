const http = require("http");
const { EventEmitter } = require("events");
const crypto = require("crypto");

class WebSocketServer extends EventEmitter {
  // initialize object and add port
  constructor(options = {}) {
    super();
    this.port = options.port || 3200;
    this.init();
    this.GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
    this.OPCODES = { text: 0x01, close: 0x08 };
  }

  init() {
    if (this.server) throw new Error(`Server already initialized`);

    this.server = http.createServer((req, res) => {
      const UPGRADE_REQ_CODE = 426;
      const body = http.STATUS_CODES[UPGRADE_REQ_CODE];
      res.writeHead(UPGRADE_REQ_CODE, {
        "Content-Type": "text/plain",
        Upgrade: "WebSocket",
      });
      res.end(body);
    });

    this.server.on(`upgrade`, (req, socket) => {
      console.log("Upgrade req received...");
      this.emit("headers", req);
      if (req.headers.upgrade !== "websocket") {
        socket.end("HTTP/1.1 400 Bad Request");
        return;
      }

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

      this.server.on("close", () => {
        console.log("closing...", socket);
        socket.destroy();
      });

      socket.on("data", (buffer) => {
        console.log("socket on data received: ...", buffer);
        this.emit("data", this.parseFrame(buffer), (data)=>socket.write(this.createFrame(data)));
      });
    });
  }

  generateAcceptValue(acceptKey) {
    return crypto
      .createHash("sha1")
      .update(acceptKey + this.GUID, "binary")
      .digest("base64");
  }

  parseFrame(buffer) {
    // First byte processing ( to get opCode i.e. to close connection or is a msg )
    const firstByte = buffer.readUInt8(0);
    const opCode = firstByte & 0b00001111; //  get last 4 bits of a byte

    if (opCode === this.OPCODES.close) {
      this.emit("close");
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

  listen(callback) {
    this.server.listen(this.port, callback);
  }
}

const PORT = 3200;
const server = new WebSocketServer({ port: PORT });
server.on("headers", ({ headers }) =>
  console.log("Headers Received: \n", headers)
);

server.on("data", (message, reply) => {
  if (!message) return;

  // console.log("Received for parsing; ", message);
  const data = JSON.parse(message);
  console.log("Message received:", data);
  return reply({pong: data})
});

server.listen(() => {
  console.log(`WebSocket server listening on ${PORT}`);
});
