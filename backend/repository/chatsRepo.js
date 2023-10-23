const { getTextHistory } = require("./usersRepo");

function getUserDataBase() {
  const file = require("fs");
  return JSON.parse(file.readFileSync("./database/userData.json"));
}

function updateUserDataBase(jsonData) {
  const file = require("fs");
  file.writeFileSync("./database/userData.json", JSON.stringify(jsonData));
}

async function getChatsUpdateAfter(userId, lastUpdate) {
  const updateAfter = lastUpdate ? new Date(lastUpdate) : new Date(0);

  // console.log("Required Update: ", updateAfter);
  const fileContent = getUserDataBase();

  return fileContent.find((it) => {
    if (it.userId === userId && new Date(it.lastUpdated) > updateAfter) {
      console.log("Updated content available !");
      return true;
    } else {
      return false;
    }
  });
}

function getSpecificChatHistory(userId, relPathToUserData, recepient) {
  return getTextHistory(userId, recepient, relPathToUserData);
}

function getLastUpdate(userId) {
  console.log("We're on:", __dirname);
  const fileContent = getUserDataBase();

  let lastUpdate = fileContent.find((it) => {
    if (it.userId === userId && new Date(it.lastUpdated) > lastUpdate) {
      console.log("Updated content available !");
      return true;
    } else {
      return false;
    }
  });
  if (lastUpdate) {
    return undefined;
  } else {
    return new Date(lastUpdate);
  }
}

function addNewTextToUser(senderId, msg) {
  const fileContent = getUserDataBase();
  let txts = getSenderAndReceiverTexts(
    fileContent,
    senderId,
    msg.receiver
  );

  if (txts.senderTxts && txts.receiverTxts) {
    updateUserDataBase(
      updateUserMessagesInFileContent(
        senderId,
        msg,
        fileContent
      )
    );
  } else {
    updateUserDataBase(
      addNewUserChat(fileContent, msg, senderId)
    )
  }
}

function addNewUserChat(userDataDoc, msg, senderId){
  let dateInst = new Date()
  let firstChat = { 
      id: 0, //changed later
      data: msg.data,
      at: dateInst.toString(),
      isSent: false // edited later
   }

  for( let i=0; i<userDataDoc.length; i++){
    if(userDataDoc[i].userId === senderId || userDataDoc[i].userId === msg.receiver){
      console.log("Now updating: ", userDataDoc[i].userId)
      userDataDoc[i].messages.push(
        {
          person: userDataDoc[i].userId === msg.receiver ? senderId : msg.receiver,
          chat: [ {id: getUniqueMsgId(), ...firstChat, isSent: userDataDoc[i].userId === senderId} ]
        }
      )
      userDataDoc[i].lastUpdated = dateInst.toString();
    }
  }

  return userDataDoc
}

function getUniqueMsgId(){
  let dateInst = new Date()
  return `${dateInst.getMilliseconds()}${dateInst.getSeconds()}`
}

function updateUserMessagesInFileContent(senderId, msg, content) {
  for (let i = 0; i < content.length; i++) {
    if (content[i].userId === senderId || content[i].userId === msg.receiver) {
      let messages = content[i].messages;
      let msgIndx = undefined;

      var userChats = ( messages.find((it, index) => {
        msgIndx = index;
        return it.person === msg.receiver || it.person === senderId
      })).chat;

      let dateInst = new Date();
      userChats.push({
        id: getUniqueMsgId(),
        data: msg.data,
        at: dateInst.toString(),
        isSent: content[i].userId === msg.receiver ? false : true,
      });
      content[i].messages[msgIndx].chat = userChats;
      content[i].lastUpdated = dateInst.toString();
    }
  }

  return content;
}

function getSenderAndReceiverTexts(fileContent, senderId, receiverId) {
  let isSenderFound = false;
  let isReceiverFound = false;

  let sender = undefined;
  let receiver = undefined;

  for (let i = 0; i < fileContent.length; i++) {
    if (fileContent[i].userId === senderId) {
      sender = fileContent[i].messages.find((it) => {
        return it.person === receiverId;
      });
      isSenderFound = true;
    }

    if (fileContent[i].userId === receiverId) {
      console.log("On: ", fileContent[i].userId)
      receiver = fileContent[i].messages.find((it) => {
        return it.person === senderId;
      });
      isReceiverFound = true;
    }

    if (isReceiverFound && isSenderFound) {
      break;
    }
  }

  return { senderTxts: sender, receiverTxts: receiver };
}

module.exports = {
  getSpecificChatHistory,
  getChatsUpdateAfter,
  getLastUpdate,
  addNewTextToUser,
};
