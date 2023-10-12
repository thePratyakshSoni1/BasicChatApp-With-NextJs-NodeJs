"use client"
import { useEffect } from "react";
import HomeContextProvider from "../../../Contexts/HomeContextProvider";

export default function ChatActivity({children}: {children: React.ReactNode}){    

    return <HomeContextProvider>
        {children}
    </HomeContextProvider>
}