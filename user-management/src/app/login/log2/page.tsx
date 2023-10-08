'use client'
import Script from "next/script";
import { useRouter } from "next/navigation";

export default function HelloPage(){

    const router = useRouter()

    return <>
            
        <h1>Hello Log2 Page</h1>
        <button onClick={()=>{
                router.push("/")
            }}>Home</button>
            <button onClick={()=>{
                router.push("/login")
            }}>LogIn</button>
            <button onClick={()=>{
                router.push("/hello")
            }}>Hello</button> 
            <button onClick={()=>{
                fetchPeoples()  // loaded by js
            }}>Check JS</button>
            <br></br>

        <Script src="/getChats.js"/>

    </>

}