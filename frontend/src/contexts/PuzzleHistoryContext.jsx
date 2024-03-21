import { createContext, useContext, useState } from "react";

export const PuzzleHistoryContext = createContext();

export const usePuzzleHistoryContext = () => useContext(PuzzleHistoryContext);

export const PuzzleHistoryProvider = ({ children }) => {

    // A fallback in-memory store for the puzzle histories.
    const [puzzleHistory, setPuzzleHistory] = useState({});

    const savePuzzleToHistory = (id, puzzleType, difficulty) => {
        const key = `${puzzleType}_${difficulty}`;
        try {
            const currentValue = localStorage.getItem(key);
            let list;
            if (currentValue) {
                // Parse the list in string form and remove the id to be
                // saved from it - it should only appear once, at the end of the list.
                list = JSON.parse(currentValue);
                list = list.filter(itemId => itemId !== id);
            } else {
                list = [];
            }
            list.push(id);

            const newValue = JSON.stringify(list);
            localStorage.setItem(key, newValue);
        } catch (err) {
            let list = puzzleHistory[key];
            list.push(id);
            setPuzzleHistory(prev => ({
                ...prev,
                key: list
            }))
        }
    }

    const getPuzzleHistory = (puzzleType, difficulty) => {
        const key = `${puzzleType}_${difficulty}`;
        try {
            const list = localStorage.getItem(key);
            const parsedList = JSON.parse(list);
            return parsedList || null;
        } catch (err) {
            console.log(err);
            const list = puzzleHistory[key];
            if (list) {
                return list;
            } else {
                return null;
            }
        }
    }

    return (
        <PuzzleHistoryContext.Provider value={{ savePuzzleToHistory, getPuzzleHistory }}>
            { children }
        </PuzzleHistoryContext.Provider>
    )
}

