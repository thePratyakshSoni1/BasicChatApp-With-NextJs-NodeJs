import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";

export async function onLogin(
    headers: Headers,
    mailTxt: string,
    password: string,
    router: AppRouterInstance,
    setError: (msg: string) => void
) {

    let data = JSON.stringify({ mail: mailTxt, password: password })
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
        router.push("/chat")
    } else {
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