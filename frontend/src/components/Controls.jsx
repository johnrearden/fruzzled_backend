import { Row, Col } from 'react-bootstrap';
import styles from '../styles/crossword/Controls.module.css';
import { CrosswordTimer } from './CrosswordTimer';


export const Controls = ({ puzzleId, showTimer, running, callback }) => {

    const timer = showTimer ? (
        <CrosswordTimer
            puzzleId={puzzleId}
            running={running}
        />
    ) : (
        <Col xs='4'></Col>
    )

    return (
        <>
            {timer}
        </>
    )
}