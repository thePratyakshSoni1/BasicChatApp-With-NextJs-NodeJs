import { createContext, useContext, useEffect, useState } from "react"
import Constants from "@/utils/constants"

interface HomeContextType {
    currentReceiverId: string | undefined
    socket: WebSocket | undefined
    messages: undefined | { userId: string, lastUpdated: string, messages: { person: string, chat: { id: number, isSent: boolean, data: string, at: string, isMediaMsg: boolean, mediaType: string, mediaName: string  }[] }[] }
    initSocket: () => void
    setReceiver: (receiverId: string) => void
    sendMsg: (recepientId: string, msg: string) => void
}

const HomeContext = createContext<HomeContextType>(
    {
        currentReceiverId: undefined,
        socket: undefined,
        sendMsg: (recepientId = "NONE", msg = "NONE") => { },
        initSocket: () => { }, 
        messages: undefined,
        setReceiver: (receiverId = "NONE") => { }
    }
)

export function useHomeContext() {
    return useContext(HomeContext)
}

export default function HomeContextProvider({ children }: { children: React.ReactNode }) {

    const [chatSocket, setSocket] = useState<WebSocket | undefined>(undefined)
    const [messages, setMessage] = useState<{ userId: string, lastUpdated: string, messages: { person: string, chat: { id: number, isSent: boolean, data: string, at: string, isMediaMsg: boolean, mediaType: string, mediaName: string }[] }[] }>()
    const [currentReceiver, setReceiver] = useState<string | undefined>(undefined)
    const [chatSessionId, setChatSessionId] = useState<String|undefined>()

    const initSocket = () => {
        if (chatSocket && chatSocket?.readyState === chatSocket?.OPEN) {
            console.log("Socket already open")
        } else {
            console.log("Opening socket")
            chatSocket?.close()
            setSocket(new WebSocket("wss://chatappbackendservice.onrender.com/chatSocket"))
            console.log("Initing message listener...")
        }
    }

    const sendMessage = (recepiendId: string, msg: string) => {
        
        /** {
            data: string,
            isMediaMsg: boolean,
            mediaBufferArray: Buffer/number[],
            mediaType: string,
            mediaName: string|null
            receiver: string
        }*/

        if (chatSocket) {
            chatSocket.send(JSON.stringify({ receiver: recepiendId, data: msg, isMediaMsg: false, mediaType: Constants.messageMediaTypes.text, mediaName: null }))
        } else {
            console.log("Socket not initialized !")
        }

    }

    const onFirstPing = function( sessionId: string ){
        console.log("ChatSession id received: ", sessionId)
        setChatSessionId( sessionId )
    }
    const isFirstPing = function(dataReceived: any){
        return dataReceived.isFirstPing ? true : false
    }

    useEffect(() => {

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
            chatSocket.addEventListener("message", (it) => {
                let receivedData = JSON.parse(it.data)
                console.log("Check Dtaa: ", receivedData)
                if( isFirstPing( receivedData ) ){
                    onFirstPing(receivedData.chatSessionId)
                }else{
                    setMessage(receivedData)
                }
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