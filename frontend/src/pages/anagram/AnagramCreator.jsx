import React, { useState } from 'react';
import { axiosReq, axiosRes } from '../../api/axiosDefaults';

const SHORTEST_WORD = 4;
const MAX_ANAGRAMS = 7;

const AnagramCreator = () => {
    const [anagrams, setAnagrams] = useState([
        Array(4).fill('_').join(''),
        Array(5).fill('_').join(''),
        Array(6).fill('_').join(''),
        Array(7).fill('_').join(''),
        Array(8).fill('_').join(''),
    ]);

    const addAnagram = () => {
        setAnagrams(prev => [...prev, '']);
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
        const { data } = await axiosReq.post(url, formData);
        console.log(data);
    }

    const anagramInputs = anagrams.map((anagram, index) => (
        <div key={index}>
            <span>{index + SHORTEST_WORD}</span>
            <input
                type="text"
                name={`anagram_${index}`}
                id={`anagram_${index}`}
                value={anagram}
                onChange={handleChange}
                maxLength={index + 4}
            ></input>
            <button onClick={() => handleWordRequest(index, index + SHORTEST_WORD)}>
                ?
            </button>
        </div>
    ));

    console.log(anagrams);

    return (
        <>
            <form onSubmit={handleSubmit}>
                {anagramInputs}
            </form>
            {anagrams.length < MAX_ANAGRAMS && (
                <button onClick={addAnagram}>+</button>
            )}
            <button onClick={fillAll}>Fill All</button>
            <button onClick={handleSubmit}>Create Anagram Series</button>
        </>
    )
}

export default AnagramCreator;