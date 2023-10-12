'use client'
import { useThemeContext } from "@/components/ThemeProvider"

// import { ThemeProvider, useThemeContext } from "@/components/ThemeProvider";

// export default function TheThemeTest(){
//     return <ThemeProvider>
//         <UserComponent/>
//     </ThemeProvider>
// }

// function UserComponent(){
//     const darkTheme = useThemeContext()
//     return <section style={ {backgroundColor: darkTheme.isDark ? "black" : "white", color: darkTheme.isDark ? "white" : "black" , width: "100%", height: "100%"} }>
//                     <h2>{ darkTheme.isDark ? "Hello Darkness 🎃" : "Hello Buzz LightYear😎"}</h2>
//                     <button onClick={()=>{darkTheme.setToDarkTheme(!darkTheme.isDark)}}>Toggle Theme</button>
//             </section>
// }

export default function Main() {
    const darkTheme = useThemeContext()
    return <>
        <h1 style={{ color: darkTheme.isDark ? "orange" : "blue" }} >Radhe Radhe =-= Radhe Krishn</h1>
        <button 
        style={{ padding: "12px", backgroundColor: darkTheme.isDark ? "orange" : "blue", fontSize: "1.2rem" }} 
        onClick={() => { darkTheme.setToDarkTheme(!darkTheme.isDark) }} >
        Change Theme</button>
    </>
}