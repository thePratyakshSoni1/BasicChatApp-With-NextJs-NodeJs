import { createContext, useContext, useEffect, useState } from "react"

interface HomeContextType{
    socket: WebSocket | undefined
    messages: undefined | {userId: string, lastUpdated: string, messages: {receiver: string, chat: { id: number, isSent:boolean, data: string, at: string }[] }[]}
    initSocket: ()=>void
    sendMsg: (recepientId: string, msg: string)=>void
}

const HomeContext = createContext<HomeContextType>(
    {socket: undefined, sendMsg: (recepientId= "NONE", msg= "NONE")=>{}, initSocket: ()=>{}, messages: undefined}
)

export function useHomeContext(){
    return useContext(HomeContext)
}

export default function HomeContextProvider({children}: {children: React.ReactNode}){

    const [chatSocket, setSocket] = useState<WebSocket | undefined>(new WebSocket("ws://localhost:3200"))
    const [messages, setMessage] = useState<{userId: string, lastUpdated: string, messages: {receiver: string, chat: { id: number, isSent:boolean, data: string, at: string }[] }[]}>()
   

    const initSocket = ()=>{
        if(chatSocket?.readyState === chatSocket?.OPEN ){
            console.log("Socket already open")
        }else{
            console.log("Opening socket")
            setSocket(new WebSocket("ws://localhost:3200"))
        }
    }

    const sendMessage = (recepiendId: string, msg: string)=>{
        if(chatSocket){
            chatSocket.send(msg)
        }else{
            console.log("Socket not initialized !")
        }
    }

    useEffect(()=>{
        initSocket()
        let chatHistory = []
                console.log("Initing message listener...")
                chatSocket?.addEventListener("message", (it)=>{
                    console.log("Check Dtaa: ", JSON.parse(it.data))
                    
                    setMessage(JSON.parse(it.data))
                })
    }, [true])

    return <HomeContext.Provider value= {{socket: chatSocket, messages: messages, sendMsg: sendMessage, initSocket: initSocket}}>
        {children}
    </HomeContext.Provider>
}