'use client'
import React, { useEffect, useRef, useState } from "react"
import styles from "./chatPage.module.css"
import Image from "next/image"
import { onLogout } from "../../../repositories/loginSignUpRepo"
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation"
import http from "http"
import { headers } from "next/headers"
import Script from "next/script"
import { useHomeContext } from "../../../Contexts/HomeContextProvider"
import Constants from "@/utils/constants"
import { getIdFromUserName } from "@/repositories/userRepo"
import { getImgUrlFromImageBuffer } from "@/repositories/imageMsgRepo"
import Spinner from "@/app/spinner"

function MessageChip({ msg, isSent }: { msg: string, isSent: boolean }) {
    if (isSent)
        return <div className={styles.msgContainer}>
            <div className={styles.msgSent}>{msg}</div>
        </div>
    else
        return <div className={styles.msgContainer}>
            <div className={styles.msgReceived}>{msg}</div>
        </div>
}

function ImageMessageChip({ msg, isSent, imageName, backendUrl, receiver }: { msg: string, isSent: boolean, imageName: string, backendUrl: string, receiver: string|undefined }) {

    const [imgLoadingState, setImageLoadingState] = useState<{ imgSrc: string, isLoading: boolean }>({ imgSrc: "", isLoading: true })

    let reqHeaders = new Headers()
    reqHeaders.append("Content-Type", "application/json")
    useEffect(()=>{
        fetch(
                backendUrl + Constants.backendRoutes.getUserMediaImage,
                {
                    method: "POST",
                    headers: reqHeaders,
                    credentials: "include",
                    body: JSON.stringify({ receiver: receiver, mediaName: imageName })
                }
            ).then((it) => {
                let responseData: { mediaName: string, buffer: number[], isSuccess: boolean, errorCode: undefined|number }
                it.json().then(respData => {
                    responseData = respData
                    let imgSrcFromBuffer = getImgUrlFromImageBuffer(responseData.buffer)
                    setImageLoadingState({ imgSrc: imgSrcFromBuffer, isLoading: false })
                })
            })
    },[])

    if (isSent)
        return <div className={styles.msgContainer}>
            {imgLoadingState.isLoading ? <div className = {styles.imageMsgSentSpinnerContainer}> <Spinner isVisible={imgLoadingState.isLoading} /></div>
                : <Image className= {styles.imgMsgSent} src={imgLoadingState.imgSrc} alt="" width={120} height={120} />
            }
            <div className= {styles.imgMsgTxtSent} >{msg}</div>
        </div>
    else
        return <div className={styles.msgContainer}>
            {imgLoadingState.isLoading ? <div className={styles.imageMsgReceivedSpinnerContainer}><Spinner isVisible={imgLoadingState.isLoading} /></div>
                : <Image className= {styles.imgMsgReceived} src={imgLoadingState.imgSrc} alt="" width={120} height={120} />
            }
            <div className= {styles.imgMsgTxtReceived} >{msg}</div>
        </div>

}

function MenuOptions(
    items: { menuItems: { name: string, onclick: () => void }[], isOptionVisible: boolean, setOptionsState: (isVisible: boolean) => void }
) {

    const optRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!items.isOptionVisible) {
            hideMenu()
        }
    }, [items.isOptionVisible])

    const showMenu = () => {
        optRef.current == null ? undefined : optRef.current.style.display = "block"
        optRef.current?.focus()
        items.setOptionsState(true)
    }

    const hideMenu = () => {
        items.setOptionsState(false)
        optRef.current == null ? undefined : optRef.current.style.display = "none"
    }

    return <div className={styles.menu} >
        <Image id={styles.options} src="/options.png" alt="" width={24} height={24}
            onClick={showMenu} />
        <div ref={optRef} id={styles.dropDownMenu} onMouseLeave={hideMenu} >
            <ul >
                {items.menuItems.map((it, index) => {
                    return <li key={index} onClick={it.onclick}>{it.name}</li>
                })}
            </ul>
        </div>
    </div>

}

function MsgTextField({ onImageMsg, setMsg, onSend, msg }: { onImageMsg: (imgBuffer: Buffer, data: string, mediaName: string) => void, msg: string, setMsg: (msg: string) => void, onSend: () => void }) {

    return <div className={styles.msgTextField}>
        <input type="text" placeholder="Write your msg here" value={msg} onChange={(ev) => {
            setMsg(ev.target.value)
        }}
            onKeyUp={(event) => { if (event.key === "Enter") onSend() }} />
        <AddPhotoButton onImageMsg={onImageMsg} />
    </div>
}

function AddPhotoButton({ onImageMsg }: { onImageMsg: (imgBuffer: Buffer, data: string, mediaName: string) => void }) {

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        let imgFormData = new FormData()
        const selectedImg = event.target.files === null ? undefined : event.target.files[0]
        if (selectedImg) {
            selectedImg?.arrayBuffer().then(it => {
                let imgBuf = Buffer.from(it)
                console.log(selectedImg)
                let sreader = selectedImg?.stream().getReader()
                onImageMsg(
                    imgBuf,
                    "Sending image: " + selectedImg.name,
                    selectedImg.name
                )
                console.log("Sending...")
            })


        }
        // console.log("X: ", x.toString())



        if (selectedImg) {
            let fileReader = new FileReader()
            fileReader.onload = (event) => {
                if (typeof event.target?.result === "string") {
                    setImg(event.target?.result)
                }
            }
            fileReader.readAsDataURL(selectedImg)

        }
    }
    const addPhotoInputRef = useRef<HTMLInputElement | null>(null)
    const [imgsrc, setImg] = useState<string>("https://i.pinimg.com/none")


    return <div>
        <input className={styles.photoInput} ref={addPhotoInputRef} type="file" accept="image/*" onChange={handleImageUpload} />
        <Image onClick={() => {
            addPhotoInputRef.current?.click()
        }} className={styles.addPhotoButton} width="32" height="32" src="https://img.icons8.com/ios-filled/50/737373/camera--v3.png" alt="camera--v3"/>
    </div>
}


export default function ChatPage({ food, processEnvs }: { food: string, processEnvs: { backendUrl: string, frontendUrl: string } }) {


    const chatList = React.useRef<null | HTMLElement>(null)

    const [isOptionsVisible, setOptionsVisible] = React.useState(false)


    /**
     * {
        id: number,
        isSent: boolean,
        data: string,
        at: string (Date),
        isMediaMsg: boolean,
        mediaBufferArray: Buffer/number[],
        mediaType: string,
        mediaName: string
    }
     */
    const [userTexts, setUserTexts] = useState<{ id: number, isSent: boolean, data: string, at: string, isMediaMsg: boolean, mediaType: string, mediaName: string }[]>([])
    const [msgField, setMadFieldText] = React.useState("")
    const [sendingMsgsState, setSendingMsg] = useState<{ msgTempId: string, state: number }[]>([])

    const { chatId } = useParams()

    const sendImageMsg = (mediaBuffer: Buffer, data: string = "", mediaName: string) => {
        let msgTosend = {
            id: parseInt((Math.random() * 50000).toString()),
            receiver: homeContext.currentReceiverId,
            isSent: true,
            data: data,
            at: (new Date()).toUTCString(),
            isMediaMsg: true,
            mediaBufferArray: mediaBuffer,
            mediaType: Constants.messageMediaTypes.image,
            mediaName: mediaName
        }

        let headersForMsgReq = new Headers()
        headersForMsgReq.append("Content-Type", "application/json")

        fetch(
            processEnvs.backendUrl + Constants.backendRoutes.sendImageMsg,
            {
                method: "POST",
                credentials: "include",
                headers: headersForMsgReq,
                body: JSON.stringify(msgTosend)
            }
        )

    }

    let x = ["hi", 0, 1]

    const router = useRouter()

    const homeContext = useHomeContext()

    const updateUserTexts = () => {
        console.log("Populating text history")
        let chatHistory: { id: number, isSent: boolean, data: string, at: string, isMediaMsg: boolean, mediaType: string, mediaName: string }[] = []
        let userChats = homeContext.messages?.messages.find((msgPayloads) => {
            console.log("on: ", msgPayloads.person)
            return msgPayloads.person.split("@")[0] === chatId
        });

        console.log("current page msg: ", userChats)
        chatHistory =
            userChats ? userChats.chat : [];

        var sortedTexts = chatHistory.sort((a, b) => {
            return (new Date(a.at)) <= (new Date(b.at)) ? -1 : 1;
        });
        setUserTexts(sortedTexts)
    }

    useEffect(() => {

        if (homeContext.currentReceiverId === undefined) {
            getIdFromUserName(`${chatId}`).then((it) => {
                homeContext.setReceiver(it)
                console.log("Receiver hardset: ", it)
            })
        }

        if (homeContext.messages?.messages && homeContext.messages?.messages.length > 1) {
            console.log("Load lodaded hist: ", homeContext.messages?.messages.length)
            updateUserTexts()
        }

        window.addEventListener('beforeunload', (beforeUnloadEvent) => {
            console.log("Beforeunload: Changing nwMethod")
            homeContext.socket?.close()
            alert("Changin...aAaaAAaaAAAA")
            return "Changin...aAaaAAaaAAAA"
        })

        window.addEventListener('onunload', (beforeUnloadEvent) => {
            console.log("OnUnload: Changing nwMethod")
            homeContext.socket?.close()
            alert("Changin...aAaaAAaaAAAA")
        })


    }, [true])

    useEffect(updateUserTexts, [homeContext?.messages?.messages])


    useEffect(
        () => {
            chatList.current?.scrollBy(0, chatList.current.scrollHeight)
            console.log("Now updates: ", userTexts)
            setTimeout(() => chatList.current?.scrollBy(0, chatList.current.scrollHeight), 400)
        }, [userTexts]
    )

    const onSend = () => {
        if (homeContext.messages) {
            homeContext.currentReceiverId ? homeContext.sendMsg(homeContext.currentReceiverId, msgField) : router.back()
            setMadFieldText("")
        }
    }

    const handleOptionsVisibility = () => {
        if (isOptionsVisible) {
            setOptionsVisible(false)
        }
    }

    const onBackButton = () => {
        router.push(Constants.frontendRoutes.chats)
    }


    return <section className={styles.chatInterfaceBody} onClick={handleOptionsVisibility}>
        <section className={styles.chatBox}>

            <section className={styles.topBarContainer}>

                <div className={styles.pageTopBar}>
                    <Image id={styles.goBackBtn} onClick={onBackButton} width="24" height="24" src="https://img.icons8.com/material-sharp/24/000000/left.png" alt="go back" />

                    <Image id={styles.personPic}
                        src="https://i.pinimg.com/originals/ef/0d/ec/ef0dec7cb8b80b65ae925ccb9286f567.jpg"
                        alt="" width={24} height={24}
                    />
                    <div id={styles.personName}>{chatId.toString()}</div>

                    <MenuOptions
                        menuItems={[
                            { name: "Settings", onclick: () => { console.log("To Settings") } },
                            { name: "Info", onclick: () => { console.log("To user info") } },
                            {
                                name: "Logout", onclick: () => {
                                    homeContext.socket?.close()
                                    onLogout(router, processEnvs.backendUrl)
                                }
                            }
                        ]}
                        isOptionVisible={isOptionsVisible} setOptionsState={setOptionsVisible}
                    />
                </div>
            </section>

            <section ref={chatList} className={styles.chatSection} onChange={(ev) => { }}>
                {
                    userTexts.map((it, indx) => {
                        if (it.isMediaMsg && it.mediaType === Constants.messageMediaTypes.image) {
                            return <ImageMessageChip key={it.id} isSent={it.isSent} receiver={homeContext.currentReceiverId} imageName={it.mediaName} msg={it.data} backendUrl={processEnvs.backendUrl} />
                        } else {
                            return <MessageChip key={it.id} msg={it.data} isSent={it.isSent} />
                        }
                    })
                }
            </section>

            <section className={styles.actionSection}>
                <MsgTextField onImageMsg={sendImageMsg} msg={msgField} setMsg={(msg) => { setMadFieldText(msg) }} onSend={onSend} />
                <button onClick={(ev) => {
                    onSend()
                }} className={styles.sendButton} >Send</button>
            </section>

        </section>
        {/* <Script src="/clientScr.js" /> */}
    </section>
}