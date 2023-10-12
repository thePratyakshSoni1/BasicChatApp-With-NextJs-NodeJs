
window.myWebS = new WebSocket("ws://localhost:3200")


window.onbeforeunload = function(ev){
    console.log(ev)
    console.log("chaning....")
}

//adding this cooment to fix github configs 