import { Container, Row, Col } from 'react-bootstrap';
import styles from '../styles/Keyboard.module.css';
import { useEffect, useState } from 'react';

export const Keyboard = (props) => {
    const topRowKeys = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
    const middleRowKeys = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
    const bottomRowKeys = ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '\u21B5'];

    const [indicatorStyle, setIndicatorStyle] = useState({
        opacity: 0,
    });

    useEffect(() => {
        setIndicatorStyle({
            transition: 'none',
            opacity: 1,
            
        })
        setTimeout(() => {
            setIndicatorStyle({
                transition: 'all .5s',
                opacity: 0,
                
            })
        }, 300);
    }, [props.indicatorLetter, props.keyboardTripswitch])


    const topRow = topRowKeys.map((key) => {
        const charCode = key.charCodeAt(0);
        return (
            <span
                key={key}
                className={[styles.virtual_key, 'text-center'].join(" ")}
                onClick={() => props.clickHandler(charCode)}
            >
                {key}
            </span>
        )
    });

    const middleRow = middleRowKeys.map((key) => {
        const charCode = key.charCodeAt(0);
        return (
            <span
                key={key}
                className={[styles.virtual_key, 'text-center'].join(" ")}
                onClick={() => props.clickHandler(charCode)}
            >
                {key}
            </span>
        )
    });

    const bottomRow = bottomRowKeys.map((key) => {
        const charCode = key === '\u21B5' ? 8 : key.charCodeAt(0);
        return (
            <span
                key={key}
                className={[styles.virtual_key, 'text-center'].join(" ")}
                onClick={() => props.clickHandler(charCode)}
            >
                {key}
            </span>
        )
    });

    return (
        <div className={styles.virtual_keyboard}>
            <Row>
                <Col className={styles.clue_string}>
                    {props.clueString}
                </Col>
            </Row>
            <Row>
                <Col className="d-flex justify-content-center">{topRow}</Col>
            </Row>
            <Row>
                <Col className="d-flex justify-content-center">{middleRow}</Col>
            </Row>
            <Row>
                <Col className="d-flex justify-content-center">{bottomRow}</Col>
            </Row>
            <span 
                className={styles.indicator_letter}
                style={indicatorStyle}>
                    {props.indicatorLetter}
                </span>
        </div>
    )
}