import { headers } from "next/headers"
import ChatPage from "./chatPageUi"
import { verifyAutoLogin } from "../repositories/loginSignUpRepo"
import { redirect } from "next/navigation"

export default async function getServerSideProps(){
    var msgList = [{ id: 0, msg: "World", isSent: false }, { id: 1, msg: "World", isSent: true }, { id: 2, msg: "World", isSent: true }]
    console.log(">>> start request")
    var req = headers()
    var cookies = req.get("cookie")
    console.log(">>> NextSever Cokkies: \n", req.get("cookie"))
    let isLoggedUser = false
    let isAuthenticated = false

    isLoggedUser = (cookies?.includes("userId") && cookies?.includes("logToken") && cookies?.includes("enKey")) ? true : false
    console.log(isLoggedUser)

    if (isLoggedUser) {
        let verificationResp = await verifyAutoLogin(cookies ? cookies : "")
        if (verificationResp.isVerified) {
            isAuthenticated = true
        }
    }

    return isAuthenticated ? <ChatPage msg={msgList}/> : redirect("/login")

}
