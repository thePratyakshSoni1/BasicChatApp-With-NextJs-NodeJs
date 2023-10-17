
const { EventEmitter } = require("events");

class WebSocketServer extends EventEmitter {
    // initialize object and add port
    constructor(options = {}) {
      super();
      this.port = options.port || 3200;
      this.init();
      this.GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
      this.OPCODES = { text: 0x01, close: 0x08 };
      this.connections = []; // { chatSessionId:string, userId: string, connectedAt: Date }[]
    }
  
    async init() {
      if (this.server) throw new Error(`Server already initialized`);
  
      console.log("I'm a Init method")
      this.onConnectionUpgradeReq("r", "s")
    }
  
    onConnectionUpgradeReq(req, socket) {
      console.log("Upgrade req received...");  
      if(this.isVerifiedClientSocketReq("re0"))
        this.addNewConnectionToList();
    }
  
    isVerifiedClientSocketReq(req) {
      let isVerifiedLoggedUser =
        req &&
        req === "req";
  
      if (req === "websocket") {
        return false;
      } else if (!isVerifiedLoggedUser) {
        return false;
      }
  
      return true;
    }
  
    addNewConnectionToList() {
      console.log("Connections now: ", 5);
    }
  
  }

  new WebSocketServer()