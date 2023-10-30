"use client"
import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { getImgUrlFromImageBuffer } from "@/repositories/imageMsgRepo"
import styles from "./page.module.css"
import Spinner from "../spinner"

export default function Testpage() {
    const [divImgUrl, setImgUrl] = useState<string>("")
    const [isImgLoading, setLoading] = useState<boolean>(true)
    
    useEffect(() => {

        // fetch("http://localhost:3100/getImg", {
        //     method: "GET"
        // }).then(async it => {

        //     let imgDataBuf = await it.json()
        //     setLoading(false)
        //     setImgUrl(getImgUrlFromImageBuffer(imgDataBuf.img.data))

        // })
        // console.log("Fetching....")

    })

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedImg = event.target.files === null ? undefined : event.target.files[0]
        if (selectedImg) {
            let imgBuf = new Uint8Array(await selectedImg?.arrayBuffer())
            console.log(selectedImg)
            let sreader = selectedImg?.stream().getReader()
            let dataToSent = {
                imgaeBuf: Buffer.from(imgBuf),
                data: "Sending image: "+selectedImg.name,
                mediaName: selectedImg.name
            }
            // let dataToSent = {
            //     imgaeBuf: Buffer.from(Uint8Array.from(Buffer.from("Hellow Server"))),
            //     data: "Sending image: "+"helloServer.txt",
            //     mediaName: "helloServer.txt"
            // }

            fetch( "http://localhost:3100/getImg", {
                method: "POST",
                credentials: "include",
                body: JSON.stringify(dataToSent)
            }).then((it)=>console.log("....Sent"))
            console.log("Sending...")

        }

    }

    return <div style={{ width: "50vw", height: "auto", overflow: "hidden" }}>
        { isImgLoading ? <Spinner isVisible={isImgLoading} /> : <Image alt="" id={styles.imageFrame} sizes="100vw" width="0" height="0" style={{ width: "100%", height: "auto" }} src={divImgUrl} />
        }{/* <p ref={animationFrame} id={styles.animeTest}>01</p> */}
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        
    </div>
}