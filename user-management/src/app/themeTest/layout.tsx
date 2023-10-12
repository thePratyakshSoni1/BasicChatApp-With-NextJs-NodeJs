'use client'
import { ThemeProvider } from "@/components/ThemeProvider";

export default function MainActivity({children} :{children: React.ReactNode}){
    return <ThemeProvider>
        <div style={{color: "green"}}>
            <h2 style={{color: "white", textAlign: "center", width: "100%"}}> MainActivity </h2>
            {children}
        </div>
    </ThemeProvider>
}