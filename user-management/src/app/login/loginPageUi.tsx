"use client"
import React from "react"
import styles from "./log2/page.module.css"
import http from "http"
import fun from "../../../../backend/rsaGo"
import { headers } from "next/headers"
import { useRouter } from "next/navigation"
import Script from "next/script"
import { onLogin } from "../repositories/loginSignUpRepo"

function ErrorComponent(item: { msg: string }) {
    if (item.msg !== "") {
        return <p>{item.msg}</p>
    }
}

export default function LoginPage(myKeys: { myKeys: { public: number, mod: number }, food: string | null }) {

    const [mailTxt, setMainTxt] = React.useState("")
    const [password, setPasswordTxt] = React.useState("")
    const [error, setError] = React.useState("")
    const router = useRouter()

    return <>
        <div className={styles.loginBG}>
            <div className={styles.loginCard}>

                <h1>Welcome</h1>
                <h6>{error}</h6>
                <br></br>

                <input type="text" placeholder="email@gmail.com"
                    className={styles.txtField}
                    value={mailTxt} onChange={(n) => {
                        setMainTxt(n.target.value)
                    }} />

                <input type="password" placeholder="password"
                    className={styles.txtField}
                    value={password} onChange={(n) => {
                        setPasswordTxt(n.target.value)
                    }} />

                <ErrorComponent msg={error} />

                <button className={styles.loginButton} onClick={() => {
                    onLogin(new Headers(), mailTxt, password, router, setError)
                }}> LogIn</button>

            </div>
        </div >
        {/* <Script src="/deleteCredentials.js" /> */}
    </>
}
