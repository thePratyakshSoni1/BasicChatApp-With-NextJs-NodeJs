function encode(msg: string, publicKey: number, mod: number) {
    var encoded = []
    for (let i = 0; i < msg.length; i++) {
        encoded[i] = encrypt(msg.charCodeAt(i), publicKey, mod)
        // console.log("Added: ", msg.charCodeAt(i))
    }
    return encoded
}

function encrypt(msgCharCode: number, publicKey: number, mod: number) {

    var e = publicKey
    var encryptedTxt = 1

    while (e > 0) {
        encryptedTxt *= msgCharCode
        encryptedTxt %= mod
        e -= 1
    }

    return encryptedTxt
}

function decrypt(msgCharCode: number, privateKey: number, mod: number) {
    var d = privateKey
    var decryptedMsg = 1

    while (d > 0) {
        decryptedMsg *= msgCharCode
        decryptedMsg %= mod
        d -= 1
    }
    return decryptedMsg
}

function decode(msg: number[], privateKey: number, mod: number) {
    var s = ""
    for (let i = 0; i < msg.length; i++) {
        s += String.fromCharCode(decrypt(msg[i], privateKey, mod))
    }
    return s
}


function base64ToBytes(b64: string) {
    var txtDecoder = new TextDecoder()
    const binString = atob(b64)

    let charCodeArray = new Uint8Array(binString.length)

    for (let i = 0; i < binString.length; i++) {
        let charCode = binString.codePointAt(i)
        if (charCode) {
            charCodeArray[i] = charCode
        } else {
            charCodeArray[i] = 0
        }
    }

    return txtDecoder.decode(charCodeArray)
}

function bytesToBase64(bytes: string) {
    var txtCoder = new TextEncoder()
    let encodedBytes = txtCoder.encode(bytes)
    const binString = Array.from(
        encodedBytes,
        (x) => String.fromCodePoint(x)
    ).join("")
    return btoa(binString)
}



export function encryptData(data: string, key: number, mod: number) {
    return bytesToBase64(encode(data, key, mod).toString())
}


export function decryptData(data: string, key: number, mod: number) {
    let dataString = base64ToBytes(data)
    let buffer = dataString.substring(0, dataString.length).split(",").map(it=>{
        return parseInt(it)
    })
    return decode(buffer, key, mod)
}