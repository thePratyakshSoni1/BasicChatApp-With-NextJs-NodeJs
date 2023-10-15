const { verifyLoginCookies } = require("../repository/cookiesRepo");
const { getChatPeoples } = require("../repository/usersRepo");

function peoplesRouteController(req, res, cookiesReceived){
    var cookies = []
    cookies = req.headers.cookie.split("; ");
    
    if(req.headers.cookie && verifyLoginCookies(cookies).isVerified){
      res.end(JSON.stringify(getChatPeoples("./database/users.json", cookiesReceived.userId )))
    }else{
      res.end(JSON.stringify({msg: "Sorry, it's a private api :)"}))
    }

}

module.exports = peoplesRouteController