import { createContext, useContext, useEffect, useState } from "react"
import { sessionCookies } from "../utils/constants.json"

interface HomeContextType {
    currentReceiverId: string | undefined
    socket: WebSocket | undefined
    messages: undefined | { userId: string, lastUpdated: string, messages: { person: string, chat: { id: number, isSent: boolean, data: string, at: string }[] }[] }
    initSocket: () => void
    setReceiver: (receiverId: string) => void
    sendMsg: (recepientId: string, msg: string) => void
}

const HomeContext = createContext<HomeContextType>(
    {
        currentReceiverId: undefined,
        socket: undefined,
        sendMsg: (recepientId = "NONE", msg = "NONE") => { },
        initSocket: () => { }, messages: undefined,
        setReceiver: (receiverId = "NONE") => { }
    }
)

export function useHomeContext() {
    return useContext(HomeContext)
}

export default function HomeContextProvider({ children }: { children: React.ReactNode }) {

    const [chatSocket, setSocket] = useState<WebSocket | undefined>(undefined)
    const [messages, setMessage] = useState<{ userId: string, lastUpdated: string, messages: { person: string, chat: { id: number, isSent: boolean, data: string, at: string }[] }[] }>()
    const [currentReceiver, setReceiver] = useState<string | undefined>(undefined)

    const initSocket = () => {
        if (chatSocket && chatSocket?.readyState === chatSocket?.OPEN) {
            console.log("Socket already open")
        } else {
            console.log("Opening socket")
            // if (process.env.CHAT_SOCKET_URL) {
            chatSocket?.close()
            setSocket(new WebSocket("ws://192.168.20.254:3200"))
            // }else{
            //     throw new Error("ChatSocket URL is undefined")
            // }
            console.log("Initing message listener...")
        }
    }

    const sendMessage = (recepiendId: string, msg: string) => {
        if (chatSocket) {
            chatSocket.send(JSON.stringify({ receiver: recepiendId, data: msg }))
        } else {
            console.log("Socket not initialized !")
        }
    }

    useEffect(() => {


        let currentDate = new Date()
        let loginSessionWeekLimit = 4; //weeks
        let milliSecondsInWeek = 1000 * 60 * 60 * 24 * 7; // seconds in a week

        console.log("CONTEXT: Home context re-created")
        if (chatSocket) {
            console.log("CONTEXT: Chat socket already initialized ")
        } else {
            console.log("CONTEXT: Socket not inited")
            initSocket()
        }

    }, [true])

    useEffect(() => {
        console.log("Chat socket re-initiated")
        console.log("STATE: ", chatSocket?.readyState)

        if (chatSocket) {

            chatSocket.addEventListener("open", ev => {
                let currentUser = ""
                document.cookie.split("; ").find((it) => {
                    if (it.split("=")[0] === sessionCookies.userId) {
                        currentUser = it.split("=")[1]
                        return true
                    }
                })
                const randomId = `${parseInt((Math.random() * 500000).toString())}${currentUser.split("@")[0]}`
                chatSocket?.send(JSON.stringify({ isFirstPing: true, chatSessionId: `${randomId}` }))
            })

            chatSocket.addEventListener("message", (it) => {
                console.log("Check Dtaa: ", JSON.parse(it.data))
                setMessage(JSON.parse(it.data))
            })
        } else {
            console.log("MSG LISTENER NOT INITED")
        }
    }, [chatSocket])

    return <HomeContext.Provider value={{
        currentReceiverId: currentReceiver,
        socket: chatSocket,
        messages: messages,
        sendMsg: sendMessage,
        initSocket: initSocket,
        setReceiver: setReceiver
    }}>
        {children}
    </HomeContext.Provider>
}