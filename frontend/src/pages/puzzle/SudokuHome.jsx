import React, { useEffect, useState } from 'react'
import ChooseDifficulty from './ChooseDifficulty'
import { LCLSTRG_KEY } from '../../constants/constants'
import { NavLink } from 'react-router-dom'
import navStyles from '../../styles/NavBar.module.css';
import styles from '../../styles/sudoku/SudokuHome.module.css';
import { Row } from 'react-bootstrap';
import SEO from '../../components/SEO';

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
        <div className={styles.Container}>
            <SEO
                title="Play Free Sudoku Online"
                description="Play free sudoku puzzles online at Fruzzled. Choose from Easy, Medium, Hard, or Vicious difficulty levels. Track your times and compete on the leaderboard!"
                path="/sudoku_home"
                breadcrumbs={[
                    { name: 'Home', url: 'https://fruzzled.ie' },
                    { name: 'Sudoku', url: 'https://fruzzled.ie/sudoku_home' }
                ]}
            />
            <h1 className="text-center mb-3">
                Sudoku
            </h1>
            <ChooseDifficulty />

            <Row className="justify-content-center mt-5">
                {prevPuzzle && (
                    <NavLink
                        className={navStyles.NavLink}
                        activeClassName={navStyles.Active}
                        to={`/get_puzzle/${prevPuzzle.difficulty}`}>
                        <span>Or return to your previous puzzle</span>
                        <i className="fa-solid fa-arrow-rotate-left ml-1"></i>                    </NavLink>
                )}
            </Row>
        </div>
    )
}

export default SudokuHome