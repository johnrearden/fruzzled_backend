import React, { createRef, memo, useEffect, useRef, useState } from 'react';
import { CellInput } from './CellInput';
import btnStyles from '../styles/Button.module.css';

export const MobileWordInput = ({
    letters,
    selectedIndex,
    onEdit,
    cellsWidthRatio,
    MAX_DIMENSION,
}) => {

    const [characters, setCharacters] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(selectedIndex);
    let cellRefs = [];

    useEffect(() => {
        setCharacters(letters);
        cellRefs[0].current.select();
        cellRefs[0].current.focus();
    }, [letters]);

    useEffect(() => {
        cellRefs[currentIndex].current.focus();
    }, [currentIndex, characters]);

    const onCellClick = (event) => {

    }

    const onCellKeyup = (index, event) => {
        if (event.key === "Backspace" || event.key === "Delete") {
            let charsCopy = [...characters];
            charsCopy[index] = '#';
            setCharacters(charsCopy);
            if (index > 0) {
                cellRefs[index - 1].current.focus();
                setCurrentIndex(index - 1);
            }
        }
        if (event.key === "Enter") {
            onEdit(characters, true);
        }
    }

    const onCellInput = (index, event) => {
        const charsCopy = [...characters];
        const length = event.target.value?.length;
        let char = event.target.value?.toUpperCase();
        if (length && length > 1) {
            char = char.split('').pop();
        }
        if ((/[a-zA-Z]/).test(char)) {
            charsCopy[index] = char;
            setCharacters(charsCopy);
            onEdit(charsCopy, false);
            if (index < characters.length - 1) {
                cellRefs[index + 1].current.focus();
                setCurrentIndex(index + 1);
            }
        }
    }

    cellRefs = [];

    const cells = letters.map((char, index) => {
        const ref = createRef();
        cellRefs.push(ref);
        return (
            <CellInput
                key={index}
                ref={ref}
                inUse={true}
                index={index}
                letter={characters[index] === '#' ? '' : characters[index]}
                clickHandler={onCellClick}
                keyUpHandler={onCellKeyup}
                inputHandler={onCellInput}
                cellsWidthRatio={cellsWidthRatio}
                maxDimension={MAX_DIMENSION}
                selected={false}
                highlighted={false}
                showCorrectness={false}
                correct={false}
                semantic={true}
            />
        )
    });

    return (
        <div className="d-flex flex-column justify-content-center align-items-center">
            <div>
                {cells} 
            </div>
            
            <div>
                <button 
                    onClick={() => onEdit(characters, true)}
                    className={btnStyles.Button}
                >Done</button>
            </div>
            
        </div>
    )
}
