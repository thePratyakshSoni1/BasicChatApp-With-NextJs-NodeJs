const { decryptData } = require("../utils/rsaGo");

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

const addUser = (user, relPathToUsersJsonFile) => {
  try {
    if (isUniqueUser(user, relPathToUsersJsonFile)) {
      let dataRead = JSON.parse("{}");
      let file = require("fs");

      dataRead = JSON.parse(
        file.readFileSync(relPathToUsersJsonFile).toString()
      );
      dataRead.push({
        userId: user.mail,
        password: user.password,
      });

      file.writeFileSync(relPathToUsersJsonFile, JSON.stringify(dataRead));
    }
  } catch (e) {
    return JSON.parse(`{
                    "isUserAdded": false,
                    "error": e.message
                }`);
  }
};

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
    return (new Date(a.at)) <= (new Date(b.at)) ? -1 : 1;
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
};
