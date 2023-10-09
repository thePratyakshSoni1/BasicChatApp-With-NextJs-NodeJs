const { getTextHistory } = require("./usersRepo")

async function getChatsUpdateAfter(userId,  lastUpdate){

    const file = require("fs")
    const updateAfter = lastUpdate ? lastUpdate : new Date(0)

    console.log("We're on:", __dirname)
    const fileContent = JSON.parse(file.readFileSync("./database/userData.json"))

    return fileContent.find((it)=>{
        if(it.userId === userId && ( new Date(it.lastUpdated) ) > updateAfter){
            console.log("Updated content available !")
            return true
        }else{
            return false
        }
    })

}

function getSpecificChatHistory( userId, relPathToUserData, recepient ){
    return getTextHistory(userId, recepient, relPathToUserData) 
}

function getLastUpdate(userId){
    const file = require("fs")

    console.log("We're on:", __dirname)
    const fileContent = JSON.parse(file.readFileSync(relPathToUserData))

    let lastUpdate = fileContent.find(it=>{
        if(it.userId === userId && ( new Date(it.lastUpdated) ) > lastUpdate){
            console.log("Updated content available !")
            return true
        }else{
            return false
        }
    })
    if(lastUpdate){
        return undefined
    }else{
        return new Date(lastUpdate)
    }
}

module.exports = { getSpecificChatHistory, getChatsUpdateAfter, getLastUpdate }