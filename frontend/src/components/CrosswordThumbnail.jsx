import React, { useEffect, useState } from 'react';
import styles from '../styles/crossword/CrosswordThumbnail.module.css';
import { CLOSED_CELL } from '../constants/constants';

export const CrosswordThumbnail = ({ puzzle }) => {

    const { grid, clues, id } = puzzle;
    const [gridContents, setGridContents] = useState([]);

    useEffect(() => {
        const array = grid.cells.slice().split('');
        clues.forEach(clue => {
            clue.solution.split('').forEach((char, index) => {
                let position;
                if (clue.orientation === "AC") {
                    position = clue.start_row * grid.width + clue.start_col + index;
                } else {
                    position = (clue.start_row + index) * grid.width + clue.start_col;
                }
                array[position] = char;
            })
        });
        setGridContents(array);
    }, [puzzle])

    const cells = gridContents.map((char, index) => {
        const cellClass = char === CLOSED_CELL ? styles.EmptyCell : ''
        return (
            <span
                key={index}
                className={`${styles.MiniCell} ${cellClass}`}
            >{char}</span>
        )
    });

    const gridStyle = {
        gridTemplateRows: `repeat(${grid.height}, 15px)`,
        gridTemplateColumns: `repeat(${grid.width}, 15px)`,
    }
    const componentWidth = grid.width * 15;
    return (
        <div 
            className={styles.Container}
            style={{ width: componentWidth }}
        >
            <h6 
                className={styles.PuzzleId}
            ># {id}</h6>
            <div
                className={styles.MiniGrid}
                style={gridStyle}
            >
                {cells}
            </div>
        </div>

    )
}
