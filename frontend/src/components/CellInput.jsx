import React, { forwardRef } from 'react';
import styles from '../styles/crossword/CellInput.module.css';

export const CellInput = forwardRef(({
    inUse,
    index,
    letter,
    clickHandler,
    keyUpHandler,
    inputHandler,
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
        fontSize: `clamp(9px, ${cellsWidthRatio / 1.3}vw, ${maxDimension * 0.75}px)`,
    }
    

    const styleHighlighted = highlighted ? styles.part_of_current_clue : '';
    let classString;
    classString = `${styles.cellInput} ${styleHighlighted}`;

    return inUse ? (
        <input
            type="text"
            ref={ref}
            className={ classString }
            style={cellStyle}
            onClick={(event) => clickHandler(index, event)}
            onKeyUp={(event) => keyUpHandler(index, event)}
            onInput={(event) => inputHandler(index, event)}
            value={letter}
            autoCapitalize='characters'
        />
    ) :
        (
            <div
                className={styles.closed}
                onClick={(event) => props.clickHandler(props.index, event)}
            ></div>
        )
});