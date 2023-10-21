const file = require("fs");
const { decryptData } = require("../utils/rsaGo");
const { getUser } = require("../repository/usersRepo");
const { addLoginCookiesToResponse } = require("../repository/cookiesRepo");
const { verifyLoginCredentials } = require("../repository/loginSignupRepo");
const { errorCodes } = require("../utils/constants.json");
const { addUser, isNewUserValid } = require("../repository/usersRepo");

/*
 *
 * FileName: login.js
 * Works to respond to the login route of backend,
 * verifies credentials (mail, password) with also ensuring
 * encrytion was done from latest serverkeys
 *
 */

function loginRouteController(req, res, serverLoginKeys) {
  let jsonData = JSON.parse(`{}`);
  req.on("data", (chunk) => {
    jsonData = JSON.parse(`${chunk}`);
    console.log("Data Rec: ", `${chunk}`);

    if (
      checkForDifferentKeyEnc(res, jsonData.logEncKeyWithMod, serverLoginKeys)
    ) {
      return;
    } else {
      res.end(
        verifyCredentials(
          res,
          serverLoginKeys,
          jsonData.mail,
          jsonData.password
        )
      );
    }
  });
}

function signupRouteController(req, res, serverLoginkeys) {
  let user = JSON.parse(`{}`); // user: {  mail: string password: string }
  req.on("data", (chunk) => {
    user = JSON.parse(chunk.toString());
    console.log("Data Rec: ", chunk.toString());

    if (!checkForDifferentKeyEnc(res, user.logEncKeyWithMod, serverLoginkeys)) {

      let decryptedUser = {
        mail: decryptData(user.mail, serverLoginkeys.privateKey, serverLoginkeys.modulous),
        password: decryptData(user.password, serverLoginkeys.privateKey, serverLoginkeys.modulous)
      }

      if (isNewUserValid(decryptedUser)) {
        let addUserTaskResp = addUser(decryptedUser)
        let {userData} = getUser("./database/users.json", decryptedUser.mail)
        console.log("AddingCooks: ", userData)
        addLoginCookiesToResponse(userData.loginToken, userData.userId, userData.publicKey, userData.mod, res)
        res.end(JSON.stringify(addUserTaskResp));
      } else {
        res.end(
          JSON.stringify({ isSuccess: false, msg: "Invalid User Details" })
        );
      }
    } else {
      return;
    }

  });
}

/** sends `errorCode`: `DIFFERENT_KEY_ENCRYPTION` if different key combo found with latest combo */
function checkForDifferentKeyEnc(res, key, serverLoginKeys) {
  if (key !== `${serverLoginKeys.publicKey}${serverLoginKeys.modulous}`) {
    res.end(
      JSON.stringify({
        isSuccess: false,
        status: "falied",
        errorCode: errorCodes.DIFFERENT_KEY_ENCRYPTION,
        enKey: serverLoginKeys.publicKey,
        mod: serverLoginKeys.modulous,
      })
    );
    return true;
  }
  return false;
}

function verifyCredentials(res, logKeys, mail, password) {
  if (verifyLoginCredentials("./database/users.json", mail, password)) {
    var reqUser = getUser(
      "./database/users.json",
      decryptData(mail, logKeys.privateKey, logKeys.modulous)
    );
    console.log("Requested: ", reqUser);
    addLoginCookiesToResponse(
      reqUser.userData.loginToken,
      decryptData(mail, logKeys.privateKey, logKeys.modulous),
      reqUser.userData.publicKey,
      reqUser.userData.mod,
      res
    );
    return JSON.stringify({ isSuccess: true, status: "success" });
  } else {
    return JSON.stringify({ isSuccess: false, status: "falied" });
  }
}

module.exports = { loginRouteController, signupRouteController };
