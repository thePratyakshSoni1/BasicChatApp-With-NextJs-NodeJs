'use client'

import { ThemeProvider, useThemeContext } from "@/components/ThemeProvider";
import { useRouter } from "next/navigation";

// export default function TheThemeTest(){
//     return <ThemeProvider>
//         <UserComponent/>
//     </ThemeProvider>
// }

export default function UserComponent(){
    const darkTheme = useThemeContext()
    const router = useRouter()
    return <section style={ {backgroundColor: darkTheme.isDark ? "black" : "white", color: darkTheme.isDark ? "white" : "black" , width: "100%", height: "100%"} }>
                    <h2>{ darkTheme.isDark ? "Hello Darkness 🎃" : "Hello Buzz LightYear😎"}</h2>
                    <button onClick={()=>{darkTheme.setToDarkTheme(!darkTheme.isDark)}}>Toggle Theme</button>
                    <button onClick={()=>{router.push("/themeTest/themeSubRoute")}}>Go</button>
            </section>
}