const { getTextHistory } = require("./usersRepo");
const { errorCodes } = require("../utils/constants.json");

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

async function addNewTextToUser(senderId, msg) {
  const fileContent = getUserDataBase();
  let txts = getSenderAndReceiverTexts(fileContent, senderId, msg.receiver);
  let msgId = getUniqueMsgId();

  new Promise((res, rej) => {
    if (txts.senderTxts && txts.receiverTxts) {
      if (msg.isMediaMsg) {
        msg.mediaName = getUniqueMsgId() + msg.mediaName.replace(" ", "_");
      }
      updateUserDataBase(
        updateUserMessagesInFileContent(senderId, msg, fileContent, msgId)
      );
      res();
    } else {
      updateUserDataBase(addNewUserChat(fileContent, msg, senderId, msgId));
      res();
    }
  });

  if (msg.isMediaMsg) {
    addImageToDB(msg.mediaName, Buffer.from(msg.mediaBufferArray.data));
  }
}

async function addImageToDB(imageName, imageBuffer) {
  let fs = require("fs");
  fs.writeFileSync("./database/images/" + imageName, imageBuffer);
  console.log("Image Added", imageName);
}

function addNewUserChat(userDataDoc, msg, senderId, msgId) {
  let dateInst = new Date();
  let firstChat = {
    id: 0, //changed later
    data: msg.data,
    isMediaMsg: msg.isMediaMsg ? true : false,
    mediaType: msg.mediaType,
    at: dateInst.toString(),
    isSent: false, // edited later
  };

  for (let i = 0; i < userDataDoc.length; i++) {
    if (
      userDataDoc[i].userId === senderId ||
      userDataDoc[i].userId === msg.receiver
    ) {
      console.log("Now updating: ", userDataDoc[i].userId);

      userDataDoc[i].messages.push({
        person:
          userDataDoc[i].userId === msg.receiver ? senderId : msg.receiver,
        chat: [
          {
            id: msgId,
            ...firstChat,
            isSent: userDataDoc[i].userId === senderId,
            mediaName: msg.mediaName ? msg.mediaName : null,
          },
        ],
      });
      userDataDoc[i].lastUpdated = dateInst.toString();
    }
  }

  return userDataDoc;
}

function getUniqueMsgId() {
  let dateInst = new Date();
  return `${dateInst.getMilliseconds()}${dateInst.getSeconds()}`;
}

function updateUserMessagesInFileContent(senderId, msg, content, msgId) {
  for (let i = 0; i < content.length; i++) {
    if (content[i].userId === senderId || content[i].userId === msg.receiver) {
      let messages = content[i].messages;
      let msgIndx = undefined;

      var userChats = messages.find((it, index) => {
        msgIndx = index;
        return it.person === msg.receiver || it.person === senderId;
      }).chat;

      let dateInst = new Date();

      userChats.push({
        id: msgId,
        data: msg.data,
        isMediaMsg: msg.isMediaMsg ? true : false,
        mediaType: msg.mediaType,
        mediaName: msg.mediaName ? msg.mediaName : null,
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
      console.log("On: ", fileContent[i].userId);
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

function getUserMediaImageBufferByName(receiver, userId, mediaName) {
  const fs = require("fs");

  if (isUserAccountMedia(userId, receiver, mediaName)) {
    let imageBuf = fs.readFileSync("./database/images/" + mediaName);
    if (imageBuf) return { isSuccess: true, buffer: imageBuf };
    else
      return {
        isSuccess: false,
        buffer: imageBuf,
        errorCode: errorCodes.MSG_MEDIA_NOT_FOUND,
      };
  } else {
    return {
      isSuccess: false,
      buffer: undefined,
      errorCode: errorCodes.INVALID_USER,
    };
  }
}

function isUserAccountMedia(userId, receiver, mediaName) {
  const fs = require("fs");

  let isUserAccountMedia = false;

  let userMessages = getUserDataBase().find((it) => {
    return it.userId === userId;
  }).messages;

  if (userMessages && receiver) {
    userMessages
      .find((it) => {
        return it.person === receiver;
      })
      .chat.find((it) => {
        if (it.mediaName === mediaName) {
          isUserAccountMedia = true;
        }
      });
  }
  return isUserAccountMedia;
}

module.exports = {
  getSpecificChatHistory,
  getChatsUpdateAfter,
  getLastUpdate,
  addNewTextToUser,
  getUserMediaImageBufferByName,
};
