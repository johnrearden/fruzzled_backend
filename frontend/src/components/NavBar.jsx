import React, { useState } from 'react'
import { Navbar, Nav, Container, Row, Col } from 'react-bootstrap';
import { NavLink } from "react-router-dom";
import styles from "../styles/NavBar.module.css";
import btnStyles from "../styles/Button.module.css";
import { useCurrentUser, useSetCurrentUser } from '../contexts/CurrentUserContext';
import axios from 'axios';
import useClickOutsideToggle from '../hooks/useClickOutsideToggle';
import { useSetTheme, useTheme } from '../contexts/ThemeContext';
import { useProfile } from '../contexts/ProfileContext';
import ReactCountryFlag from 'react-country-flag';


const NavBar = () => {
    const currentUser = useCurrentUser();
    const setCurrentUser = useSetCurrentUser();

    const profile = useProfile();

    const theme = useTheme();
    const setTheme = useSetTheme();

    const [isChecked, setIsChecked] = useState(theme === 'light');

    const handleThemeToggle = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
        setIsChecked(!isChecked);
    }

    const { expanded, setExpanded, ref } = useClickOutsideToggle();

    const handleSignout = async () => {
        try {
            await axios.post('/dj-rest-auth/logout/');
            setCurrentUser(null);
        } catch (err) {
            console.log(err);
        }
    }

    // eslint-disable-next-line
    const loggedOutIcons = (
        <>
            <NavLink
                className={styles.NavLink}
                // activeClassName={styles.Active}
                to="/signin">
                <i className="fa-solid fa-arrow-right-to-bracket"></i>
            </NavLink>
        </>
    );

    // eslint-disable-next-line
    const loggedInIcons = (
        <>
            <NavLink
                className={styles.NavLink}
                to="/anagram_creator"
                >
                <i className="fa-solid fa-shuffle"></i>
            </NavLink>
            <NavLink
                className={styles.NavLink}
                to="/"
                >
                <i className="fa-solid fa-table-cells-large"></i>
            </NavLink>
            <NavLink
                className={styles.NavLink}
                to="/"
                onClick={() => {
                    handleSignout();
                }}>
                <i className="fa-solid fa-person-walking-arrow-right"></i>
            </NavLink>

        </>)

    return (
        <>
            <div className={styles.NavContainer}>
                <div className={styles.HomeSection}>
                    <NavLink to="/">
                        <div className={styles.HomeText}>
                            <h4
                                className={styles.FreckleFaceFont}
                                title="Return to home page"
                            >fruzzled</h4>
                        </div>
                    </NavLink>
                    <div className={styles.HomeIcon}>
                        <NavLink
                            className={styles.NavLink}
                            // activeClassName={styles.Active}
                            title="Return to home page"
                            to="/"
                        >
                            <div className='d-flex align-items-center'>
                                <i className="fa-solid fa-house"></i>
                            </div>
                        </NavLink>
                    </div>


                </div>
                <div className={styles.LinkSection}>
                    <span
                        aria-label="theme-toggle-button"
                        className="d-flex align-items-center mr-3"
                        onClick={handleThemeToggle}
                        title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
                    >
                        {theme === 'light' ? (
                            <i className="fa-solid fa-moon"></i>
                        ) : (
                            <i className="fa-solid fa-sun"></i>
                        )}
                    </span>


                    {currentUser ? loggedInIcons : loggedOutIcons}

                    {profile && (
                        <div className="mx-3">
                            <ReactCountryFlag
                                className="emojiFlag"
                                countryCode={profile.country}
                                svg
                                style={{
                                    fontSize: '2em',
                                    lineHeight: '2em',
                                }}
                                aria-label={profile.country}
                            ></ReactCountryFlag>
                        </div>
                    )}
                </div>


            </div>

        </>


    )
}

export default NavBar