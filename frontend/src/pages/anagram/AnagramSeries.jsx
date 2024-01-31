import React, { useEffect, useRef, useState } from 'react'
import { AnagramPuzzle } from '../../components/AnagramPuzzle';
import { fisherYatesShuffle } from '../../utils/utils';
import styles from '../../styles/anagram/AnagramSeries.module.css'
import { CountdownTimer } from '../../components/CountdownTimer';
import { Row } from 'react-bootstrap';

const AnagramSeries = () => {

    const [timerInitialValue, setTimerInitialValue] = useState(10);

    const words = ['lock', 'pitch', 'church', 'sinking', 'doorstop',
        'alignment', 'horsepower'];
    const puzzleViewerRef = useRef(null);
    const [currentAnagramIndex, setCurrentAnagramIndex] = useState(0);

    const outOfTime = false;
    const completed = false;
    const puzzles = words.map((word, index) => {
        const correctLetters = word.split('');
        const currentLetters = fisherYatesShuffle(correctLetters.slice());
        const letterOrder = correctLetters.map((_, i) => i);
        const fixedLetters = new Array(word.length).fill(false);
        return (
            <AnagramPuzzle
                key={index}
                index={index}
                currentSelectedIndex={currentAnagramIndex}
                letters={currentLetters}
                parentLetterOrder={letterOrder}
                correctLetters={correctLetters}
                fixedLetters={fixedLetters}
                outOfTime={outOfTime}
                completed={completed}
                onCorrectOrder={() => onCorrectOrder(index)}
            />
        )

    })

    const onCorrectOrder = (index) => {
        console.log('onCorrectOrder invoked on puzzle ', index);
        setCurrentAnagramIndex(prev => prev + 1);
        setTimerInitialValue(10 + currentAnagramIndex * 5);
    }


    return (
        <div className={styles.Container}>
            <Row className="d-flex justify-content-center mt-5">
                <CountdownTimer
                    initialTime={180}
                    running={true}
                    onTimeUp={() => console.log('Times up')}
                />
            </Row>
            <Row className="d-flex justify-content-center mt-5">
                <div
                    className={styles.PuzzleViewer}
                    ref={puzzleViewerRef}
                >
                    {puzzles[currentAnagramIndex]}
                </div>
            </Row>
        </div>
    )
}

export default AnagramSeries