import { headers } from "next/headers"
import ChatPage from "./chatPageUi"
import { verifyAutoLogin, verifyAutoLoginNoCache } from "../../../repositories/loginSignUpRepo"
import { redirect, useParams } from "next/navigation"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function GetServerSideProps(){

    // const { chatId } = useParams()
    // console.log("ChatId is :", chatId)

    console.log(">>> start request")
    var req = headers()
    var cookies = req.get("cookie")
    console.log(">>> NextSever Cokkies: \n", req.get("cookie"))
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

    return isAuthenticated ? <ChatPage food={cookies != null ? cookies : ""} /> : redirect("/login")

}
