const http = require("http");
const file = require("fs");

const { setKeys, generatePrimeNums } = require("./utils/rsaGo");
const { handleCors } = require("./utils/corsRequestHandler");
const { extractCookiesFromReq } = require("./repository/cookiesRepo");
const { activateChatSocket } = require("./sockets/ChatSockets");
const { loginRouteController, signupRouteController } = require("./controller/loginSignup");
const loginCookieAuthController = require("./controller/verifyLoginCookies");
const genEncKeysRouteController = require("./controller/generateLoginKey");
const peoplesRouteController = require("./controller/peoples");
const getTextHistoryRouteController = require("./controller/getTextHistory");
const logoutRouteController = require("./controller/logout");
const { requestRoutes } = require("./utils/constants.json");

var myKeys = setKeys(generatePrimeNums());
let serverValues = JSON.parse(file.readFileSync("./utils/serverValues.json"))

let updatedValues = serverValues.loginKeys = {
  modulous: myKeys.mod,
  publicKey: myKeys.public,
  privateKey: myKeys.private
}
file.writeFileSync("./utils/serverValues.json", JSON.stringify({loginKeys: updatedValues}))


const httpServer = http.createServer(async (req, res) => {
  if (!handleCors(req, res)) {
    let cookiesReceived = extractCookiesFromReq(req.headers.cookie)

    console.log("==============\n>>> REQUEST ON: ", req.url);
    console.log(">>> Origin:", req.headers.origin);
    console.log(">>> Extraced food: ", cookiesReceived,"\n================")

    switch (req.url) {

      case requestRoutes.login:
        loginRouteController(req, res, serverValues.loginKeys)
        break;
      
      case requestRoutes.signup:
        signupRouteController(req, res, serverValues.loginKeys)
        break;

      case requestRoutes.verifyLoginCookies:
        loginCookieAuthController(req, res, cookiesReceived)
        break;

      case requestRoutes.generateLoginKey:
        genEncKeysRouteController(req, res, myKeys)
        break;

      case requestRoutes.peoples:
        peoplesRouteController(req, res, cookiesReceived)
        break;

      case requestRoutes.getTextHistory:
        getTextHistoryRouteController(req, res, cookiesReceived)
        break;

      case requestRoutes.logout:
        logoutRouteController(req, res)
        break;

      case requestRoutes.chatSocket:
        break;

      default:
        res.end("Bad request !");
        break;

    }
  }
});

httpServer.listen(3100);
activateChatSocket()

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
