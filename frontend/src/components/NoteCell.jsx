import React from 'react';
import styles from '../styles/NoteCell.module.css';

const NoteCell = ({ searchArray }) => {

    const digits = [];
    for (let i = 1; i <= 9; i++) {
        const char = i.toString();
        if (searchArray.includes(char)) {
            digits.push (
                <span 
                    className={styles.Digit}
                    key={i}
                    data-testid="note_span"
                >
                    {char}
                </span>
            )
        } else {
            digits.push(
                <span 
                    key={i}
                    data-testid="note_span"
                ></span>
            )
        }
    }

    return ( 
        <div 
            className={styles.Cell}
            data-testid={`note_cell`}
        >
            { digits }
        </div>
    )
}

export default NoteCell