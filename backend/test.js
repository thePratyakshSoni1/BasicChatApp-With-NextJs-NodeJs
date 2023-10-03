const http = require("http");
const corsReqHandler = require("./corsRequestHandler");

http
  .createServer((req, res) => {
    console.log("REQUEST CAME: ", req.headers, "\n\n");

    if (!corsReqHandler.handleCors(req, res)) {
      switch (req.url) {
        case "/test":
          req.on("data", (chunk) => {
            console.log("Data received" + chunk);
            res.end(chunk.toString());
          });
          console.log("Out of event listener");
          break;
        default:
          res.end(JSON.stringify({ msg: "On a wrong path buddy" }));
      }
    }

  })
  .listen(3100);
