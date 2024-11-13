import { createContext, useContext, useEffect, useState } from "react";
import { THEME_LS_KEY } from "../constants/constants";

export const ThemeContext = createContext();
export const SetThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);
export const useSetTheme = () => useContext(SetThemeContext);

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('dark');


    // Get the saved theme preference from localStorage. If it doesn't exist, use
    // the system preference. Use 'dark' as the default.
    useEffect(() => {
        const savedThemePreference = window.localStorage.getItem(THEME_LS_KEY);
        console.log('localStorage Theme : ', savedThemePreference);

        if (savedThemePreference) {
            setTheme(savedThemePreference);
        } else {
            const useDark = window.matchMedia("(prefers-color-scheme: dark)");
            console.log('system preference for dark mode: ', useDark.matches);
            if (useDark.matches) {
                setTheme('dark');
            } else {
                setTheme('light');
            }
        }
    }, [])

    return (
        <ThemeContext.Provider value={theme}>
            <SetThemeContext.Provider value={setTheme}>
                { children }
            </SetThemeContext.Provider>
        </ThemeContext.Provider>
    )
}