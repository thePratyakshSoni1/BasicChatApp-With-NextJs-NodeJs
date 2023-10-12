import { createContext, useContext, useState } from "react";

export interface ThemeProviderType{
    isDark: boolean
    setToDarkTheme: (setToDark: boolean)=>void
}

const ThemeProviderContext = createContext<ThemeProviderType>({isDark: false, setToDarkTheme: (setToDark= true)=>{}})

export function useThemeContext(){ 
    return useContext(ThemeProviderContext)
}

export function ThemeProvider( {children} :{children: React.ReactNode} ){
    const [isDarkTheme, setDarkTheme] = useState(false)

    return <ThemeProviderContext.Provider value={{isDark: isDarkTheme, setToDarkTheme: setDarkTheme}}>
        {children}
        </ThemeProviderContext.Provider> 
}