function genEncKeysRouteController(req, res, serverLogKeys){
    
    res.writeHead(200, { "Content-Type": "application/json" });
        let datToBeSent = {
          public: serverLogKeys.public,
          mod: serverLogKeys.mod,
        };
        console.log(req.headers);
        console.log("To be sent: ", JSON.stringify(datToBeSent));
        res.end(JSON.stringify(datToBeSent));
}

module.exports = genEncKeysRouteController