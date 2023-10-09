const file = require("fs")


function getUserMessages(userMail){

    var data = JSON.parse(file.readFileSync("./database/userData.json"))
    let targetUser = null
    for(let i=0; i<data.length; i++){
        if(data[i].userId === userMail){
            targetUser = data[i]
            console.log(">>> User found")
            break
        }
    }

    return targetUser.messages[0]

}

module.exports = { getUserMessages }