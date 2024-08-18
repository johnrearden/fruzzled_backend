import React from 'react'
import PuzzleCell from './PuzzleCell'
import styles from '../styles/sudoku/Puzzle.module.css'
import { Row } from 'react-bootstrap'
import NoteCell from './NoteCell'

const Puzzle = ({ 
    grid, 
    searchArray,
    setSearchArray,
    showNotes,
    selectedCell, 
    handleCellSelection, 
    warningGroup, 
    clashingCell,
    completed }) => {

    const toggleNote = (cellIndex, noteDigit) => {
        noteDigit = noteDigit.toString();
        const copyArray = searchArray.map(arr => [...arr]);
        if (copyArray[cellIndex].includes(noteDigit)) {
            copyArray[cellIndex] = copyArray[cellIndex].filter(item => {
                return item !== noteDigit;
            });
        } else {
            copyArray[cellIndex].push(noteDigit);
        }
        setSearchArray(copyArray);
    }

    const cells = grid?.split("").map((char, idx) => (
        char !== '-' ? (
            <PuzzleCell
                key={idx}
                value={char}
                index={idx}
                selected={idx===selectedCell}
                warning={warningGroup.includes(idx)}
                illegal={idx===clashingCell}
                correct={completed}
                handleSelection={handleCellSelection}/>
        ) : (
            showNotes ? (
                <NoteCell 
                    key={idx}
                    index={idx}  
                    searchArray={searchArray}
                    toggleNote={toggleNote}/>
            ) :
            (
                <PuzzleCell
                    key={idx}
                    value={char}
                    index={idx}
                    selected={idx===selectedCell}
                    warning={warningGroup.includes(idx)}
                    illegal={idx===clashingCell}
                    correct={completed}
                    handleSelection={handleCellSelection}
                    />
            )
            
        )
    ))

    return (
        <>
            <Row>
                <div 
                    className={styles.Grid}
                    data-cy="puzzle_component"
                >{cells}</div>
            </Row>

        </>

    )
}

export default Puzzle