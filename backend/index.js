const http = require("http");
const { setKeys, generatePrimeNums, decode } = require("./rsaGo");
const { AuthRequest } = require("./authenticateReques");
const { getUserMessages } = require("./UserMessagesRepo");
const { addUser } = require("./repository/usersRepo");
const { handleCors } = require("./corsRequestHandler");
const { requestRoutes } = require("./utils/constants.json");
const { verifyLoginCredentials } = require("./repository/loginSignupRepo");
const {
  deleteAllLoginCookies,
  addLoginCookiesToResponse,
  verifyLoginCookies,
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
            addLoginCookiesToResponse(
              "asmopadsmomaodsim",
              "mymail@gmail.com",
              5,
              res
            );
            res.end(JSON.stringify({ isSuccess: true, status: "success" }));
          } else {
            res.end(JSON.stringify({ isSuccess: false, status: "falied" }));
          }
        });
        break;

      case requestRoutes.verifyLoginCookies:
        let cookies = "";
        cookies = req.headers.cookie.split("; ");
        console.log("food", cookies);

        if (req.headers.cookie) {
          let cookieVerResp = verifyLoginCookies(cookies);
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

      case "/messages":
        var reqData = "";
        req.on("data", (chunk) => {
          reqData += chunk;
          let jsonParsed = JSON.parse(reqData);
          if (AuthRequest(jsonParsed.mail, jsonParsed.password)) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(getUserMessages(jsonParsed.mail)));
          } else {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                title: "Bad Request",
                message: "User not authenticated, try login again",
              })
            );
          }
        });
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
