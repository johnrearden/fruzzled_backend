import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { axiosReq } from '../../api/axiosDefaults';
import { Col, Row, Table } from 'react-bootstrap';
import styles from '../../styles/Leaderboard.module.css';
import ReactCountryFlag from 'react-country-flag';
import { millisToTimeString } from '../../utils/utils';
import SEO from '../../components/SEO';
import btnStyles from '../../styles/Button.module.css';


const CrosswordLeaderboard = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleMount = async () => {
            try {
                const { data } = await axiosReq.get(`/crossword_builder/get_leaderboard/${id}/`);
                setData(data);
                setLoading(false);
            } catch (err) {
                console.log(err);
                setError('Could not load leaderboard');
                setLoading(false);
            }
        }
        handleMount();
    }, [id])

    if (loading) {
        return (
            <Row className="d-flex justify-content-center mt-5">
                <p>Loading leaderboard...</p>
            </Row>
        );
    }

    if (error) {
        return (
            <Row className="d-flex justify-content-center mt-5">
                <p>{error}</p>
            </Row>
        );
    }

    const tableRows = data && data.top_n.map((instance, index) => (
        <tr
            key={index}
            className={data.ranking === index ? styles.UserRanking : styles.RankingRow}>
            <td>{index + 1}</td>
            <td>{instance.owner_nickname}</td>
            <td>{millisToTimeString(instance.duration)}</td>
            <td>{Math.round(instance.percent_correct)}%</td>
            <td>
                <ReactCountryFlag
                    className="emojiFlag"
                    countryCode={instance.owner_country}
                    svg
                    style={{
                        fontSize: '1.5em',
                        lineHeight: '1.5em',
                    }}
                    aria-label="Country flag"
                />
            </td>
        </tr>
    ));

    if (data && data.ranking > data.top_n.length + 1) {
        tableRows.push((
            <tr
                key={tableRows.length + 1}
                className={styles.RankingRow}>
                <td>...</td>
                <td>............</td>
                <td>............</td>
                <td>...</td>
                <td>......</td>
            </tr>
        ))
    }

    if (data && data.ranking > data.top_n.length) {
        tableRows.push((
            <tr
                key={tableRows.length + 2}
                className={styles.UserRanking}>
                <td>{data.ranking}</td>
                <td>{data.puzzle_instance.owner_nickname}</td>
                <td>{millisToTimeString(data.puzzle_instance.duration)}</td>
                <td>{Math.round(data.puzzle_instance.percent_correct)}%</td>
                <td>
                    <ReactCountryFlag
                        className="emojiFlag"
                        countryCode={data.puzzle_instance.owner_country}
                        svg
                        style={{
                            fontSize: '1.5em',
                            lineHeight: '1.5em',
                        }}
                        aria-label="Country flag"
                    />
                </td>
            </tr>
        ))
    }

    return (
        <>
            <SEO
                title="Crossword Leaderboard"
                description="See how your crossword times compare with players from around the world. Compete for the top spot on the Fruzzled crossword leaderboard!"
                path={`/crossword/leaderboard/${id}`}
                breadcrumbs={[
                    { name: 'Home', url: 'https://fruzzled.ie' },
                    { name: 'Crossword', url: 'https://fruzzled.ie/crossword' },
                    { name: 'Leaderboard', url: `https://fruzzled.ie/crossword/leaderboard/${id}` }
                ]}
            />
            <Row className="d-flex justify-content-center mt-3">
                <h4 data-cy="leaderboard_heading">Crossword Leaderboard</h4>
            </Row>
            {data && (
                <Row className="d-flex justify-content-center mt-2">
                    <h6>Crossword #{data.puzzle_instance.crossword_puzzle}</h6>
                </Row>
            )}

            <Row className="d-flex justify-content-center mt-2">
                <Col md={10}>
                    <Table borderless size="sm" className="text-center">
                        <thead>
                            <tr className={styles.RankingHeader}>
                                <td>Rank</td>
                                <td>Player</td>
                                <td>Time</td>
                                <td>Accuracy</td>
                                <td>Country</td>
                            </tr>
                        </thead>
                        <tbody>
                            {tableRows}
                        </tbody>
                    </Table>
                </Col>
            </Row>

            <Row className="d-flex justify-content-center mt-4">
                <button
                    className={`${btnStyles.Button} mx-2`}
                    onClick={() => navigate('/crossword')}
                >
                    Play Another Crossword
                </button>
                <button
                    className={`${btnStyles.Button} mx-2`}
                    onClick={() => navigate('/')}
                >
                    Home
                </button>
            </Row>
        </>
    )
}

export default CrosswordLeaderboard
