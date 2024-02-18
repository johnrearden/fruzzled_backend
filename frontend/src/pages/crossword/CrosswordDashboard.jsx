import React, { useEffect, useState } from 'react';
import { CrosswordThumbnail } from '../../components/CrosswordThumbnail';
import { axiosReq } from '../../api/axiosDefaults';
import { Col, Container, Row, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export const CrosswordDashboard = () => {
    const [puzzleList, setPuzzleList] = useState([]);
    const [filters, setFilters] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handlePuzzleChange = async () => {
            try {
                const filterStrings = filters.map(filter => {
                    const str = `${filter}=True`;
                    return str;
                })
                const suffix = filterStrings.join('&');
                const url = `/crossword_builder/puzzles/?${suffix}`;
                const { data } = await axiosReq.get(url);
                setPuzzleList(data.results);
                setLoading(false);
            } catch (err) {
                console.log(err);
            }
        }
        handlePuzzleChange();
    }, [filters]);

    const handleFilterChange = values => {
        setLoading(true);
        setFilters(values);
    }

    const sideBar = (
        <ToggleButtonGroup 
            vertical
            type="checkbox"
            value={filters}
            onChange={handleFilterChange}
        >
            <ToggleButton value="complete">Completed</ToggleButton>
            <ToggleButton value="reviewed">Reviewed</ToggleButton>
            <ToggleButton value="released">Released</ToggleButton>
        </ToggleButtonGroup>
    )

    const thumbnails = puzzleList.map((puzzle, index) => (
        <Col
            key={index}
            xs={12} md={6} lg={4}
            className="d-flex justify-content-center mt-3">
            <Link to={`/edit_crossword/${puzzle.id}`}>
                <CrosswordThumbnail puzzle={puzzle} />
            </Link>
        </Col>
    ));

    console.log(filters);

    return (
        <Container>
            <Row className="w-100 d-flex justify-content-center">
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