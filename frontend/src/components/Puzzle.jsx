import React from 'react'
import PuzzleCell from './PuzzleCell'
import styles from '../styles/Puzzle.module.css'
import { Row } from 'react-bootstrap'
import NoteCell from './NoteCell'

const Puzzle = ({ 
    grid, 
    searchArray,
    showNotes,
    selectedCell, 
    handleCellSelection, 
    warningGroup, 
    clashingCell,
    completed }) => {

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
                <NoteCell searchArray={searchArray[idx]} key={idx}/>
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