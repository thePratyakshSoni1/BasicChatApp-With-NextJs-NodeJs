const { verifyLoginCookies } = require("../repository/cookiesRepo");
const { getTextHistory } = require("../repository/usersRepo");


function getTextHistoryRouteController(req, res, cookies){
    var cookies = []
    cookies = req.headers.cookie.split("; ")

    if(req.headers.cookie && verifyLoginCookies(cookies).isVerified){
      req.on("data", (chunk)=>{
        let reqParams = JSON.parse(chunk.toString())
        res.end(JSON.stringify( getTextHistory(cookies.userId, reqParams.recepient, "./database/userData.json") ))
      })
    }else{
      res.end(JSON.stringify({msg: "Sorry, it's a private api :)"}))
    }

}
module.exports = getTextHistoryRouteController