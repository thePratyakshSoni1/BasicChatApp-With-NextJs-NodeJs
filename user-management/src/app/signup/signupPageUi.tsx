"use client"
import React from "react"
import styles from "../login/page.module.css"
import { useRouter } from "next/navigation"
import Script from "next/script"
import { onSignUp } from "@/repositories/loginSignUpRepo"

export default function SignUpPage({myKeys, food, processEnvs}: { myKeys: { public: number, mod: number }, food: string | null, processEnvs: {backendApiUrl: string} }) {

    const [mailTxt, setMainTxt] = React.useState("")
    const [password, setPasswordTxt] = React.useState("")
    const [confirmPass, setConfirmPass] = React.useState("")
    const [error, setError] = React.useState("")
    const router = useRouter()

    const filedsHaveMistakes = () => {
        if (confirmPass !== password || confirmPass === "") {
            setError("Password & confirm password isn't same")
            return true
        } else if (mailTxt.split("@").length <= 1 || mailTxt.split(".com").length <= 1) {
            setError("Add a valid email")
            return true
        } else {
            return false
        }
    }

    return <>
        <div className={styles.loginBG}>
            <div className={styles.loginCard}>

                <h1>Welcome</h1>
                <h6 style={{ color: "red" }}>{error}</h6>
                <br></br>

                <input type="text" placeholder="email@gmail.com"
                    className={styles.txtField}
                    value={mailTxt} onChange={(n) => {
                        setMainTxt(n.target.value)
                    }} />

                <input type="password" placeholder="Password"
                    className={styles.txtField}
                    value={password} onChange={(n) => {
                        setPasswordTxt(n.target.value)
                    }} />

                <input type="password" placeholder="Confirm password"
                    className={styles.txtField}
                    value={confirmPass} onChange={(n) => {
                        setConfirmPass(n.target.value)
                    }} />

                <button className={styles.loginButton} onClick={() => {
                    if (!filedsHaveMistakes()) {
                        onSignUp(
                            router,
                            mailTxt,
                            password,
                            myKeys.public,
                            myKeys.mod,
                            setError,
                            processEnvs.backendApiUrl
                        )
                    }
                }}> Register</button>

            </div>
        </div >
        <Script src="/deleteCredentials.js" />
    </>
}
