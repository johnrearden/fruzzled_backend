import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import styles from '../../styles/Home.module.css';
import btnStyles from '../../styles/Button.module.css';
import { Row } from 'react-bootstrap';
import { SiteLogo } from '../../components/SiteLogo';
import { UsageReport } from '../../components/UsageReport';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import CookieConsent from 'react-cookie-consent';

const Home = () => {

    const mainLogoText = ['f', 'r', 'u', 'z', 'z', 'l', 'e', 'd'];

    const navigate = useNavigate();

    const currentUser = useCurrentUser();

    return (
        <>
            <Row className="mt-5 pt-5 d-flex justify-content-center">
                <SiteLogo
                    mainText={mainLogoText}
                />
            </Row>

            <h5 className={`${styles.fadeIn} text-center mt-5`}>Choose a Puzzle</h5>

            <Row className={`${styles.fadeIn} justify-content-center mt-3`}>
                <NavLink
                    to="/sudoku_home"
                    data-cy="sudoku-link"
                    className={`${btnStyles.Button} px-3 mx-3`}
                >
                    Sudoku
                </NavLink>
            </Row>
            <Row className={`${styles.fadeIn} justify-content-center mt-3`}>
                <NavLink
                    to="/crossword"
                    className={`${btnStyles.Button} px-3 mx-3`}
                    data-cy="crossword-link"
                >
                    Crossword
                </NavLink>
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

            {currentUser && (
                <>
                    <Row className="justify-content-center mt-5">
                        <UsageReport/>
                    </Row>
                </>
                
            )}

            <CookieConsent
                disableStyles={true}
                location='bottom'
                buttonClasses={styles.AcceptButton}
                declineButtonClasses={styles.DeclineButton}
                containerClasses={styles.CookieConsentContainer}
                overlayClasses={styles.CookieConsentOverlay}
                buttonText="Accept"
                declineButtonText="Decline"
                cookieName="profile-consent-cookie"
                expires={180}
                enableDeclineButton
                overlay
                flipButtons
            >
                This website uses cookies to remember your profile.
            </CookieConsent>
            

        </>
    )
}

export default Home