const file = require("fs");


// file.readFile("./sample_data.json", (err, data) => {
//   try {
//     if (err) {
//       throw err;
//     } else {
//       console.log(JSON.parse(data.toString()).doc.name, JSON.parse(data.toString()).doc2.name);
//     }
//   } catch (e) {
//     console.log("Upps ! Err: ", e.message)
//   }
// });
let fileData = JSON.parse(file.readFileSync("./sample_data.json").toString())

fileData.doc1.name = "Shree Radhe"

file.writeFile("./sample_data.json", Buffer.from(
  JSON.stringify(fileData)
), (err)=>{
    if(err != null){
      console.log("Failed to write data")
    }else{
      console.log("data written sucessfully")
    }
  })
