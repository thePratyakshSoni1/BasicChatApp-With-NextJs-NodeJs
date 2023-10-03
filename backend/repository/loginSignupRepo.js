const { deleteAllLoginCookies } = require("./cookiesRepo");
const { getUser } = require("./usersRepo")

function verifyLoginCredentials(pathToUserData ,userId, password){
  let user = getUser(pathToUserData, userId)
  let isAuthenticated = false
  if(!user.error){
    isAuthenticated = (password === user.userData.password)
  }
  return isAuthenticated
}

module.exports = { verifyLoginCredentials }