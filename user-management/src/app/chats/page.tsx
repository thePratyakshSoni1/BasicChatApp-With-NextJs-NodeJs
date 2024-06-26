import fs from "fs"
import http from "https"
import { headers } from "next/headers"
import HomePage from "./userChats"
import { verifyAutoLogin, verifyAutoLoginNoCache } from "../../repositories/loginSignUpRepo"
import { redirect, usePathname } from "next/navigation"
import { useEffect } from "react"
import Script from "next/script"
import Constants from "@/utils/constants"


export const dynamic = 'force-dynamic'
export const revalidate = 0


export default async function GetServerSideProps() {

    var cookies = headers().get("cookie")
    console.log(">>> NextSever Cokkies: \n", cookies)
    let isLoggedUser = false
    let isAuthenticated = false

    isLoggedUser = (cookies?.includes("userId") && cookies?.includes("logToken") && cookies?.includes("enKey")) ? true : false
    console.log(isLoggedUser)

    if (isLoggedUser) {
        let verificationResp = await verifyAutoLoginNoCache(cookies ? cookies : "", process.env.BACKEND_URL ? process.env.BACKEND_URL : "", process.env.BACKEND_API_URL ? process.env.BACKEND_API_URL : "")
        if (verificationResp.isVerified) {
            isAuthenticated = true
        }
    }

    return isAuthenticated ? <HomePage 
        food={cookies === null ? "" : cookies} 
        processEnvs={
            { backendApiUrl: process.env.BACKEND_API_URL ? process.env.BACKEND_API_URL : "" }} 
    /> : redirect(Constants.frontendRoutes.login)

}