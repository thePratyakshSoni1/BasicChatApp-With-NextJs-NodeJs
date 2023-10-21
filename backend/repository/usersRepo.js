const { decryptData, setKeys, generatePrimeNums } = require("../utils/rsaGo");

const isUniqueUser = (user, relPathToUsersJsonFile) => {
  const file = require("fs");

  let isNewUniqueUser = true;
  let dataRead = JSON.parse(
    file.readFileSync(relPathToUsersJsonFile).toString()
  );

  // console.log(dataRead)

  dataRead.forEach((it) => {
    if (it.userId === user.mail) {
      isNewUniqueUser = false;
    }
  });

  console.log(">>> Adding user: found unique");
  return isNewUniqueUser;
};

function isNewUserValid(user){

  if (user.password === "") {
      return false
  } else if (user.mail.split("@").length < 1 || user.mail.split(".com").length < 1 || user.mail === "") {
      return false
  } else {
      return true
  }

}

function addUser(user){
  
  let userToDBTask = addToUserDB(user)

  if(userToDBTask.isSuccess){
    return addToUserChatDB(user)
  }else{
    return userToDBTask
  }

}

function addToUserChatDB(user) {

  try {
    let dataRead = JSON.parse(`{}`)
    let file = require("fs")
    dataRead = JSON.parse(file.readFileSync("./database/userData.json"))
    dataRead.push(
      {
        userId: user.mail,
        lastUpdated: (new Date()).toUTCString(),
        messages: []
      }
    )

    file.writeFileSync("./database/userData.json", JSON.stringify(dataRead))
    return { isSuccess: true }
  } catch (e) {
    return { isSuccess: false, msg: e.message };
  }

}

const addToUserDB = (user) => {
  let relPathToUsersJsonFile = "./database/users.json"
  try {
    if (isUniqueUser(user, relPathToUsersJsonFile)) {
      let dataRead = JSON.parse("{}");
      let file = require("fs"); 
      dataRead = JSON.parse(
        file.readFileSync(relPathToUsersJsonFile).toString()
      );

      let userKeys = setKeys(generatePrimeNums())

      dataRead.push({
        userId: user.mail,
        password: user.password,
        mod:userKeys.mod,
        publicKey: userKeys.public,
        privateKey: userKeys.private,
        loginToken: generateLoginToken(user.mail)
      });

      file.writeFileSync(relPathToUsersJsonFile, JSON.stringify(dataRead));
      return { isSuccess: true }
    } else {
      throw new Error("User already exists");
    }
  } catch (e) {
    return {
      isSuccess: false,
      msg: e.message,
    };
  }
};

function generateLoginToken(mail){
  let genToken = `${(new Date()).getTime()}-${mail.split("@")[0]}${parseInt(Math.random() * 50000)}`
  return btoa(genToken)
}

/**
 * returns `{ 
 *  mail: string, password: string, logToken: string, publicKey: number,
    mod : number,
    privateKey: number
 }`

 when error `{ error: boolean;
    message: string; }`
 */
function getUser(relPathToUsersJsonFile, userId) {
  const file = require("fs");

  let dataRead = JSON.parse(
    file.readFileSync(relPathToUsersJsonFile).toString()
  );

  let resp = undefined;
  dataRead.forEach((it) => {
    if (it.userId === userId) {
      resp = { fetchStatus: "success", userData: it };
    }
  });

  return resp ? resp : { error: true, message: "user not found" };
}

function getChatPeoples(relPathToUsersJsonFile, self) {
  const file = require("fs");
  var peoples = JSON.parse(
    file.readFileSync(relPathToUsersJsonFile).toString()
  );

  for (let i = 0; i < peoples.length; i++) {
    if (self === peoples[i].userId) {
      peoples = [
        ...peoples.slice(0, i),
        ...peoples.slice(i + 1, peoples.length),
      ];
    }
  }
  // console.log("people: ", peoples);

  return peoples.map((it) => {
    return {
      name: it.userId,
      mail: it.userId,
    };
  });
}

function getTextHistory(userId, recepient, relPathToUsersTxtJsonFile) {
  /***
   *
   * [
   *    {
   *        userId: string,
   *        messages: {receiver: string, chats}[]
   *    }
   * ]
   *
   */

  const file = require("fs");
  let userTxts = JSON.parse(file.readFileSync(relPathToUsersTxtJsonFile));
  var chatHistory = [];

  userTxts.forEach((it) => {
    if (it.userId === userId) {
      it.messages.forEach((msgPayloads) => {
        chatHistory =
          msgPayloads.receiver.split("@")[0] === recepient
            ? msgPayloads.chat
            : [];
      });
    }
  });

  var sortedTexts = chatHistory.sort((a, b) => {
    return new Date(a.at) <= new Date(b.at) ? -1 : 1;
  });

  console.log("Requested history: ", sortedTexts);
  return sortedTexts;
}

module.exports = {
  isUniqueUser,
  addUser,
  getUser,
  getChatPeoples,
  getTextHistory,
  isNewUserValid
};
