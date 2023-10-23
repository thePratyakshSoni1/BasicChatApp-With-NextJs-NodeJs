"use client"
import { redirect, usePathname, useRouter, useSearchParams } from "next/navigation"
import styles from "./chatsPage.module.css"
import Image from "next/image"
import { useEffect, useState } from "react"
import Script from "next/script"
import { useHomeContext } from "../../Contexts/HomeContextProvider"
import { backendRoutes, frontendRoutes } from "../../utils/constants.json"

export default function HomePage(
    {food, processEnvs}: { food: string, processEnvs: {backendUrl: string, socketUrl: string}}
    
) {

    /***
     * 
     * peoples, fetchPeoples() : loaded by getChats.js Script
     * 
     */

    const [chats, setPeoples] = useState<{ name: string, mail: string }[]>([{ name: "string", mail: "string" }])
    const router = useRouter()
    const chatSocket = useHomeContext()


    useEffect(
        () => {
            const currentuser = food.split("; ").find((v) => {
                return v.split("=")[0] === "userId"
            })

            let chatsXhttpReq = new XMLHttpRequest();
            chatsXhttpReq.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    console.log("Chats: ", JSON.parse(chatsXhttpReq.responseText))
                    if( JSON.parse(chatsXhttpReq.responseText).msg){
                        router.push(frontendRoutes.login)
                    }
                    setPeoples(JSON.parse(chatsXhttpReq.responseText))
                }
            };

            chatsXhttpReq.open("GET", `${processEnvs.backendUrl}${backendRoutes.peoples}`, true);
            chatsXhttpReq.withCredentials = true;

            chatsXhttpReq.send();
        }, [true]
    )

    return <>
        <section className={styles.hompageUi}>
            <br></br>
            <div className={styles.topBar}>
                <h2 onClick={() => console.log(chats)} >Chat App</h2>
            </div>
            <div className={styles.chatList}>
                {chats.map(it => {
                    return <div key={it.mail} className={styles.chatItem} onClick={() => {
                        router.push(`${frontendRoutes.chats}/${it.mail.split("@")[0]}`)
                        chatSocket.setReceiver(it.mail)
                    }}>

                        <Image src="https://i.pinimg.com/originals/ef/0d/ec/ef0dec7cb8b80b65ae925ccb9286f567.jpg"
                            alt="" width={24} height={24} />

                        <div>
                            <div>{it.mail.split("@")[0][0].toUpperCase()+it.mail.split("@")[0].slice(1, it.mail.split("@")[0].length)}</div>
                            <p>{it.mail}</p>
                        </div>

                    </div>
                })}

            </div>
        </section>

    </>
}
