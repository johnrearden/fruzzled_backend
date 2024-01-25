import { createContext, useContext, useState } from "react";

export const ThemeContext = createContext();
export const SetThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);
export const useSetTheme = () => useContext(SetThemeContext);

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('dark');

    return (
        <ThemeContext.Provider value={theme}>
            <SetThemeContext.Provider value={setTheme}>
                { children }
            </SetThemeContext.Provider>
        </ThemeContext.Provider>
    )
}