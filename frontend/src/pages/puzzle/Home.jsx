import React from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../../styles/Home.module.css';
import btnStyles from '../../styles/Button.module.css';
import { Row } from 'react-bootstrap';
import { SiteLogo } from '../../components/SiteLogo';

const Home = () => {

    const mainLogoText = ['f', 'r', 'u', 'z', 'z', 'l', 'e', 'd'];

    const navigate = useNavigate();

    return (
        <>
            <Row className="mt-5 pt-5 d-flex justify-content-center">
                <SiteLogo
                    mainText={mainLogoText}
                />
            </Row>

            <h5 className={`${styles.fadeIn} text-center mt-5`}>Choose a Puzzle</h5>

            <Row className={`${styles.fadeIn} justify-content-center mt-3`}>
                <button
                    className={`${btnStyles.Button} px-3 mx-3`}
                    onClick={() => navigate('/sudoku_home')}
                    data-cy="sudoku-link"
                >
                    Sudoku
                </button>
            </Row>
            <Row className={`${styles.fadeIn} justify-content-center mt-3`}>
                <button
                    className={`${btnStyles.Button} px-3 mx-3`}
                    onClick={() => navigate('/crossword')}
                    data-cy="crossword-link"
                >
                    Crossword
                </button>
            </Row>
            {/* <Row className={`${styles.fadeIn} justify-content-center mt-3`}>
                <button
                    className={`${btnStyles.Button} px-3 mx-3`}
                    onClick={() => navigate('/anagram')}
                    data-cy="anagram-link"
                >
                    Anagram
                </button>
            </Row> */}

        </>
    )
}

export default Home