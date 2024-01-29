import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import styles from '../../styles/NavBar.module.css';
import btnStyles from '../../styles/Button.module.css';
import { Row } from 'react-bootstrap';
import { SiteLogo } from '../../components/SiteLogo';

const Home = () => {

    const mainLogoText = ['f', 'r', 'u', 'z', 'z', 'l', 'e', 'd'];

    const navigate = useNavigate();

    return (
        <>
            <Row className="mt-5 d-flex justify-content-center">
                <SiteLogo
                    mainText={mainLogoText}
                />
            </Row>

            <h3 className="text-center mt-5">Choose a Puzzle</h3>

            <Row className="justify-content-center mt-3">
                
                <button 
                    className={`${btnStyles.Button} mx-3`}
                    onClick={() => navigate('/sudoku_home')}
                >
                    Sudoku
                </button>
                <button 
                    className={`${btnStyles.Button} mx-3`}
                    onClick={() => navigate('/crossword')}
                >
                    Crossword
                </button>
                <button 
                    className={`${btnStyles.Button} mx-3`}
                    onClick={() => navigate('/anagram')}
                >
                    Anagram
                </button>
            </Row>
        </>
    )
}

export default Home