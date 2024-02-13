import React, { forwardRef } from 'react';
import styles from '../styles/crossword/CellInput.module.css';

export const CellInput = forwardRef(({
    inUse,
    index,
    letter,
    clickHandler,
    changeHandler,
    cellsWidthRatio,
    maxDimension,
    selected,
    highlighted,
    showCorrectness,
    correct,
    semantic,
}, ref) => {

    const cellStyle = {
        width: `clamp(12px, ${cellsWidthRatio}vw, ${maxDimension}px)`,
        height: `clamp(12px, ${cellsWidthRatio}vw, ${maxDimension}px)`,
        fontSize: `clamp(12px, ${cellsWidthRatio}vw, ${maxDimension}px)`,
    }

    const styleHighlighted = highlighted ? styles.part_of_current_clue : '';
    let classString;
    classString = `${styles.cellInput} ${cellStyle} ${styleHighlighted}`;

    return inUse ? (
        <input
            type="text"
            ref={ref}
            pattern={/[a-z]/}
            className={classString}
            onClick={(event) => clickHandler(index, event)}
            onChange={(event) => changeHandler(index, event)}
            value={letter}
        />
    ) :
        (
            <div
                className={styles.closed}
                onClick={(event) => props.clickHandler(props.index, event)}
            ></div>
        )
});