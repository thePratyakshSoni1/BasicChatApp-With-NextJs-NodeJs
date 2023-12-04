const http = require("https");
const file = require("fs");

const { setKeys, generatePrimeNums } = require("./utils/rsaGo");
const { handleCors } = require("./utils/corsRequestHandler");
const {
  extractCookiesFromReq,
  verifyLoginCookies,
} = require("./repository/cookiesRepo");
const { activateChatSocket } = require("./sockets/SamePortChatSocket");
const {
  loginRouteController,
  signupRouteController,
} = require("./controller/loginSignup");
const loginCookieAuthController = require("./controller/verifyLoginCookies");
const genEncKeysRouteController = require("./controller/generateLoginKey");
const peoplesRouteController = require("./controller/peoples");
const getTextHistoryRouteController = require("./controller/getTextHistory");
const logoutRouteController = require("./controller/logout");
const { requestRoutes } = require("./utils/constants.json");
const getIdFromUsername = require("./controller/getUser");
const {
  addNewTextToUser,
  getUserMediaImageBufferByName,
} = require("./repository/chatsRepo");
require("dotenv").config();

var myKeys = setKeys(generatePrimeNums());
let serverValues = JSON.parse(file.readFileSync("./utils/serverValues.json"));

let updatedValues = (serverValues.loginKeys = {
  modulous: myKeys.mod,
  publicKey: myKeys.public,
  privateKey: myKeys.private,
});
file.writeFileSync(
  "./utils/serverValues.json",
  JSON.stringify({ loginKeys: updatedValues })
);

const httpServer = http.createServer(async (req, res) => {
  if (!handleCors(req, res)) {
    let cookiesReceived = extractCookiesFromReq(req.headers.cookie);

    console.log("==============\n>>> REQUEST ON: ", req.url);
    console.log(">>> Origin:", req.headers.origin);
    console.log(">>> Extraced food: ", cookiesReceived, "\n================");

    switch (req.url) {
      case requestRoutes.login:
        loginRouteController(req, res, serverValues.loginKeys);
        break;

      case requestRoutes.signup:
        signupRouteController(req, res, serverValues.loginKeys);
        break;

      case requestRoutes.verifyLoginCookies:
        loginCookieAuthController(req, res, cookiesReceived);
        break;

      case requestRoutes.generateLoginKey:
        genEncKeysRouteController(req, res, myKeys);
        break;

      case requestRoutes.peoples:
        peoplesRouteController(req, res, cookiesReceived);
        break;

      case requestRoutes.getTextHistory:
        getTextHistoryRouteController(req, res, cookiesReceived);
        break;

      case requestRoutes.logout:
        logoutRouteController(req, res);
        break;

      case requestRoutes.chatSocket:
        break;

      case requestRoutes.getUser:
        getIdFromUsername(req, res);
        break;

      case requestRoutes.sendImageMsg:
        if (verifyLoginCookies(req.headers.cookie.split("; "))) {
          let dataChunk = "";
          req.on("data", (chunk) => {
            console.log("On Data:");
            dataChunk += chunk.toString();
          });

          req.on("end", async () => {
            let jsonMsgPayload = JSON.parse(dataChunk);
            await addNewTextToUser(cookiesReceived.userId, jsonMsgPayload);
            res.end("SUCCESS");
          });
        } else {
          res.end("It's a private api");
        }
        break;

      case "/getUserMediaImage":
        if (verifyLoginCookies(req.headers.cookie.split("; "))) {
          let reqData = "";
          req.on("data", (chunk) => {
            reqData += chunk;
          });
          req.on("end", () => {
            reqData = JSON.parse(reqData.toString());
            console.log("Data: ", reqData);
            res.end(
              JSON.stringify({
                mediaName: reqData.mediaName,
                ...getUserMediaImageBufferByName(
                  reqData.receiver,
                  cookiesReceived.userId,
                  reqData.mediaName
                ),
              })
            );
          });
        } else {
          res.end("It's a private api");
        }
        break;

      case "/getMsgMedia":
        if (verifyLoginCookies(req.headers.cookie.split("; "))) {
          console.log("is verifier...");
          let dataRec = "";
          res.on("data", (chunk) => {
            dataRec += chunk.toString();
          });
          res.on("end", () => {
            if (dataRec != "") {
              dataRec = JSON.parse(dataRec);
              try {
                let imgToReturn = file.readFileSync(
                  `./database/${dataRec.imageName}`
                );
                if (imgToReturn)
                  res.end(
                    JSON.stringify({
                      name: dataRec.imageName,
                      image: imgToReturn,
                    })
                  );
                else throw new Error("Invalid image buffer");
              } catch (err) {
                let errmsg = undefined;
                if (err.code === "ENOENT") {
                  errmsg = "file not found";
                }
                console.log(err);
                res.end(
                  JSON.stringify({
                    isSuccess: false,
                    msg: errmsg ? errmsg : "Unexpected Error",
                  })
                );
              }
            }
          });
        } else {
          res.end(JSON.stringify("It's a private endpoint :)"));
        }
        break;

      default:
        res.end("Bad request !");
        break;
    }
  }
});

httpServer.listen(3100);
const chatSocket = activateChatSocket();

httpServer.on("upgrade", (req, socket) => {
  if (req.url === "/chatSocket") {
    console.log("Accept Upgrade req received...");
    chatSocket.emit("upgradeRequest", req, socket);
  } else {
    socket.end("HTTP/1.1 400 Bad Request");
  }
});

/***
 * >>> Economy
 *
 * >>> Peace
 *
 * >>> Harmony
 *
 * >>> Mutual Understandings
 *
 * I myself even don't know what the hell i am dooin with my
 * life and if i am doing it right or not, and today the lecture form my
 * cousins and my father's sister is making it worst in my mind
 * but what should i do now ???????????????????????????????????
 *
 */
