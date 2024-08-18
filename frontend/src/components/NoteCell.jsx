import React from 'react';
import styles from '../styles/sudoku/NoteCell.module.css';

const NoteCell = ({ index, searchArray, toggleNote }) => {

    const digits = [];
    for (let i = 1; i <= 9; i++) {
        const char = i.toString();
        if (searchArray[index].includes(char)) {
            digits.push (
                <span 
                    className={styles.Digit}
                    key={i}
                    data-testid="note_span"
                    onClick={() => toggleNote(index, i)}
                >
                    {char}
                </span>
            )
        } else {
            digits.push(
                <span 
                    key={i}
                    data-testid="note_span"
                    onClick={() => toggleNote(index, i)}
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