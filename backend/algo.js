const uuid = require("uuid")

// let myPrivateKey = ""
// let myPublicKey = ""

// let myData = "Pratyaksh Soni"

// myPublicKey = `433ec6d8-ea6c-47b4-bfe4-3221bb8aab24`
// myPrivateKey = `74dfe0ab-cb2d-46e3-bd01-084d318c8bbd`

// myPublicKey = `433ec6d8-ea6c-47b4-bfe4-3221bb8aab24`
// myPrivateKey = `74dfe0ab-ea6c-46e3-bd01-084d318c8bbd`

// let myEncData = `UHJhdHlha3NoIFNvbmk=`
// console.log(myEncData.length)

// console.log(myEncData.substring(0,myEncData.length/2), myEncData.substring(myEncData.length/2,myEncData.length))

// let dataLength = myEncData.length.toString()
// let preFix = dataLength.substring(0, dataLength.length/2)
// let suFix = dataLength.substring(dataLength.length/2, dataLength.length)
// console.log(preFix, suFix)

// let encrypted = `${preFix}.${myEncData}.${suFix}` //2.UHJhdHlha3NoIFNvbmk=.0
// console.log(btoa(encrypted)) //Mi5VSEpoZEhsaGEzTm9JRk52Ym1rPS4w

// console.log(encrypted)
// console.log(btoa(myData))

// let saltLen = 50>20 ? 50/2 : 20
// let salt = ""
// for(let i=0;i<saltLen;i++){
//     salt+= parseInt((Math.random()*16))
//     // console.log(btoa(parseInt((Math.random()*16))))
// }

// console.log(btoa(salt).length) //OTg2MTAzOTI2MTkzNjEyOTYxMzE1NTg5MTA2OTExMQ==

// myPublicKey = `433ec6d8-ea6c-47b4-bfe4-3221bb8aab24`
// myPrivateKey = `74dfe0ab-ea6c-46e3-bd01-084d318c8bbd`

//Encrypt Algo

//12345678
//RAM
//1234 5678
//12 3456 78
//3.12R3456AM78.N -> b64 => My4xMlIzNDU2QU03OC5O
//


// >> Decrypt Algo <<
// 
// 2.acMy4xMlIzNDU2QU03OC5O6e
// My4xMlIzNDU2QU03OC5O => atob() => 3.12R3456AM78.N
// 3
// 11
// salt: 8
// 8 --> 4:4 --> 2:2:2:2
// R3456AM
// 3/2 = 1
// R | 3456AM
// AM | 3456
// RAM

console.log( btoa(uuid.v4()) )