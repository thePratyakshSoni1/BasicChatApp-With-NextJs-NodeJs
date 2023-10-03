'use client'
import React, { useEffect, useRef } from "react"
import styles from "./chatPage.module.css"
import Image from "next/image"
import { onLogout } from "../repositories/loginSignUpRepo"
import { useRouter } from "next/navigation"

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
                {items.menuItems.map((it) => {
                    return <li key={it.name} onClick={it.onclick}>{it.name}</li>
                })}
            </ul>
        </div>
    </div>

}


export default function ChatPage({ msg }: { msg: { id: number, msg: string, isSent: boolean }[] }) {


    const chatList = React.useRef<null | HTMLElement>(null)

    const [messages, setMessage] = React.useState(msg)
    const [msgField, setMadFieldText] = React.useState("")
    const [isOptionsVisible, setOptionsVisible] = React.useState(false)
    const router = useRouter()

    React.useEffect(
        () => {
            console.log("I ram")
            chatList.current?.scrollBy(0, chatList.current.scrollHeight)
        }, [messages]
    )

    const onSend = () => {
        let toUpdate = { id: messages.length, msg: msgField, isSent: true }
        setMessage([...messages, toUpdate])
        setMadFieldText("")
        // console.log(messages)
    }

    const handleOptionsVisibility = () => {
        if (isOptionsVisible) {
            setOptionsVisible(false)
        }
    }


    return <section className={styles.chatInterfaceBody} onClick={handleOptionsVisibility}>
        <section className={styles.pageTopBar}>

            <Image id={styles.personPic}
                src="https://i.pinimg.com/originals/ef/0d/ec/ef0dec7cb8b80b65ae925ccb9286f567.jpg"
                alt="" width={24} height={24}
            />
            <div id={styles.personName}>Krishn</div>

            <MenuOptions
                menuItems={[
                    { name: "Settings", onclick: () => { console.log("To Settings") } },
                    { name: "Info", onclick: () => { console.log("To user info") } },
                    { name: "Logout", onclick: () => { onLogout(router) } }
                ]}
                isOptionVisible={isOptionsVisible} setOptionsState={setOptionsVisible}
            />
        </section>

        <section className={styles.chatBox}>


            <section ref={chatList} className={styles.chatSection} onChange={(ev) => { }}>
                {
                    messages.map((it) => {
                        return <MessageChip key={it.id} msg={it.msg} isSent={it.isSent} />
                    })
                }
            </section>

            <section className={styles.actionSection}>
                <input className={styles.msgTextField} type="text" placeholder="Write your msg here" value={msgField} onChange={(ev) => {
                    setMadFieldText(ev.target.value)

                }}
                    onKeyUp={(event) => { if (event.key === "Enter") onSend() }}
                ></input>
                <button onClick={(ev) => {
                    onSend()
                }} className={styles.sendButton} >Send</button>
            </section>

        </section>
    </section>
}