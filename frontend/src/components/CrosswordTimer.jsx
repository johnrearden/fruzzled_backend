import { useEffect, useState } from 'react';
import { CROSSWORD_TIMER_LS_KEY, PUZZLE_ID_LS_KEY } from '../constants/constants';
import styles from '../styles/CrosswordTimer.module.css';

export const CrosswordTimer = (props) => {
    const [seconds, setSeconds] = useState(0);

    /**
     * Create a timer interval to update the seconds state variable every second.
     * Return a callback to remove it when page is closed.
     */
    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(seconds => seconds + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    /**
     * If we are continuing with an existing puzzle on page load (puzzleIds are equal),
     * retrieve the time this puzzle was started at. Otherwise, save the current time
     * to local storage.
     */
    useEffect(() => {
        const storedTime = parseInt(window.localStorage.getItem(CROSSWORD_TIMER_LS_KEY));
        const storedPuzzleId = window.localStorage.getItem(PUZZLE_ID_LS_KEY);
        if (storedTime && props.puzzleId == storedPuzzleId) {
            const timeDelta = Math.floor(Date.now() / 1000) - storedTime;
            setSeconds(timeDelta);
        } else {
            window.localStorage.setItem(CROSSWORD_TIMER_LS_KEY, Math.floor(Date.now() / 1000));
        }
    }, [props.puzzleId]);

    let secs = seconds;
    const hours = Math.floor(secs / 3600);
    const hourString = hours ? `${hours}:` : '';
    secs = secs - hours * 3600;
    const minutes = Math.floor(secs / 60);
    secs = secs - minutes * 60;

    return (
        <span className={styles.medium_font}>
            {hourString}{String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </span>
    );
}