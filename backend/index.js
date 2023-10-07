const http = require("http");
const { setKeys, generatePrimeNums, decode, decryptData } = require("./rsaGo");
const { AuthRequest } = require("./authenticateReques");
const { getUserMessages } = require("./UserMessagesRepo");
const { addUser, getChatPeoples, getTextHistory, getUser } = require("./repository/usersRepo");
const { handleCors } = require("./corsRequestHandler");
const { requestRoutes, loginCookies } = require("./utils/constants.json");
const { verifyLoginCredentials } = require("./repository/loginSignupRepo");
const {
  deleteAllLoginCookies,
  addLoginCookiesToResponse,
  verifyLoginCookies,
  extractCookiesFromReq,
} = require("./repository/cookiesRepo");
const file = require("fs")

var myKeys = setKeys(generatePrimeNums());
let serverValues = JSON.parse(file.readFileSync("./serverValues.json"))
let updatedValues = serverValues.loginKeys = {
  modulous: myKeys.mod,
  publicKey: myKeys.public,
  privateKey: myKeys.private
}
file.writeFileSync("./serverValues.json", JSON.stringify({loginKeys: updatedValues}))


const httpServer = http.createServer(async (req, res) => {
  if (!handleCors(req, res)) {
    console.log(">>> REQUEST ON: ", req.url);
    console.log(">>> Origin:", req.headers.origin);
    console.log("Received Cookies: ", req.headers.cookie);

    let cookiesReceived = extractCookiesFromReq(req.headers.cookie)

    switch (req.url) {
      case requestRoutes.addUser:
        var chunk = "";
        var receivedData = JSON.parse("{}");
        req.on("data", (packet) => {
          chunk += packet;
          receivedData = JSON.parse(packet);
          addUser(receivedData, "./database/users.json");
        });

        res.end(JSON.stringify({ status: "OK" }));
        break;

        case "testCase":
          var chunk = "";
          var receivedData = JSON.parse("{}");
          req.on("data", (packet) => {
            chunk += packet;
            receivedData = JSON.parse(packet);
            res.end(JSON.stringify({pong: receivedData}))
          });
  
          res.end(JSON.stringify({ status: "OK" }));
          break;

      case requestRoutes.login:
        let jsonData = JSON.parse(`{}`);
        req.on("data", (chunk) => {
          jsonData = JSON.parse(`${chunk}`);
          console.log("Data Rec: ", `${chunk}`);

          if (
            verifyLoginCredentials(
              "./database/users.json",
              jsonData.mail,
              jsonData.password
            )
          ) {
            var { loginKeys } = JSON.parse(file.readFileSync("./serverValues.json"))
            var reqUser = getUser("./database/users.json", decryptData(jsonData.mail, loginKeys.privateKey, loginKeys.modulous))
            console.log("Requested: ",reqUser)
            addLoginCookiesToResponse(
              reqUser.userData.loginToken,
              decryptData(jsonData.mail, loginKeys.privateKey, loginKeys.modulous),
              reqUser.userData.publicKey,
              reqUser.userData.mod,
              res
            );
            res.end(JSON.stringify({ isSuccess: true, status: "success" }));
          } else {
            res.end(JSON.stringify({ isSuccess: false, status: "falied" }));
          }
        });
        break;

      case requestRoutes.verifyLoginCookies:

        if (cookiesReceived) {
          let cookieVerResp = verifyLoginCookies(req.headers.cookie.split("; "));
          if (cookieVerResp.isVerified) {
            res.end(JSON.stringify(cookieVerResp));
          } else {
            deleteAllLoginCookies(res);
            console.log("1 Sending: ", res.getHeaderNames());
            res.end(JSON.stringify(cookieVerResp));
          }
        } else {
          res.end(
            JSON.stringify({ isVerified: false, error: "No credentials found" })
          );
        }
        break;

      case requestRoutes.generateLoginKey:
        res.writeHead(200, { "Content-Type": "application/json" });
        let datToBeSent = {
          public: myKeys.public,
          mod: myKeys.mod,
        };
        console.log(req.headers);
        console.log("Food on node: ", req.cookie);
        console.log("To be sent: ", JSON.stringify(datToBeSent));
        res.end(JSON.stringify(datToBeSent));
        break;

      case requestRoutes.peoples:
        var cookies = []
        cookies = req.headers.cookie.split("; ");
        
        console.log("food", cookies);
        if(req.headers.cookie && verifyLoginCookies(cookies).isVerified){
          res.end(JSON.stringify(getChatPeoples("./database/users.json", cookiesReceived.userId )))
        }else{
          res.end(JSON.stringify({msg: "Sorry, it's a private api :)"}))
        }

        break;

      case requestRoutes.getTextHistory:
        var cookies = []
        cookies = req.headers.cookie.split("; ")
        console.log("food: ", cookies)
        let userId = ""
        cookies.forEach(it => {
          if(it.split("=")[0] === loginCookies.userId){
            userId = it.split("=")[1]
          }
        });

        if(req.headers.cookie && verifyLoginCookies(cookies).isVerified){
          req.on("data", (chunk)=>{
            let reqParams = JSON.parse(chunk.toString())
            res.end(JSON.stringify( getTextHistory(userId, reqParams.recepient, "./database/userData.json") ))
          })
        }else{
          res.end(JSON.stringify({msg: "Sorry, it's a private api :)"}))
        }

        break;

      case requestRoutes.logout:
        deleteAllLoginCookies(res);
        res.end(JSON.stringify({ status: "Logout processed" }));
        break;

      default:
        res.end("Bad request !");
        break;
    }
  }
});

httpServer.listen(3100);

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
