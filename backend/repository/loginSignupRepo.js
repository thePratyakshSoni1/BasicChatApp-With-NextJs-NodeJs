const { getUser } = require("./usersRepo")
const { decryptData } = require("../rsaGo")
const file =  require("fs")
function verifyLoginCredentials(pathToUserData ,userId, password){

  let loginKeys = JSON.parse(file.readFileSync("./serverValues.json")).loginKeys
  let user = getUser(pathToUserData, decryptData(userId, loginKeys.privateKey, loginKeys.modulous))
  let isAuthenticated = false
  if(!user.error){
    isAuthenticated = ( decryptData(password, loginKeys.privateKey, loginKeys.modulous) === user.userData.password)
  }
  return isAuthenticated
}

module.exports = { verifyLoginCredentials }