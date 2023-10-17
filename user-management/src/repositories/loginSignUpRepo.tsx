import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { encryptData } from "./cryptographyRepo";
import { backendRouteErrorCodes, backendRoutes, backendUrl } from "../utils/constants.json"

export async function onLogin(
    headers: Headers,
    mailTxt: string,
    password: string,
    router: AppRouterInstance,
    key:number,
    mod:number,
    setError: (msg: string) => void
) {

    let data = JSON.stringify({ mail: encryptData(mailTxt, key, mod), password: encryptData(password, key, mod), logEncKeyWithMod: `${key}${mod}` })
    headers.append('Content-Type', 'application/json')
    headers.append('Content-Length', `${JSON.stringify(data).length}`)

    const response = await fetch('http://localhost:3100/login', {
        method: "POST",
        credentials: 'include',
        headers: headers,
        body: data
    });

    const json = await response.json();
    console.log(json)
    if (json.isSuccess) {
        router.push("/chats")
    } else {

        if(json.errorCode == backendRouteErrorCodes.DIFFERENT_KEY_ENCRYPTION){
            console.log("Found Error: Old keys", json.enKey, json.mod)
            onLogin(
                headers,
                mailTxt,
                password,
                router,
                json.enKey,
                json.mod,
                setError
            )

        }
        setError("Invalid login details")

    }

}

export async function verifyAutoLogin(tokens: string){

    var myHeaders = new Headers()
    
    myHeaders.append("cookie", `${tokens}`)

    let req = await fetch("http://localhost:3100/verifyLogin", {
        credentials: "include",
        method: "GET",
        headers: myHeaders
    })

    let resp = await req.json()

    console.log("Verification resp: ", resp)
    return resp
}

export async function verifyAutoLoginNoCache(tokens: string){

    var myHeaders = new Headers()
    
    myHeaders.append("cookie", `${tokens}`)

    let req = await fetch("http://localhost:3100/verifyLogin", {
        credentials: "include",
        method: "GET",
        headers: myHeaders,
        cache: 'no-store'
    })

    let resp = await req.json()

    console.log("Verification resp: ", resp)
    return resp
}

export async function onLogout(router: AppRouterInstance){
    var myHeaders = new Headers()
    let logoutRequest = await fetch("http://localhost:3100/logout", {
        method: "GET",
        headers: myHeaders,
        credentials: "include"
    })
    let resp = await logoutRequest.json()
    console.log("On logout", resp)
    router.push("/login")
}