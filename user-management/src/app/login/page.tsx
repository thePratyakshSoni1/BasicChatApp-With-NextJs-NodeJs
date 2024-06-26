import React from "react"
import styles from "./log2/page.module.css"
import http from "https"
import { generatePrimeNums, setKeys } from "../../../../backend/utils/rsaGo"
import LoginPage from "./loginPageUi"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { verifyAutoLogin } from "../../repositories/loginSignUpRepo"
import Constants from "@/utils/constants"

export default async function getServerSideProps() {
    console.log(">>> start request")
    var req = headers()
    var cookies = req.get("cookie")
    console.log(">>> NextSever Cokkies: \n", req.get("cookie"))
    var key = "{}"
    let isRequestComplete = false
    let isLoggedUser = false
    let isAuthenticated = false
    let isEncRequestComplete = false

    isLoggedUser = (cookies?.includes("userId") && cookies?.includes("logToken") && cookies?.includes("enKey")) ? true : false
    console.log(isLoggedUser)

    if (isLoggedUser) {
        let verificationResp = await verifyAutoLogin(cookies ? cookies : "", process.env.BACKEND_URL ? process.env.BACKEND_URL : "", process.env.BACKEND_API_URL ? process.env.BACKEND_API_URL : "")
        if (verificationResp.isVerified) {
            isAuthenticated = true
        }
    }

    if (!isAuthenticated) {

        try {
            console.log("Finding on: ", `${process.env.BACKEND_API_URL}${Constants.backendRoutes.generateLoginKey}`)
            var clientRq = http.request(
                `${process.env.BACKEND_API_URL}${Constants.backendRoutes.generateLoginKey}`,
                (res) => {
                res.on("data", (chunk) => {
                    key = chunk.toString()
                    console.log(">>> Received Login-Gen-Key:\n", key)
                    isRequestComplete = true
                    isEncRequestComplete = true
                })

                res.on("error", (err) => {
                    isRequestComplete = false
                })
            })

            clientRq.end()
            let delayLimit = 20*1000 
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

            console.log(">>> end request")
        } catch (err: any) {
            isRequestComplete = true
            console.log(">>> /gen-login/key Server error please try later!")
            console.log(err.message)
        }
    }


    let keyPayload = isEncRequestComplete ? JSON.parse(key) : undefined
    console.log("ENC REQ: ", isEncRequestComplete)
    return isAuthenticated ? redirect(Constants.frontendRoutes.chats) : isEncRequestComplete ? <LoginPage
        myKeys={{ public: keyPayload.public, mod: keyPayload.mod }}
        food={req.get("cookie")}
        processEnvs={ {  backendUrl: process.env.BACKEND_URL ? process.env.BACKEND_URL : "", 
                         frontendUrl: process.env.FRONTEND_URL ? process.env.FRONTEND_URL : "" 
                    }
        }
    /> : <div>
        <h1>ENCREQ: {isEncRequestComplete} Service Unavailable</h1>
        <p>this page isn&apos;t working, please try again later</p>
        </div>


}

