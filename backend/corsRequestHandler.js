const Constants = require("./utils/constants.json")

function handleCors(req, res) {
  let isCorsHandled = false;
  console.log("In handler")

    res.appendHeader("Access-Control-Allow-Headers", "Content-Type");
    res.appendHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.appendHeader("Access-Control-Allow-Origin", Constants.frontendUrl);
    res.appendHeader("Access-Control-Allow-Credentials", true);

  if (
    req.headers["access-control-request-headers"] ||
    req.headers["access-control-request-credentials"] ||
    req.headers["access-control-request-origin"] ||
    req.headers["access-control-request-methods"]
  ) {
    console.log("is handled")
    isCorsHandled = true;
    res.end()
  }

  return isCorsHandled;
};

module.exports = {handleCors}
