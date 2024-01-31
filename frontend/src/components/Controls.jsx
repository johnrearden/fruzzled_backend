import { Row, Col } from 'react-bootstrap';
import styles from '../styles/crossword/Controls.module.css';
import { CrosswordTimer } from './CrosswordTimer';


export const Controls = ({ puzzleId, showTimer }) => {

    const timer = showTimer ? (
        <CrosswordTimer
            puzzleId={puzzleId}
            className={styles.medium_font}
        />
    ) : (
        <Col xs='4'></Col>
    )

    return (
        <Row className={`${styles.background} mt-2`}>
            <Col xs='12' className="d-flex justify-content-center align-items-center">
                {timer}
            </Col>
        </Row>
    )
}