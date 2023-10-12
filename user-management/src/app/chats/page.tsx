import fs from "fs"
import http from "http"
import { headers } from "next/headers"
import HomePage from "./chatsPageUi"
import { verifyAutoLogin, verifyAutoLoginNoCache } from "../../repositories/loginSignUpRepo"
import { redirect, usePathname } from "next/navigation"
import { useEffect } from "react"
import Script from "next/script"


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
        let verificationResp = await verifyAutoLoginNoCache(cookies ? cookies : "")
        if (verificationResp.isVerified) {
            isAuthenticated = true
        }
    }

    if (!isAuthenticated) {
        console.log("Not verified")
        return redirect("/login")

    }

    return <HomePage food={cookies===null ? "" : cookies}/>

}