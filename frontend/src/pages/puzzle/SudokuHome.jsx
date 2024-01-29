import React, { useEffect, useState } from 'react'
import ChooseDifficulty from './ChooseDifficulty'
import { LCLSTRG_KEY } from '../../constants/constants'
import { NavLink } from 'react-router-dom'
import styles from '../../styles/NavBar.module.css';
import { Row } from 'react-bootstrap';

const SudokuHome = () => {

    const [prevPuzzle, setPrevPuzzle] = useState(null);

    useEffect(() => {
        const previousPuzzle = window.localStorage.getItem(LCLSTRG_KEY);
        if (previousPuzzle) {
            const puzzleData = JSON.parse(previousPuzzle);
            setPrevPuzzle(puzzleData);
        }
    }, []);

    return (
        <>
            <div className="mt-5">
                <h1 className="text-center mt-5 mb-3">
                    Sudoku<small className="text-muted"> (demo)</small>
                </h1>
            </div>
            <ChooseDifficulty />

            <Row className="justify-content-center mt-5">
                {prevPuzzle && (
                    <NavLink
                        className={styles.NavLink}
                        activeClassName={styles.Active}
                        to={`/get_puzzle/${prevPuzzle.difficulty}`}>
                        <span>Or return to your previous puzzle</span>
                        <i className="fa-solid fa-arrow-rotate-left ml-1"></i>                    </NavLink>
                )}
            </Row>
        </>
    )
}

export default SudokuHome