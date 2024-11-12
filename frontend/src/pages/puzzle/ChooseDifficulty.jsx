import React from 'react'
import { Row } from 'react-bootstrap'
import btnStyles from '../../styles/Button.module.css'
import styles from '../../styles/sudoku/ChooseDifficulty.module.css';
import { NavLink } from 'react-router-dom'
import { LCLSTRG_KEY} from '../../constants/constants';


const ChooseDifficulty = ({ message, fadeIn, square }) => {

    const handleClick = (event) => {
        // Remove any stored puzzle from localStorage - keep things simple -
        // Selecting a new puzzle destroys the old one, if present
        window.localStorage.removeItem(LCLSTRG_KEY);
    }

    const levelOne = (
        <NavLink
            to="/get_puzzle/0"
            data-difficulty="0"
            data-cy="easy-difficulty-button"
            onClick={handleClick}
            className={` ${btnStyles.Button} ${btnStyles.MinWidth} text-center`}
        >
            Easy
        </NavLink>
        
    )

    const levelTwo = (
        <NavLink
            to="/get_puzzle/1"
            data-difficulty="1"
            data-cy="medium-difficulty-button"
            onClick={handleClick}
            className={` ${btnStyles.Button}  ${btnStyles.MinWidth} text-center`}
        >Medium</NavLink>
    )

    const levelThree = (
        <NavLink
            to="/get_puzzle/2"
            data-difficulty="2"
            data-cy="tricky-difficulty-button"
            onClick={handleClick}
            className={` ${btnStyles.Button}  ${btnStyles.MinWidth} text-center`}
        >Tricky</NavLink>
    )

    const levelFour = (
        <NavLink
            to="/get_puzzle/3"
            data-difficulty="3"
            data-cy="hard-difficulty-button"
            onClick={handleClick}
            className={` ${btnStyles.Button}  ${btnStyles.MinWidth} text-center`}
        >Hard</NavLink>
    )

    return (
        <div className={fadeIn && styles.FadeIn}>
            <Row className="d-flex justify-content-center text-center mt-1">
                <h5>{message || 'Choose Difficulty Level'} </h5>
            </Row>

            { square ? (
                <>
                    <Row className="d-flex justify-content-center mt-2">
                        { levelOne }
                        { levelTwo }
                    </Row>
                    <Row className="d-flex justify-content-center mt-2">
                        { levelThree }
                        { levelFour }
                    </Row>
                </>
            ) : (
                <>
                    <Row className="d-flex justify-content-center mt-2">
                        { levelOne }
                    </Row>
                    <Row className="d-flex justify-content-center mt-2">
                        { levelTwo }
                    </Row>
                    <Row className="d-flex justify-content-center mt-2">
                        { levelThree }
                    </Row>
                    <Row className="d-flex justify-content-center mt-2">
                        { levelFour }
                    </Row>
                </>
            )}
            
        </div>
    )
}

export default ChooseDifficulty