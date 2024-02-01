import React, { useEffect, useRef, useState } from 'react'
import { AnagramPuzzle } from '../../components/AnagramPuzzle';
import { fisherYatesShuffle } from '../../utils/utils';
import styles from '../../styles/anagram/AnagramSeries.module.css'
import { CountdownTimer } from '../../components/CountdownTimer';
import { Row } from 'react-bootstrap';
import { axiosReq } from '../../api/axiosDefaults';

const AnagramSeries = () => {

    const [timerInitialValue, setTimerInitialValue] = useState(10);
    const [timerRunning, setTimerRunning] = useState(false);

    const [loaded, setLoaded] = useState(false);
    const [words, setWords] = useState([]);
    const [shuffledWords, setShuffledWords] = useState([]);
    const [letterOrders, setLetterOrders] = useState([]);

    const puzzleViewerRef = useRef(null);
    const [currentAnagramIndex, setCurrentAnagramIndex] = useState(0);

    useEffect(() => {
        const handleMount = async () => {
            try {
                const { data } = await axiosReq.get('/get_random_anagram/')
                const array = data.anagrams.map(anagram => anagram.word);
                const shuffled = array.map(word => {
                    return fisherYatesShuffle(word.slice().split('')).join('');
                });
                setWords(array);
                setShuffledWords(shuffled);
                setLoaded(true)
                const letOrds = array.map(word => word.split('').map((_, i) => i));
                setLetterOrders(letOrds);
                setTimeout(() => setTimerRunning(true), 2000);
            } catch (err) {
                console.log(err);
            }
        } 
        handleMount();
    }, []);

    const onTimeUp = () => {
        // Calculate the correct positions of the letters.
        const idx = currentAnagramIndex;
        const wordArray = words[idx].split('');
        const shuffledArray = shuffledWords[idx].split('');
        const copy = [...shuffledArray]
        const orderArray = [];
        for (let i = 0; i < copy.length; i++) {
            let position = copy.indexOf(wordArray[i]);
            orderArray.push(position);
            copy[position] = '#';
        }
        const newOrders = letterOrders.map(arr => arr.slice());
        newOrders[idx] = orderArray;
        setLetterOrders(newOrders);
    }

    const outOfTime = false;
    const puzzles = words.map((word, index) => {
        const correctLetters = word.split('');
        const currentLetters = shuffledWords[index].split('');
        const fixedLetters = new Array(word.length).fill(false);
        return (
            <AnagramPuzzle
                key={index}
                index={index}
                currentSelectedIndex={currentAnagramIndex}
                letters={currentLetters}
                parentLetterOrder={letterOrders[currentAnagramIndex]}
                correctLetters={correctLetters}
                fixedLetters={fixedLetters}
                outOfTime={outOfTime}
                onCorrectOrder={() => onCorrectOrder(index)}
            />
        )
    })

    const onCorrectOrder = () => {
        const nextIndex = currentAnagramIndex + 1;
        setTimerRunning(false);
        setTimeout(() => {
            setCurrentAnagramIndex(prev => prev + 1);
            setTimerInitialValue(10 + nextIndex * 5);
        }, 1500)
        setTimeout(() => {
            setTimerRunning(true);
        }, 2000);
        
    }

    return loaded && (
        <div className={styles.Container}>
            <Row className="d-flex justify-content-center mt-5">
                <CountdownTimer
                    initialTime={timerInitialValue}
                    running={timerRunning}
                    onTimeUp={onTimeUp}
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