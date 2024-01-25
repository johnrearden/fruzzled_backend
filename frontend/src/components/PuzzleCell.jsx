import React, { useEffect, useState } from 'react'
import styles from '../styles/PuzzleCell.module.css'

// Testing this component is a little awkward, esp cypress e2e tests, 
// as the puzzle cells appear (with their test_ids) before the get_random_puzzle
// request has resolved. If it resolves in the middle of a test, it changes
// the puzzle cell textContent. Hacked a fix by intercepting the request
// and responding with dummy puzzle (presumably instantaneous).

// It might be an idea to add a loaded prop to Puzzle and PuzzleCell to
// mitigate this if this code is used in a non-toy project

const PuzzleCell = (props) => {

    const {
        value,
        index,
        selected,
        warning,
        illegal,
        handleSelection,
        correct} = props;

    const [className, setClassName] = useState(styles.Cell);

    const isDigit = (string) => {
        return string >= "0" && string <= "9";
    }

    // Set the className state when props change.
    useEffect(() => {
        const selectedClass = selected ? styles.Selected : '';
        const warningClass = warning ? styles.Warning : '';
        const clashing = illegal ? styles.Clashing_Cell : '';
        const offending = selected && warning ? styles.Offending_Choice : '';
        const unclickable = correct ? styles.Unclickable : '';
        setClassName([
            styles.Cell,
            selectedClass,
            warningClass,
            clashing,
            offending,
            unclickable].join(' '));
    }, [selected, warning, illegal, correct])

    // Give small random delay when 'correct' prop changes before 
    // applying the animation style.
    useEffect(() => {
        if (correct) {
            const waitTime = (index % 9) * 30;
            setTimeout(() => {
                setClassName(`${styles.Cell} ${styles.spin_to_correct} ${styles.Unclickable}`);
            }, waitTime);
        }
    }, [correct, index])

    return (
        <div
            className={className}
            onClick={() => handleSelection(index)}
            aria-label="puzzle cell"
            data-testid={`puzzle_cell_${index}`}
        >
            {isDigit(value) ? value : ""}
        </div>
    )
}

export default PuzzleCell