import React, { useEffect, useState } from 'react';
import { CrosswordThumbnail } from '../../components/CrosswordThumbnail';
import { axiosReq } from '../../api/axiosDefaults';
import { Col, Container, Row, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import btnStyles from '../../styles/Button.module.css';
import { Toggle } from '../../components/Toggle';


export const CrosswordDashboard = () => {

    const [puzzleList, setPuzzleList] = useState([]);
    const [filterComplete, setFilterComplete] = useState(false);
    const [filterReviewed, setFilterReviewed] = useState(false);
    const [filterReleased, setFilterReleased] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handlePuzzleChange = async () => {
            try {
                const filters = [];
                if (filterComplete) {
                    filters.push('complete=True');
                }
                if (filterReleased) {
                    filters.push('released=True');
                }
                if (filterReviewed) {
                    filters.push('reviewed=True');
                }
                const suffix = filters.join('&');
                const url = `/crossword_builder/puzzles/?${suffix}`;
                const { data } = await axiosReq.get(url);
                setPuzzleList(data.results);
                setLoading(false);
            } catch (err) {
                console.log(err);
            }
        }
        handlePuzzleChange();
    }, [filterComplete, filterReleased, filterReviewed]);

    const handleCompleteToggle = (val) => {
        setLoading(true);
        setFilterComplete(val);
    }

    const handleReviewedToggle = (val) => {
        setLoading(true);
        setFilterReviewed(val);
    }

    const handleReleasedToggle = (val) => {
        setLoading(true);
        setFilterReleased(val);
    }

    const sideBar = (
        <>
            <Toggle
                initial={filterComplete}
                label="Complete"
                handleChange={(on) => handleCompleteToggle(on)}
            />
            <Toggle
                initial={filterReviewed}
                label="Reviewed"
                handleChange={(on) => handleReviewedToggle(on)}
            />
            <Toggle
                initial={filterReleased}
                label="Released"
                handleChange={(on) => handleReleasedToggle(on)}
            />
        </>

    )

    const thumbnails = puzzleList.map((puzzle, index) => (
        <Col
            key={index}
            xs={12} md={6} lg={4}
            className="d-flex justify-content-center mt-3"
        >
            <CrosswordThumbnail puzzle={puzzle} />

        </Col>
    ));

    return (
        <Container>
            <Row className="d-flex justify-content-center">
                <Link to={'/create_crossword'}>
                    <button className={btnStyles.Button}>
                        New Crossword
                    </button>
                </Link>
            </Row>
            <Row className="d-flex justify-content-center mt-3">
                <Col xs={'auto'}>
                    {sideBar}
                </Col>
                <Col className="d-flex justify-content-center">
                    <Row className="d-flex justify-content-center w-100">
                        {!loading && thumbnails}
                    </Row>
                </Col>
            </Row>
        </Container>

    )
}