// var publicKey = 0
// var modulous = 0
// var privateKey = 0
// var primeNums = []

function generatePrimeNums(){
    var primeNums = []
    var seive = []
    seive[0] = false
    seive[1] = false

    for(let i=2; i<250; i++){
        seive[i] = true
    }

    for(let i=2; i<250; i++){
        for( let j=i*2; j<250; j+=i){
            seive[j] = false
        }
    }

    for( let i=0; i<250; i++){
        if(seive[i]){
            primeNums.push(i)
        }
    }
    return primeNums.slice(10)
}

function gcd(n1, n2){
    var gcd = 1

    var i = 1
    while (i <= n1 && i <= n2) {
        // Checks if i is factor of both integers
        if (n1 % i == 0 && n2 % i == 0)
            gcd = i
        ++i
    }
    return gcd
}

function setKeys(primes){
    var prime1 =  primes[parseInt(Math.random()*(primes.length-1))] 
    var prime2 =  primes[parseInt(Math.random()*(primes.length-1))] 
    var modulous = prime1*prime2
    console.log(">>> Modulous: ", modulous)
    var fi = (prime1 - 1) * ( prime2 - 1)
    var e=2
    var d=2

    while(true){
        if(gcd(e, fi) == 1){
            break
        }
        e+=1
    }
    console.log(">>> Public key generated ", e)

    while(true){
        if((d*e)%fi == 1){
            break
        }
        d+=1
    }
    console.log(">>> Private key generated ", d)
    return {
        private: d,
        public: e,
        mod: modulous 
    }
}


function encode(msg, publicKey, mod){
    var encoded = []
    for( let i=0; i<msg.length; i++ ){
        encoded[i] = encrypt(msg.charCodeAt(i), publicKey, mod)
        // console.log("Added: ", msg.charCodeAt(i))
    }
    return encoded
}

function encrypt(msg, publicKey, mod){

    var e = publicKey
    var encryptedTxt = 1

    while(e>0){
        encryptedTxt *= msg
        encryptedTxt %= mod
        e -= 1
    }

    return encryptedTxt
}

function decrypt(msg, privateKey, mod){
    var d= privateKey
    var decryptedMsg = 1

    while(d>0){
        decryptedMsg *= msg
        decryptedMsg %= mod
        d-=1
    }
    return decryptedMsg
}

function decode(msg, privateKey, mod){
    var s= ""
    for(let i=0; i<msg.length; i++){
        s += String.fromCharCode(decrypt(msg[i], privateKey, mod))
    }
    return s
}

function testRSA(){

    var keys = setKeys(generatePrimeNums())
    console.log(`Public Key:\n${keys.public}\n\nPrivate Key:\n${keys.private}`)
    var myMsg = "Rahe Radhe Jai Shree Krishn Rahe Radhe Jai Shree Krishn Rahe Radhe Jai Shree Krishn Rahe Radhe Jai Shree Krishn Rahe Radhe Jai Shree Krishn Rahe Radhe Jai Shree Krishn Rahe Radhe Jai Shree Krishn Rahe Radhe Jai Shree Krishn Rahe Radhe Jai Shree Krishn Rahe Radhe Jai Shree Krishn Rahe Radhe Jai Shree Krishn Rahe Radhe Jai Shree Krishn Rahe Radhe Jai Shree Krishn Rahe Radhe Jai Shree Krishn Rahe Radhe Jai Shree Krishn Rahe Radhe Jai Shree Krishn Rahe Radhe Jai Shree Krishn Rahe Radhe Jai Shree Krishn Rahe Radhe Jai Shree Krishn Rahe Radhe Jai Shree Krishn Rahe Radhe Jai Shree Krishn Rahe Radhe Jai Shree Krishn Rahe Radhe Jai Shree Krishn Rahe Radhe Jai Shree Krishn Rahe Radhe Jai Shree Krishn Rahe Radhe Jai Shree Krishn Rahe Radhe Jai Shree Krishn "
    var coded = encode(myMsg, keys.public, keys.mod)
    console.log(coded[0])
    console.log("Inital msg: ", myMsg)
    var p=""
    // for( let i=0; i<coded.length; i++ ){
    //     p+= coded[i].toString()
    // }
    console.log("Encoded Msg: ", coded)

    let decd = decode(coded, keys.private, keys.mod)
    console.log("Decoded Msg: ", decd)
}

function testCrossDecryption(){
    privateKey = 1037
    modulous = 2701
    let encodedMsg = [430, 2339, 1471, 1713, 2610, 430, 2339, 1268, 1471, 1713, 2610, 74, 2339, 1807, 2610, 2180, 1471, 2500, 1713, 1713, 2610, 2295, 2500, 1807, 62, 1471, 1257, 2610, 430, 2339, 1471, 1713, 2610, 430, 2339, 1268, 1471, 1713, 2610, 74, 2339, 1807, 2610, 2180, 1471, 2500, 1713, 1713, 2610, 2295, 2500, 1807, 62, 1471, 1257, 2610, 430, 2339, 1471, 1713, 2610, 430, 2339, 1268, 1471, 1713, 2610, 74, 2339, 1807, 2610, 2180, 1471, 2500, 1713, 1713, 2610, 2295, 2500, 1807, 62, 1471, 1257, 2610, 430, 2339, 1471, 1713, 2610, 430, 2339, 1268, 1471, 1713, 2610, 74, 2339, 1807, 2610, 2180, 1471, 2500, 1713, 1713, 2610, 2295, 2500, 1807, 62, 1471, 1257, 2610, 430, 2339, 1471, 1713, 2610, 430, 2339, 1268, 1471, 1713, 2610, 74, 2339, 1807, 2610, 2180, 1471, 2500, 1713, 1713, 2610, 2295, 2500, 1807, 62, 1471, 1257, 2610, 430, 2339, 1471, 1713, 2610, 430, 2339, 1268, 1471, 1713, 2610, 74, 2339, 1807, 2610, 2180, 1471, 2500, 1713, 1713, 2610, 2295, 2500, 1807, 62, 1471, 1257, 2610, 430, 2339, 1471, 1713, 2610, 430, 2339, 1268, 1471, 1713, 2610, 74, 2339, 1807, 2610, 2180, 1471, 2500, 1713, 1713, 2610, 2295, 2500, 1807, 62, 1471, 1257, 2610, 430, 2339, 1471, 1713, 2610, 430, 2339, 1268, 1471, 1713, 2610, 74, 2339, 1807, 2610, 2180, 1471, 2500, 1713, 1713, 2610, 2295, 2500, 1807, 62, 1471, 1257, 2610, 430, 2339, 1471, 1713, 2610, 430, 2339, 1268, 1471, 1713, 2610, 74, 2339, 1807, 2610, 2180, 1471, 2500, 1713, 1713, 2610, 2295, 2500, 1807, 62, 1471, 1257, 2610]

    let tmp = btoa(encodedMsg.toString())

    // console.log(tmp)
    let decodedMsg = decode(atob(tmp).split(","))
    console.log(decodedMsg)
}

function main(){
    // testDecryption()
    // let keyPayload = setKeys(generatePrimeNums())
    var myKeys = setKeys(generatePrimeNums())
    var ourJsonData = {
        public: myKeys.public,
        mod: myKeys.mod
    }
    var ourStrData = JSON.stringify(ourJsonData)
    var pasedData = JSON.parse(ourStrData)
    console.log("Simple JS Obj: ", ourJsonData)
    console.log("Stringified JSON: ", ourStrData)
    console.log("Parsed JSON: ", pasedData)
    
    // let dencd = base64ToBytes(`YSDEgCDwkICAIOaWhyDwn6aE`)
    // let encd = bytesToBase64(dencd)
    // console.log("Encoded: ",encd,"\nDecoded: ",dencd)
}

function base64ToBytes(b64){
    var txtDecoder = new TextDecoder()
    const binString = atob(b64)

    let test = new Uint8Array(b64.length)
    // for(let i=0;i<binString.length; i++){
    //     test[i] = binString.codePointAt(i)
    // }
    // console.log("Loop Tech: ", test)
    // console.log("MapFun Tech: ", Uint8Array.from(binString, (m)=>{
    //     return m.codePointAt(0)
    // }))

    return txtDecoder.decode(Uint8Array.from(binString, (m)=>{
        return m.codePointAt(0)
    }))
}

function bytesToBase64(bytes){
    var txtCoder = new TextEncoder()
    let encodedBytes = txtCoder.encode(bytes)
    const binString = Array.from(
        encodedBytes,
        (x)=>String.fromCodePoint(x)).join("")
    
        return btoa(binString)
}



//   // Usage
//   let dd = bytesToBase64("!@#$%^&*(){}_=[]Hello My = Friend"); // "YSDEgCDwkICAIOaWhyDwn6aE"
//   let md = (base64ToBytes(dd)); // "a Ā 𐀀 文 🦄"
//   console.log(dd)
//   console.log(md)

// main()

function encryptData(data, publicKey, mod){
    return bytesToBase64(encode(data, publicKey, mod).toString())
}

function decryptData(data, privateKey, mod){
    let dataString = base64ToBytes(data)
    let buffer = dataString.substring(0, dataString.length).split(",").map(it=>{
        return parseInt(it)
    })
    return decode(buffer, privateKey, mod)
}

// let k = setKeys(generatePrimeNums())
// let encMsg = encryptData("Radhe Radhe", k.public, k.mod)
// let dencMsg = decryptData(encMsg, k.private, k.mod)
// console.log("-------\nResults:\n",encMsg,"\n",dencMsg,"\n--------")

module.exports = {generatePrimeNums, setKeys, encryptData, decryptData}