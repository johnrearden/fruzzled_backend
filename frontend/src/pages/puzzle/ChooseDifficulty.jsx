import React from 'react'
import { Row } from 'react-bootstrap'
import btnStyles from '../../styles/Button.module.css'
import styles from '../../styles/sudoku/ChooseDifficulty.module.css';
import { useNavigate } from 'react-router-dom'
import { LCLSTRG_KEY } from '../../constants/constants'


const ChooseDifficulty = ({ message, fadeIn, square }) => {

    const navigate = useNavigate();

    const handleClick = (event) => {
        const difficulty = event.target.getAttribute("data-difficulty");
        console.log('difficulty : ', difficulty)

        // Remove any stored puzzle from localStorage - keep things simple -
        // Selecting a new puzzle destroys the old one, if present
        window.localStorage.removeItem(LCLSTRG_KEY);

        navigate(`/get_puzzle/${difficulty}`)   
    }

    const levelOne = (
        <button
            onClick={handleClick}
            data-difficulty="0"
            data-cy="difficulty_button"
            className={` ${btnStyles.Button} ${btnStyles.MinWidth}`}
        >Easy</button>
    )

    const levelTwo = (
        <button
            onClick={handleClick}
            data-difficulty="1"
            data-cy="difficulty_button"
            className={` ${btnStyles.Button}  ${btnStyles.MinWidth}`}
        >Medium</button>
    )

    const levelThree = (
        <button
            onClick={handleClick}
            data-difficulty="2"
            data-cy="difficulty_button"
            className={` ${btnStyles.Button}  ${btnStyles.MinWidth}`}
        >Tricky</button>
    )

    const levelFour = (
        <button
            onClick={handleClick}
            data-difficulty="3"
            data-cy="difficulty_button"
            className={` ${btnStyles.Button}  ${btnStyles.MinWidth}`}
        >Hard</button>
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