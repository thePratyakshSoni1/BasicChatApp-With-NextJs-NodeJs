
const {
    deleteAllLoginCookies,
    verifyLoginCookies
} = require("../repository/cookiesRepo");
  
function loginCookieAuthController(req, res, cookiesReceived){
    if (cookiesReceived) {
        let cookieVerResp = verifyLoginCookies(req.headers.cookie.split("; "));
        if (cookieVerResp.isVerified) {
          res.end(JSON.stringify(cookieVerResp));
        } else {
          deleteAllLoginCookies(res);
          console.log("1 Sending: ", res.getHeaderNames());
          res.end(JSON.stringify(cookieVerResp));
        }
      } else {
        res.end(
          JSON.stringify({ isVerified: false, error: "No credentials found" })
        );
      }
}

module.exports = loginCookieAuthController