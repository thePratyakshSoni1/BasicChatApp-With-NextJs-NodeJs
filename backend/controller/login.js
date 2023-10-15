const file = require("fs")
const { decryptData } = require("../utils/rsaGo");
const { getUser } = require("../repository/usersRepo");
const { addLoginCookiesToResponse } = require("../repository/cookiesRepo")
const { verifyLoginCredentials } = require("../repository/loginSignupRepo")

function loginRouteController(req, res){
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
        var { loginKeys } = JSON.parse(file.readFileSync("./utils/serverValues.json"))
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

}

module.exports = loginRouteController