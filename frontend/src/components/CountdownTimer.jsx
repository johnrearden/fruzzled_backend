import { useState, useEffect } from 'react';
import { useInterval } from '../utils/utils';
import styles from '../styles/CountdownTimer.module.css';

export const CountdownTimer = ({ initialTime, running, onTimeUp }) => {

    const [time, setTime] = useState(0);
    const [timeUp, setTimeUp] = useState(false);
    const [timerRunning, setTimerRunning] = useState(running);

    useInterval(() => {
        setTime(time => {
            if (time <= 0) {
                return 0;
            } else if (timerRunning) {
                return time - 0.02;
            } else {
                return time;
            }
        });
    }, 20);

    useEffect(() => {
        if (time < 1 && !timeUp) {
            setTimeUp(true);
            onTimeUp();
        }
    }, [time, timeUp, onTimeUp]);

    useEffect(() => {
        setTimerRunning(running);
    }, [running, timerRunning])

    useEffect(() => {
        const timeDelta = initialTime - time;
        const increment = timeDelta / 48;
        const interval = setInterval(() => {
            setTime(prev => prev + increment);
        }, 10);
        setTimeout(() => {
            clearInterval(interval);
            setTime(initialTime);
        }, 500);
    }, [initialTime])

    let secs = Math.floor(time);
    const hours = Math.floor(secs / 3600);
    const hourString = hours ? `${hours}:` : '';
    secs = secs - hours * 3600;
    const minutes = Math.floor(secs / 60);
    secs = secs - minutes * 60;

    let color = 'green';
    if (time < 10 && time > 5) {
        color = 'orange';
    } else if (time <= 5) {
        color = 'red';
    }

    const displayString = `${hourString}${String(minutes).padStart(1, '0')}:${String(secs).padStart(2, '0')}`;
    const angle = time / initialTime * 360;
    const circleStyle = { "--angle": `${angle}deg`, "--arc-color": `${color}` };

    return (
        <div className={styles.countdown_circle} style={ circleStyle }>
            <div className={styles.inner_circle}></div>
            <span
                className={`${styles.countdown_span}`}
                style={{ color }}
            >
                {displayString}
            </span>
        </div>

    );
}