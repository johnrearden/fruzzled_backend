import React, { useState } from 'react'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { axiosReq } from '../../api/axiosDefaults';
import { Col, Row, Table } from 'react-bootstrap';
import styles from '../../styles/Leaderboard.module.css';
import ChooseDifficulty from './ChooseDifficulty';
import ReactCountryFlag from 'react-country-flag';
import { millisToTimeString } from '../../utils/utils';


const Leaderboard = () => {

    const { id } = useParams();
    const [data, setData] = useState(null);

    useEffect(() => {
        const handleMount = async () => {
            try {
                const { data } = await axiosReq.get(`/get_leaderboard/${id}/`);
                setData(data);
            } catch (err) {
                console.log(err);
            }
        }
        handleMount();
    }, [id])



    const tableRows = data && data.top_n.map((instance, index) => (
        <tr
            key={index}
            className={data.ranking === index ? styles.UserRanking : styles.RankingRow}>
            <td>{index + 1}</td>
            <td>{instance.owner_nickname}</td>
            <td>{millisToTimeString(instance.duration)}</td>
            <td>
                <ReactCountryFlag
                    className="emojiFlag"
                    countryCode={instance.owner_country}
                    svg
                    style={{
                        fontSize: '1.5em',
                        lineHeight: '1.5em',
                    }}
                    aria-label="United States"
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
                <td>
                    <ReactCountryFlag
                        className="emojiFlag"
                        countryCode={data.puzzle_instance.owner_country}
                        svg
                        style={{
                            fontSize: '1.5em',
                            lineHeight: '1.5em',
                        }}
                        aria-label="United States"
                    />
                </td>
            </tr>
        ))
    }

    return (
        <>
            <Row className="d-flex justify-content-center mt-3">
                <h4 data-cy="leaderboard_heading">Leaderboard</h4>
            </Row>
            {data && (
                <Row className="d-flex justify-content-center mt-2">
                    <h6>{data.puzzle_instance.difficulty} Level</h6>
                </Row>
            )}

            <Row className="d-flex justify-content-center mt-2">
                <Col md={8}>
                    <Table borderless size="sm" className="text-center">
                        <thead>
                            <tr className={styles.RankingHeader}>
                                <td>Rank</td>
                                <td>Player</td>
                                <td>Time</td>
                                <td>Country</td>
                            </tr>
                        </thead>
                        <tbody>
                            {tableRows}
                        </tbody>
                    </Table>
                </Col>

            </Row>
            <hr></hr>
            <ChooseDifficulty message="Play again?" fadeIn square/>

        </>
    )
}

export default Leaderboard