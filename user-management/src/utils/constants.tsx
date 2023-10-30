const Constants = {
  backendRouteErrorCodes: {
    DIFFERENT_KEY_ENCRYPTION: 0
  },

  frontendRoutes: {
    login: "/login",
    signup: "/signup",
    chats: "/chats",
    settings: "/settings"
  },

  backendRoutes: {
    login: "/login",
    signup: "/signup",
    generateLoginKey: "/gen-login/key",
    addUser: "/addUser",
    removeUser: "/removeUser",
    updateUser: "updateUser",
    verifyLoginCookies: "/verifyLogin",
    logout: "/logout",
    peoples: "/peoples",
    getTextHistory: "/textHistory",
    chatSocket: "/chatSocket",
    getUser: "/getUser",
    sendImageMsg: "/sendImageMsg",
    getUserMediaImage: "/getUserMediaImage"
  },

  sessionCookies: {
    userId: "userId",
    logToken: "logToken",
    mod: "mod",
    encryptionKey: "enKey",
    chatSessionId: "chatSession"
  },

  messageMediaTypes: {
    image: "IMAGE",
    video: "VIDEO",
    audio: "AUDIO",
    text: "TEXT"
  }

}

export default Constants