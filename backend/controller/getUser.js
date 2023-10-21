const { verifyLoginCookies } = require("../repository/cookiesRepo");
const { errorCodes } = require("../utils/constants.json")

function getIdFromUsername(req, res) {
  const file = require("fs");

  const onReceiveUsername = (username) => {
    let requestedId = JSON.parse(
      file.readFileSync("./database/users.json")
    ).find((it) => it.userId.split("@")[0] === username);
    if (requestedId) {
      res.end(JSON.stringify({ isSuccess: true, userId: requestedId.userId }));
    } else {
      res.end(JSON.stringify({ isSuccess: false, msg: "User not found" }));
    }
  };

  let isVerifiedUser = verifyLoginCookies(req.headers.cookie.split("; "));

  if (isVerifiedUser) {
    req.on("data", (chunk) => {
      console.log("Data stil here");
      let reqData = JSON.parse(chunk.toString())

      if(reqData.getUserID){
        onReceiveUsername(reqData.username);
      }else{
        res.end(JSON.stringify({ isSuccess: false, msg: "Expected response not specified" }));
      }

    });
  }else{
    res.end(JSON.stringify({error: errorCodes.AUTH_DENIED, msg: "It's a private API bro"}))
  }
}

module.exports = getIdFromUsername;
