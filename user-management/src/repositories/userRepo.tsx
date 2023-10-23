import { backendRoutes } from "../utils/constants.json"
export async function getIdFromUserName(username: string, backendUrl: string){

    let heads = new Headers()
    heads.append("Content-Type", "application/json")
    let jsonResp = await fetch(backendUrl+backendRoutes.getUser, {
        method: "POST",
        headers: heads,
        credentials: "include",
        body: JSON.stringify({username: username, getUserID: true})
    })

    let resp = await jsonResp.json()
    if(resp.isSuccess){
        return resp.userId
    }else{
        throw new Error(resp.msg)
    }
}