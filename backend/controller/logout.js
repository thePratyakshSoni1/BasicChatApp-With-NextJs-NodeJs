const { deleteAllLoginCookies } = require("../repository/cookiesRepo");

function logoutRouteController(req, res){
    deleteAllLoginCookies(res);
    res.end(JSON.stringify({ status: "Logout processed" }));
}

module.exports = logoutRouteController