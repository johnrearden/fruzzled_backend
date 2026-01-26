import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import styles from '../../styles/Home.module.css';
import btnStyles from '../../styles/Button.module.css';
import { Row } from 'react-bootstrap';
import { SiteLogo } from '../../components/SiteLogo';
import { UsageReport } from '../../components/UsageReport';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import { useProfile } from '../../contexts/ProfileContext';
import { axiosReq } from '../../api/axiosDefaults';
import SEO from '../../components/SEO';

const Home = () => {

    const mainLogoText = ['f', 'r', 'u', 'z', 'z', 'l', 'e', 'd'];

    const navigate = useNavigate();

    const currentUser = useCurrentUser();
    const profile = useProfile();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await axiosReq.get('/player_stats/');
                setStats(data);
            } catch (err) {
                // Silently fail - user may not have a profile
            }
        };

        if (profile) {
            fetchStats();
        }
    }, [profile]);

    return (
        <>
            <SEO
                title="Free Online Sudoku & Crossword Puzzles"
                description="Play free sudoku and crossword puzzles online at Fruzzled. Challenge yourself with puzzles ranging from easy to expert difficulty. Track your times and compete on leaderboards!"
                path="/"
            />
            <Row className="mt-5 pt-5 d-flex justify-content-center">
                <SiteLogo
                    mainText={mainLogoText}
                />
            </Row>

            <h5 className={`${styles.fadeIn} text-center mt-5`}>Choose a Puzzle!</h5>

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

            {stats && (
                <div className={`${styles.fadeIn} ${styles.StatsSection}`}>
                    <div className={styles.StatsRow}>
                        <div className={styles.StatItem}>
                            <span className={styles.StatNumber}>{stats.profile.current_streak}</span>
                            <span className={styles.StatLabel}>Current Streak</span>
                        </div>
                        <div className={styles.StatItem}>
                            <span className={styles.StatNumber}>{stats.profile.longest_streak}</span>
                            <span className={styles.StatLabel}>Longest Streak</span>
                        </div>
                        <div className={styles.StatItem}>
                            <span className={styles.StatNumber}>{stats.total_puzzles_completed}</span>
                            <span className={styles.StatLabel}>Puzzles Completed</span>
                        </div>
                    </div>
                    <Row className="justify-content-center mt-3">
                        <NavLink
                            to="/stats"
                            className={styles.StatsLink}
                        >
                            <i className="fa-solid fa-chart-line mr-2"></i>
                            View My Stats
                        </NavLink>
                    </Row>
                </div>
            )}

            {currentUser && (
                <>
                    <Row className="justify-content-center mt-5">
                        <UsageReport/>
                    </Row>
                </>
                
            )}

            
            

        </>
    )
}

export default Home