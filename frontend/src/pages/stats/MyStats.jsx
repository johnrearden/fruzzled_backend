import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { axiosReq } from '../../api/axiosDefaults';
import { useProfile } from '../../contexts/ProfileContext';
import { useNavigate } from 'react-router-dom';
import SEO from '../../components/SEO';
import styles from '../../styles/MyStats.module.css';
import ReactCountryFlag from 'react-country-flag';

const MyStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const profile = useProfile();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await axiosReq.get('/player_stats/');
                setStats(data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Unable to load stats. Please make sure you have a profile.');
                setLoading(false);
            }
        };

        if (profile) {
            fetchStats();
        } else {
            setLoading(false);
            setError('Please create a profile to view your stats.');
        }
    }, [profile]);

    const formatTime = (ms) => {
        if (!ms) return '-';
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        if (minutes > 0) {
            return `${minutes}m ${remainingSeconds}s`;
        }
        return `${seconds}s`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <p>Loading stats...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="text-center mt-5">
                <p>{error}</p>
                <button
                    className={styles.Button}
                    onClick={() => navigate('/')}
                >
                    Go Home
                </button>
            </Container>
        );
    }

    return (
        <Container className={styles.StatsContainer}>
            <SEO
                title="My Stats"
                description="View your personal puzzle statistics including games completed, streaks, and best times."
                path="/stats"
            />

            {/* Profile Header */}
            <Row className="justify-content-center mb-4">
                <Col xs={12} md={8} lg={6}>
                    <Card className={styles.ProfileCard}>
                        <Card.Body className="text-center">
                            <div className={styles.ProfileHeader}>
                                <ReactCountryFlag
                                    countryCode={stats.profile.country}
                                    svg
                                    style={{ fontSize: '2em', marginRight: '0.5rem' }}
                                />
                                <h2>{stats.profile.nickname}</h2>
                            </div>
                            <div className={styles.StreakSection}>
                                <div className={styles.StreakItem}>
                                    <span className={styles.StreakNumber}>{stats.profile.current_streak}</span>
                                    <span className={styles.StreakLabel}>Current Streak</span>
                                </div>
                                <div className={styles.StreakItem}>
                                    <span className={styles.StreakNumber}>{stats.profile.longest_streak}</span>
                                    <span className={styles.StreakLabel}>Longest Streak</span>
                                </div>
                                <div className={styles.StreakItem}>
                                    <span className={styles.StreakNumber}>{stats.total_puzzles_completed}</span>
                                    <span className={styles.StreakLabel}>Total Puzzles</span>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Sudoku Stats */}
            <Row className="justify-content-center mb-4">
                <Col xs={12} md={8} lg={6}>
                    <Card className={styles.StatsCard}>
                        <Card.Header className={styles.CardHeader}>
                            <i className="fa-solid fa-table-cells mr-2"></i>
                            Sudoku
                        </Card.Header>
                        <Card.Body>
                            <p className="text-center mb-3">
                                <strong>{stats.sudoku.total_completed}</strong> puzzles completed
                            </p>
                            {stats.sudoku.by_difficulty.length > 0 ? (
                                <div className={styles.DifficultyGrid}>
                                    {stats.sudoku.by_difficulty.map((item, index) => (
                                        <div key={index} className={styles.DifficultyItem}>
                                            <span className={styles.DifficultyName}>{item.difficulty}</span>
                                            <span className={styles.DifficultyCount}>{item.count} completed</span>
                                            <span className={styles.DifficultyTime}>
                                                Best: {formatTime(item.best_time_ms)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted">No sudoku puzzles completed yet.</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Crossword Stats */}
            <Row className="justify-content-center mb-4">
                <Col xs={12} md={8} lg={6}>
                    <Card className={styles.StatsCard}>
                        <Card.Header className={styles.CardHeader}>
                            <i className="fa-solid fa-font mr-2"></i>
                            Crossword
                        </Card.Header>
                        <Card.Body>
                            <p className="text-center mb-3">
                                <strong>{stats.crossword.total_completed}</strong> puzzles completed
                            </p>
                            {stats.crossword.total_completed > 0 ? (
                                <div className={styles.CrosswordStats}>
                                    <div className={styles.StatRow}>
                                        <span>Best Time:</span>
                                        <span>{formatTime(stats.crossword.best_time_ms)}</span>
                                    </div>
                                    <div className={styles.StatRow}>
                                        <span>Average Time:</span>
                                        <span>{formatTime(stats.crossword.avg_time_ms)}</span>
                                    </div>
                                    <div className={styles.StatRow}>
                                        <span>Average Accuracy:</span>
                                        <span>{stats.crossword.avg_accuracy}%</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-muted">No crossword puzzles completed yet.</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Recent Activity */}
            <Row className="justify-content-center mb-4">
                <Col xs={12} md={8} lg={6}>
                    <Card className={styles.StatsCard}>
                        <Card.Header className={styles.CardHeader}>
                            <i className="fa-solid fa-clock-rotate-left mr-2"></i>
                            Recent Activity
                        </Card.Header>
                        <Card.Body>
                            {stats.recent_activity.length > 0 ? (
                                <div className={styles.ActivityList}>
                                    {stats.recent_activity.map((activity, index) => (
                                        <div key={index} className={styles.ActivityItem}>
                                            <span className={styles.ActivityType}>
                                                {activity.type === 'sudoku' ? (
                                                    <i className="fa-solid fa-table-cells mr-3"></i>
                                                ) : (
                                                    <i className="fa-solid fa-font mr-3"></i>
                                                )}
                                                {activity.type === 'sudoku' ? activity.difficulty : 'Crossword'}
                                            </span>
                                            <span className={styles.ActivityTime}>
                                                {formatTime(activity.time_ms)}
                                            </span>
                                            <span className={styles.ActivityDate}>
                                                {formatDate(activity.completed_at)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted">No recent activity.</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default MyStats;
