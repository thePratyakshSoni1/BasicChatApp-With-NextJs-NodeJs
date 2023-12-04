let https = require("https")

// let opts = {
//     path: "/gen-login/key",
//     method: "GET"
// }

let request = https.request( "https://exprt-test-service.onrender.com/gen-login/key", res=>{
    res.on("data", chunk=>console.log("Chunk: ", chunk.toString()))
    res.on("end", ()=>console.log("Request end !"))
})


console.log(request.getHeaders())

