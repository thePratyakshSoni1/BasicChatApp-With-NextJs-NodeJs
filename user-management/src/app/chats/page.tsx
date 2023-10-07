import fs from "fs"
import http from "http"
import { headers } from "next/headers"
import HomePage from "./chatsPageUi"
import { verifyAutoLogin } from "../repositories/loginSignUpRepo"
import { redirect } from "next/navigation"

export default async function getServerSideProps() {


    var cookies = headers().get("cookie")
    console.log(">>> NextSever Cokkies: \n", cookies)
    let isLoggedUser = false
    let isAuthenticated = false
    let isRequestComplete = false

    isLoggedUser = (cookies?.includes("userId") && cookies?.includes("logToken") && cookies?.includes("enKey")) ? true : false
    console.log(isLoggedUser)

    if (isLoggedUser) {
        let verificationResp = await verifyAutoLogin(cookies ? cookies : "")
        if (verificationResp.isVerified) {
            isAuthenticated = true
        }
    }

    let peoples: { name: string, mail: string }[] = []

    if (isAuthenticated) {

        const opts = {
            hostname: 'localhost',
            port: 3100,
            path: '/peoples',
            method: 'GET',
            headers: {
                "Access-Control-Allow-Credentials": `true`,
                "Cookie": `${cookies}`,
            }

        }

        var clientRq = http.request(opts, (res) => {
            res.on("data", (chunk) => {
                isRequestComplete = true
                peoples = JSON.parse(chunk.toString())
                console.log(">>> Received Login-Gen-Key:\n", chunk.toString())

                var userIdToRemove = ""
                cookies?.split("; ").forEach(it=>{
                    if(it.split("=")[0] === "userId"){
                        userIdToRemove = it.split("=")[1]
                    }
                })

                for(let i=0; i<peoples.length; i++){
                    if(peoples[i].mail === userIdToRemove){
                        peoples = [...peoples.slice(0, i), ...peoples.slice(i+1, peoples.length)]
                        console.log("people: ", peoples)
                    }
                }
                
                return <HomePage peoples={peoples} food={cookies === null ? "" : cookies} />
            })

            res.on("error", (err) => {
                isRequestComplete = true
                console.log("Is completed: ", peoples)
            })
        })

        clientRq.end()
        let delayLimit = 10*1000 
        const sleepNow = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay))

        const checkRequestStatus = async () => {
            let i = 0
            while (!isRequestComplete && delayLimit > 0) {
                await sleepNow(100)
                console.log(`>>> waiting... ${i++}, ${delayLimit}`)
                delayLimit = delayLimit - 1000
            }
        }
        await checkRequestStatus()

    } else {
        console.log("Not verified")
        return redirect("/login")

    }

    return isRequestComplete ? <HomePage peoples={peoples} food={cookies===null ? "" : cookies}/> : <h1>Service Unavailable</h1>


}