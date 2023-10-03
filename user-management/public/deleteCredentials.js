document.cookie = `logToken=wrongToken; expires=${(new Date(0)).toUTCString()}`
document.cookie = `userId=wrongId; expires=${(new Date(0)).toUTCString()}`
document.cookie = `enKey=wrongKey; expires=${(new Date(0)).toUTCString()}`
console.log("Credentials cleared")