import { createContext, useContext, useEffect, useState } from "react"

interface HomeContextType {
    currentReceiverId: string | undefined
    socket: WebSocket | undefined
    messages: undefined | { userId: string, lastUpdated: string, messages: { person: string, chat: { id: number, isSent: boolean, data: string, at: string }[] }[] }
    initSocket: () => void
    setReceiver: (receiverId: string) => void
    sendMsg: (recepientId: string, msg: string) => void
}

const HomeContext = createContext<HomeContextType>(
    { currentReceiverId: undefined, socket: undefined, sendMsg: (recepientId = "NONE", msg = "NONE") => { }, initSocket: () => { }, messages: undefined, setReceiver: (receiverId = "NONE") => { } }
)

export function useHomeContext() {
    return useContext(HomeContext)
}

export default function HomeContextProvider({ children }: { children: React.ReactNode }) {

    const [chatSocket, setSocket] = useState<WebSocket | undefined>(undefined)
    const [messages, setMessage] = useState<{ userId: string, lastUpdated: string, messages: { person: string, chat: { id: number, isSent: boolean, data: string, at: string }[] }[] }>()
    const [currentReceiver, setReceiver] = useState<string|undefined>(undefined)

    const initSocket = () => {
        if (chatSocket && chatSocket?.readyState === chatSocket?.OPEN) {
            console.log("Socket already open")
        } else {
            console.log("Opening socket")
            setSocket(new WebSocket("ws://localhost:3200"))

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

        console.log("Home context re-created")
        if (chatSocket) {
            console.log("Chat socket already initialized ")
        } else {
            console.log("Socket not inited")
            initSocket()
        }

    }, [true])

    useEffect(() => {
        console.log("Chat socket re-initiated")
        console.log("STATE: ", chatSocket?.readyState)
        if (chatSocket) {
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