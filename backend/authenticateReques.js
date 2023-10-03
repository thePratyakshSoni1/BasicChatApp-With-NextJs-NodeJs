const fs = require("fs")
function AuthRequest(userId, password){

    var users = JSON.parse(fs.readFileSync("./database/users.json"))
    let isAuthenticated = false
    
    for(let i =0; i<users.length; i++){
        if(users[i].userId === userId && users[i].password === password){
            isAuthenticated = true
            break
        }
        console.log("Checked: ", users[i].userId)
    }

    
    return isAuthenticated

}

module.exports = {AuthRequest} 

// console.log(AuthRequest("radhakrishn@gmail.com", "RADHE-RADHE"))