import React, { useEffect, useState } from 'react'
import { AnagramPuzzle } from '../../components/AnagramPuzzle';

const AnagramSeries = () => {

    const currentLetters = ['d', 'w', 'w', 'i', 'o', 'n'];
    const correctLetters = ['w', 'i', 'n', 'd', 'o', 'w'];
    const letterOrder = [0, 1, 2, 3, 4, 5]
    const fixedLetters = [false, false, false, false, false, false];
    const outOfTime = false;
    const completed = false;

    const onCorrectOrder = () => {
        console.log('onCorrectOrder invoked');
    }

    return (
        <div className="mt-5">
            <AnagramPuzzle
                letters={currentLetters}
                parentLetterOrder={letterOrder}
                correctLetters={correctLetters}
                fixedLetters={fixedLetters}
                outOfTime={outOfTime}
                completed={completed}
                onCorrectOrder={() => onCorrectOrder()}
            />
        </div>
    )
}

export default AnagramSeries