"use client"
import { redirect, useRouter } from "next/navigation"
import styles from "./chatsPage.module.css"
import Image from "next/image"

export default function HomePage(
    props: { peoples: { name: string, mail: string }[], food: string }
) {

    const router = useRouter()
    return <>
        <section className={styles.hompageUi}>
            <div className={styles.topBar}>
                <p>&lt;</p>
                <h2>BasicChatApp</h2>
            </div>
            <div className={styles.chatList}>
                {props.peoples.map(it => {
                    return <div key={it.mail} className={styles.chatItem} onClick={()=>router.push(`/chats/${it.mail.split("@")[0]}`)}>

                        <Image src="https://i.pinimg.com/originals/ef/0d/ec/ef0dec7cb8b80b65ae925ccb9286f567.jpg"
                            alt="" width={24} height={24} />

                        <div>
                            <div>{it.name}</div>
                            <p>{it.mail}</p>
                        </div>

                    </div>
                })}

            </div>
        </section>
    </>
}
