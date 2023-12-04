import { NextRequest } from "next/server";
import http from "https"
import fs from 'fs'
import EventEmitter from "events";

function sleep(mills: number) {
    return new Promise((res, rej) => {
        setTimeout(res, mills)
    })
}

async function handleRequest(req: NextRequest, method: string): Promise<Response> {

    let getBody = req.text()
    let reqHeaders = req.headers

    let cookies = req.cookies.getAll()

    let reqPath = req.url.split("/api")[1]
    console.log("\nRoute Req on: ", reqPath)


        let body = ``
        body = await getBody


        // let it = method === "GET" 
        // ?  await fetch(`${process.env.BACKEND_URL}` + reqPath, {
        //     headers: reqHeaders,
        //     method: method
        // })
        // : await fetch(`${process.env.BACKEND_URL}` + reqPath, {
        //     headers: reqHeaders,
        //     method: method,
        //     body: body
        // })



        // console.log("Resp received from render...")
        // let resp = new Response( await it.text() )
        // let cookieHeaders = it.headers.get("Set-Cookie")
        // if (cookieHeaders !== null) {
        //     console.log("Set-Cookie founded \n", cookieHeaders)
        //     resp.headers.append("Set-Cookie", cookieHeaders)
        // }

        // return resp

        let parsedCookieHeader = ``

        cookies.forEach(it=>{
            parsedCookieHeader+= `${it.name}=${it.value}; `
        })
        
        console.log("Need to forward: ", parsedCookieHeader)

        let forwardHeaders = cookies ? {
            "Origin": "http://localhost:3000",
            "Cookie": parsedCookieHeader
        } : {
            "Origin": "http://localhost:3000",
        }

        let isReqComplete = false
        let resp = new Response(JSON.stringify({ error: "true" }))
        let reqs = http.request(`${process.env.BACKEND_URL}`,
            {
                method: method,
                path: reqPath,
                headers: forwardHeaders,
                rejectUnauthorized: false
            },
            (res) => {
                console.log("StartStatus: ", res.statusCode)
                let data = ``
                res.on("end", () => {
                    console.log("LAST: ", res.statusCode)

                    let cooks = res.headers["set-cookie"]
                    console.log("CROOS: ", cooks)
                    resp = new Response(data)
                    if (cooks) {
                        cooks.forEach(it => {
                            resp.headers.append("Set-Cookie", it)
                        })
                    } else {
                        console.log("No cooks: ", res.headers)
                    }
                    isReqComplete = true

                })

                res.on("data", (chunk) => {
                    console.log("FIRST: ", chunk.toString())
                    data += chunk.toString()
                })

            })
        reqs.end(body)
        console.log("Waintin...")
        await new Promise(async (res, rej) => {
            while (!isReqComplete) {
                await sleep(1000)
                console.log("Wait....")
            }
            res(0)
        })
        console.log("EEEEEEENNNNNNNNNNNNNNDDDDDDDD")
        return resp

}

export async function GET(req: NextRequest) {
    return await handleRequest(req, "GET")

}

export async function POST(req: NextRequest) {
    return await handleRequest(req, "POST")

}