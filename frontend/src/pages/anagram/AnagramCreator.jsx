import React, { useState } from 'react';
import { axiosReq, axiosRes } from '../../api/axiosDefaults';
import styles from '../../styles/anagram/AnagramCreator.module.css';
import btnStyles from "../../styles/Button.module.css";
import { Alert } from 'react-bootstrap';

const SHORTEST_WORD = 3;
const MAX_ANAGRAMS = 8;
const MIN_ANAGRAMS = 3;

const AnagramCreator = () => {
    const [anagrams, setAnagrams] = useState([
        Array(3).fill('_').join(''),
        Array(4).fill('_').join(''),
        Array(5).fill('_').join(''),
        Array(6).fill('_').join(''),
        Array(7).fill('_').join(''),
        Array(8).fill('_').join(''),
        Array(9).fill('_').join(''),
        Array(10).fill('_').join(''),
    ]);

    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showFailureAlert, setShowFailureAlert] = useState(false);

    const addAnagram = () => {
        setAnagrams(prev => [...prev, '']);
    }

    const removeAnagram = () => {
        setAnagrams(prev => prev.slice(0, -1));
    }

    const handleChange = (event) => {
        const index = parseInt(event.target.id.split('_')[1]);
        const copy = [...anagrams];
        copy[index] = event.target.value;
        setAnagrams(copy);
    }

    const handleWordRequest = async (index, length) => {
        const queryStr = new Array(length).fill('_').join('');
        console.log(`looking for a word of length ${length}`);
        try {
            const { data } = await axiosRes.get(`/crossword_builder/query/${queryStr}/`);
            const copy = [...anagrams];
            const newWord = getWeightedRandomWord(data.results);
            copy[index] = newWord;
            setAnagrams(copy);
        } catch (err) {
            console.log(err);
        }
    }

    const fillAll = async () => {
        const newArray = [];
        for (let i = 0; i < anagrams.length; i++) {
            const query = Array(i + SHORTEST_WORD).fill('_').join('');
            const { data } = await axiosRes.get(`/crossword_builder/query/${query}/`);
            const word = getWeightedRandomWord(data.results);
            newArray.push(word);
        }
        setAnagrams(newArray);
    }

    const getWeightedRandomWord = (array) => {
        const firstArrLen = Math.floor(array.length * 0.1);
        const secondArrLen = array.length - firstArrLen;
        if (Math.random() < 0.9) {
            const randomIndex = Math.floor(Math.random() * firstArrLen);
            return array[randomIndex];
        } else {
            const randomIndex = firstArrLen + Math.floor(Math.random() * secondArrLen);
            return array[randomIndex];
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        console.log('submitting');
        const url = '/create_anagram_series/';
        const formData = new FormData();
        formData.append('words', anagrams);
        try {
            const { data } = await axiosReq.post(url, formData);
            console.log(data);
            setShowSuccessAlert(true);
            setTimeout(() => setShowSuccessAlert(false), 2000);
        } catch (err) {
            console.log(err);
            setShowFailureAlert(true);
            setTimeout(() => setShowFailureAlert(false), 2000);
        }
    }

    const anagramInputs = anagrams.map((anagram, index) => (
        <div key={index}>
            <span className={styles.WordLength}>{index + SHORTEST_WORD}</span>
            <input
                className={styles.Input}
                type="text"
                name={`anagram_${index}`}
                id={`anagram_${index}`}
                value={anagram}
                onChange={handleChange}
                maxLength={index + 4}
            ></input>
            <button
                className={btnStyles.Button}
                onClick={() => handleWordRequest(index, index + SHORTEST_WORD)}
            >
                ?
            </button>
        </div>
    ));

    return (
        <div className={styles.Outer}>
            <h5 className="text-center">New Anagram Series</h5>
            <form
                onSubmit={handleSubmit}
                className="mt-2"
            >
                {anagramInputs}
            </form>
            <div className="mt-2 text-center">
                <button
                    onClick={addAnagram}
                    disabled={anagrams.length >= MAX_ANAGRAMS}
                    className={`${btnStyles.Button} ${styles.ActionButton}`}
                >+</button>
                <button
                    onClick={removeAnagram}
                    disabled={anagrams.length <= MIN_ANAGRAMS}
                    className={`${btnStyles.Button} ${styles.ActionButton}`}
                >-</button>
                <button
                    onClick={fillAll}
                    className={`${btnStyles.Button} ${styles.ActionButton}`}
                >Fill</button>
            </div>
            <div className="mt-2 text-center">
                <button
                    onClick={handleSubmit}
                    className={`${btnStyles.Button} ${styles.SaveButton}`}
                >Save</button>
            </div>
            <Alert
                show={showSuccessAlert}
                variant="success"
                className="mt-2"
            >New series saved successfully</Alert>
            <Alert
                show={showFailureAlert}
                variant="warning"
                className="mt-2"
            >Couldn't save the new series</Alert>
        </div>
    )
}

export default AnagramCreator;