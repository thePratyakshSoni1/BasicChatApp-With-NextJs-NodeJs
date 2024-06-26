"use client"
import React from "react"
import styles from "./page.module.css"
import { useRouter } from "next/navigation"
import Script from "next/script"
import { onLogin } from "../../repositories/loginSignUpRepo"
import Constants from "@/utils/constants"

// function ErrorComponent(item: { msg: string }) {
//     if (item.msg !== "") {
//         return <p>{item.msg}</p>
//     }
// }

export default function LoginPage({myKeys, food, processEnvs}: { myKeys: { public: number, mod: number }, food: string | null, processEnvs:{ backendUrl: string, frontendUrl: string } }) {

    const [mailTxt, setMainTxt] = React.useState("")
    const [password, setPasswordTxt] = React.useState("")
    const [error, setError] = React.useState("")
    const router = useRouter() 


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

                <input type="password" placeholder="password"
                    className={styles.txtField}
                    value={password} onChange={(n) => {
                        setPasswordTxt(n.target.value)
                    }} />

                <button className={styles.loginButton} onClick={() => {
                    onLogin(
                        new Headers(),
                        mailTxt, password, router,
                        myKeys.public, myKeys.mod,
                        processEnvs.backendUrl,
                        setError
                    )
                }}> LogIn</button>

                <button className={styles.loginButton} id={styles.signupButton} onClick={() => {
                    router.push(Constants.frontendRoutes.signup)
                }}> Register</button>

            </div>
        </div >
        <Script src="/deleteCredentials.js" />
    </>
}
