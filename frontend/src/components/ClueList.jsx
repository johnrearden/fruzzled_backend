import { Row, Col } from "react-bootstrap";
import styles from '../styles/crossword/ClueList.module.css';

export const ClueList = (props) => {

    const cluesAcross = [];
    const cluesDown = [];

    props.clues.forEach((item, index) => {
        const listItem = (
            <li key={index}>
                <Row onClick={() => props.onClueClick(index)}>
                    <Col xs='1' className=''>
                        <span>{item.clue_number}</span>
                    </Col>
                    <Col>
                        <span className={styles.clue_text}>
                            {item.clue}&nbsp;{item.word_lengths}
                        </span>
                    </Col>
                </Row>


            </li>
        );
        if (item.orientation === 'AC') {
            cluesAcross.push(listItem);
        } else {
            cluesDown.push(listItem);
        }
    });

    return (
        <>
            <Col xs={12} md={6} className='border'>
                <h3 className='text-center'>Across</h3>
                <ul className={styles.clue_list}>
                    {cluesAcross}
                </ul>
            </Col>
            <Col xs={12} md={6} className='border'>
                <h3 className='text-center'>Down</h3>
                <ul className={styles.clue_list}>
                    {cluesDown}
                </ul>
            </Col>
        </>
    )
}