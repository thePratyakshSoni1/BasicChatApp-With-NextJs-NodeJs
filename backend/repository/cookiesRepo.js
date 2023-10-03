const { loginCookies } = require("../utils/constants.json");
const { getUser } = require("./usersRepo")

function addLoginCookiesToResponse(logToken, userId, enKey, response) {
  let loginSessionWeekLimit = 4; //weeks
  let milliSecondsInWeek = 1000 * 60 * 60 * 24 * 7; // seconds in a week
  let currentDate = new Date()

  response.appendHeader("Set-Cookie", [
    `${loginCookies.loginToken}=${logToken}; expires=${
      (new Date( currentDate.getTime() + (milliSecondsInWeek * loginSessionWeekLimit))).toUTCString()
    }; path=/; httpOnly;`,
    `${loginCookies.userId}=${userId}; expires=${
      (new Date( currentDate.getTime() + (milliSecondsInWeek * loginSessionWeekLimit))).toUTCString()
    }; path=/; httpOnly;`,
    `${loginCookies.publicEncryptionKey}=${enKey}; expires=${
      (new Date( currentDate.getTime() + (milliSecondsInWeek * loginSessionWeekLimit))).toUTCString()
    }; path=/; httpOnly;`,
  ]);
  return;
}

function deleteAllLoginCookies(res) {
  res.appendHeader("Set-Cookie", [
    `${loginCookies.loginToken}=""; path=/; expires=${new Date(0).toUTCString()}; httpOnly`,
    `${loginCookies.userId}=""; path=/; expires=${new Date(0).toUTCString()}; httpOnly;`,
    `${loginCookies.publicEncryptionKey}=""; expires=${new Date(0).toUTCString()}; path=/; httpOnly`,
  ]);
}

function verifyLoginCookies(cookies) {
  let user = JSON.stringify("{}");
  let logToken = "";
  let enKey = 0;
  let isAuthenticUser = false;

  cookies.forEach((element) => {
    if (element.split("=")[0] === "userId") {
      user = getUser("./database/users.json", element.split("=")[1]).userData;
    }
    if (element.split("=")[0] === "logToken") {
      logToken = element.split("=")[1];
    }
    if (element.split("=")[0] === "enKey") {
      enKey = parseInt(element.split("=")[1]);
    }
  });

  console.log(">> verifyLogin User: ", user);

  if (user != "" && user) {
    isAuthenticUser = enKey == user.publicKey && logToken === user.loginToken;
    if (isAuthenticUser) return { isVerified: true };
    else {
      return { isVerified: false, message: "Invalid credentials found" };
    }
  } else {
    return { isVerified: false, message: "Invalid user id" };
  }
}

module.exports = {
  deleteAllLoginCookies,
  addLoginCookiesToResponse,
  verifyLoginCookies,
};
