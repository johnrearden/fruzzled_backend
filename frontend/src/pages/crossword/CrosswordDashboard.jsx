import React, { useEffect, useState } from 'react';
import { CrosswordThumbnail } from '../../components/CrosswordThumbnail';
import { axiosReq } from '../../api/axiosDefaults';
import { Col, Container, Row, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import btnStyles from '../../styles/Button.module.css';
import { Toggle } from '../../components/Toggle';


export const CrosswordDashboard = () => {

    const [puzzleList, setPuzzleList] = useState([]);

    const [count, setCount] = useState(0);
    const [totalResults, setTotalResults] = useState(0);
    const [completeCount, setCompleteCount] = useState(0);
    const [reviewedCount, setReviewedCount] = useState(0);
    const [releasedCount, setReleasedCount] = useState(0);

    const [filterComplete, setFilterComplete] = useState(false);
    const [filterReviewed, setFilterReviewed] = useState(false);
    const [filterReleased, setFilterReleased] = useState(false);

    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handlePuzzleChange = async () => {
            try {
                const filters = [];
                if (filterComplete) {
                    filters.push('complete=True');
                } else {
                    filters.push('complete=False');
                }
                if (filterReleased) {
                    filters.push('released=True');
                } else {
                    filters.push('released=False');
                }
                if (filterReviewed) {
                    filters.push('reviewed=True');
                } else {
                    filters.push('reviewed=False');
                }
                filters.push(`page=${page}`)
                const suffix = filters.join('&');
                const url = `/crossword_builder/puzzles/?${suffix}`;
                const { data } = await axiosReq.get(url);
                setPuzzleList(data.results);
                setCount(data.total_count);
                setTotalResults(data.count);
                setCompleteCount(data.total_complete);
                setReviewedCount(data.total_reviewed);
                setReleasedCount(data.total_released);
                setHasNext(!!data.next);
                setHasPrevious(!!data.previous);
                setLoading(false);
                console.log(data);
            } catch (err) {
                console.log(err);
            }
        }
        handlePuzzleChange();
    }, [filterComplete, filterReleased, filterReviewed, page]);

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

    const handlePreviousClick = () => {
        if (hasPrevious) {
            setPage(prevPage => prevPage - 1);
        }
    }

    const handleNextClick = () => {
        if (hasNext) {
            setPage(prevPage => prevPage + 1);
        }
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
            <div className="mt-4">
                <h5>Count : {count}</h5>
            </div>
            <div className="mt-2">
                <h6>Complete : {completeCount}</h6>
            </div>
            <div>
                <h6>Reviewed :  {reviewedCount}</h6>
            </div>
            <div>
                <h6>Released : {releasedCount}</h6>
            </div>
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
            <Row className="d-flex justify-content-center align-items-center mt-3">
                <button 
                    className={`${btnStyles.Button} mr-3`}
                    onClick={handlePreviousClick}
                    disabled={!hasPrevious}
                >
                    <i className="fa-solid fa-angles-left"></i> Previous
                </button>
                <span>Page {page} of {Math.ceil(totalResults / 6)}</span>
                <button 
                    className={`${btnStyles.Button} ml-3`}
                    onClick={handleNextClick}
                    disabled={!hasNext}
                >
                    Next <i className="fa-solid fa-angles-right"></i>
                </button>
            </Row>
        </Container>

    )
}