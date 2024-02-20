import React, { useEffect, useState } from 'react'
import styles from '../styles/Toggle.module.css';

export const Toggle = ({ initial, label, iconClass, handleChange }) => {

    const [on, setOn] = useState(initial);
    useEffect(() => {
        setOn(initial);
    }, [initial]);

    const handleClick = () => {
        const nextValue = !on;
        setOn(nextValue);
        handleChange(nextValue);
    }

    const onStyle = on ? { transform: 'translateX(17px)' } : {}
    const surroundClass = on
        ? `${styles.Surround} ${styles.SurroundOn}`
        : `${styles.Surround}`;

    const iconOnClass = on ? styles.IconOn : ''

    const icon = iconClass ? (
        <i className={`${iconClass} ${styles.Icon} ${iconOnClass}`}/>
    ) : (
        <></>
    )

    return (
        <div 
            onClick={handleClick}
            className="d-flex flex-column justify-content-center align-items-center"
        >
            <span className={styles.Label}>{label}</span>
            <div className={surroundClass}>
                <div
                    className={styles.Switch}
                    style={onStyle}
                >
                    {icon}
                </div>
            </div>

        </div>
    )
}