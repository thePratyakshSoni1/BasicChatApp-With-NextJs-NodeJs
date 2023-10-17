const file = require("fs");
const { decryptData } = require("../utils/rsaGo");
const { getUser } = require("../repository/usersRepo");
const { addLoginCookiesToResponse } = require("../repository/cookiesRepo");
const { verifyLoginCredentials } = require("../repository/loginSignupRepo");
const { errorCodes } = require("../utils/constants.json");

/**
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

    if (checkForDifferentKeyEnc(res, jsonData.logEncKeyWithMod, serverLoginKeys)){
      return;
    }else{
      res.end(verifyCredentials(res, serverLoginKeys, jsonData.mail, jsonData.password));
    }
    
  });
}

function checkForDifferentKeyEnc(res, key, serverLoginKeys) {
  if (key !== `${serverLoginKeys.publicKey}${serverLoginKeys.modulous}`) {
    res.end(
      JSON.stringify({
        isSuccess: false,
        status: "falied",
        errorCode: errorCodes.DIFFERENT_KEY_ENCRYPTION,
        enKey: serverLoginKeys.publicKey,
        mod: serverLoginKeys.modulous
      })
    );
    return true;
  }
  return false;
}


function verifyCredentials(res, logKeys, mail, password) {
  if (
    verifyLoginCredentials(
      "./database/users.json",
      mail,
      password
    )
  ) {
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

module.exports = loginRouteController;
