const {  EventEmitter } = require("events")
class myclass extends EventEmitter{
    constructor(){
        super()
        this.me= true
    }

    launch(){
        setTimeout(()=>this.emit("okay", this), 2000)
        setTimeout(()=>this.emit("stop", this), 4000)
        setTimeout(()=>this.emit("bye", this), 7000)
    }


}

let x = new myclass()

x.launch()
x.on("stop", (y)=>{
    y.me = false
})

new Promise(async ()=>{
    while(x.me){
        console.log("ME...")
        await new Promise((res, rej)=>{ setTimeout(()=>console.log("..."), 800) })
    }
})


x.on("okay", (y)=>{
    console.log("Hi i'm: ", y.me)
    x.on("bye", (z)=>console.log("bye: ",z.me))
})

