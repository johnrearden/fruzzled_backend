import { Keyboard } from '../../components/Keyboard';
import { ClueList } from '../../components/ClueList';
import { Cell } from '../../components/Cell';
import { replaceCharAt } from '../../utils/utils';
import { GRID_CONTENTS_LS_KEY, OPEN_CELL, CLOSED_CELL, PUZZLE_ID_LS_KEY } from '../../constants/constants.js';
import styles from '../../styles/crossword/Grid.module.css';
import btnStyles from '../../styles/Button.module.css'
import { useEffect, useState, useCallback, useRef } from 'react';
import { Row, Col, Modal } from 'react-bootstrap';
import { Grid } from '../../../../crosswords/static/js/crossword_grid.js';
import { axiosRes } from '../../api/axiosDefaults.js';
import axios from 'axios';
import { CompletenessDisplay } from '../../components/CompletenessDisplay.jsx';

const MAX_DIMENSION = 25;

export const CrosswordEditor = ({ data }) => {

    const [currentCell, setCurrentCell] = useState(0);
    const [currentClue, setCurrentClue] = useState(0);
    const [indicatorLetter, setIndicatorLetter] = useState('');
    const [onMobile, setOnMobile] = useState(false);
    const [isEditingGrid, setIsEditingGrid] = useState(false);
    const [clues, setClues] = useState([]);

    const [showCandidatesModal, setShowCandidatesModal] = useState(false);
    const [candidates, setCandidates] = useState([]);

    const [showCluesModal, setShowCluesModal] = useState(false);
    const [dbDefinitions, setDBDefinitions] = useState([]);
    const [apiDefinitions, setAPIDefinitions] = useState([]);

    // A reference to the internal Grid state object.
    const gridRef = useRef(null);

    // Create and index the clues on load.
    useEffect(() => {
        const gridAsJSON = {
            cells: data.puzzle.grid.cells,
            width: data.puzzle.grid.width,
            height: data.puzzle.grid.height
        }
        gridRef.current = new Grid(gridAsJSON, []);
        setClues(gridRef.current.clues);

        // Populate the cellReferences array
        populateCellReferences();

        // Populate the clueReferences array
        populateClueReferences();
        
    }, [data])

    const populateCellReferences = () => {
        const array = new Array(gridRef.current.clues.length);
        const width = gridRef.current.width;
        
        for (let i = 0; i < array.length; i++) {
            array[i] = new Array();
            const clue = gridRef.current.clues[i];
            for (let j = 0; j < clue.cellList.length; j++) {
                let cellIndex;
                if (clue.orientation === 'AC') {
                    cellIndex = clue.startCol + j + (clue.startRow * width);
                } else {
                    cellIndex = clue.startCol + ((j + clue.startRow) * width);
                }
                array[i].push(cellIndex);
            }
        }
        setCellReferences(array);
    }

    const populateClueReferences = () => {
        const width = gridRef.current.width;
        const height = gridRef.current.height;
        const length = width * height;
        const array = new Array(length);
        for (let i = 0; i < array.length; i++) {
            array[i] = new Array();
        }
        gridRef.current.clues.forEach((clue, number) => {
            for (let i = 0; i < clue.cellList.length; i++) {
                const startCol = parseInt(clue.startCol);
                const startRow = parseInt(clue.startRow);
                let index = 0;
                if (clue.orientation === 'AC') {
                    index = startCol + i + (startRow * width);
                    // Ensure AC clues are always first in intersection cells for consistent clicking
                    array[index].unshift(number);
                } else {
                    index = startCol + ((i + startRow) * width);
                    array[index].push(number);
                }
            }
        });
        setClueReferences(array);
    }


    // This flag is toggled each time a key is pressed, otherwise repeated presses of the 
    // same key would not result in an rerender of the Keyboard as the indicator letter 
    // would remain unchanged
    const [keyboardTripswitch, setKeyboardTripswitch] = useState(false);

    /**
     * The current state of the crossword grid. Checks localStorage for existing content
     * on page load. The setState initialization is embedded in a useEffect hook to prevent
     * the server trying to access the window object during SSR.
     */
    const [gridContents, setGridContents] = useState(data.puzzle.grid.cells);

    /**
     * An array, with an element for each clue, which stores a list of the cells
     * occupied by that clue on the grid. 
     * 
     * Allows a clue to know which cells it
     * contains.
     */
    const [cellReferences, setCellReferences] = useState([]);

    /**
     * An array, with an element for each cell, which stores a list of the 
     * clues that appear in that cell. 
     * 
     * Allows a cell to know which clue(s) it affects.
     */
    const [clueReferences, setClueReferences] = useState([]);

    /**
     * Handles events generated by user clicking on individual cells.
     * @param {Integer} cellIndex 
     */
    const onCellClick = (cellIndex, event) => {

        // Handle case where user is toggling cell open or closed
        if (isEditingGrid || event.ctrlKey) {
            const currentChar = gridContents.charAt(cellIndex);
            const newChar = currentChar === "#" ? "-" : "#";
            let copy = gridContents.slice();
            copy = replaceCharAt(copy, cellIndex, newChar);
            setGridContents(copy);
            const isOpen = gridRef.current.cells[cellIndex].isOpen;
            gridRef.current.cells[cellIndex].isOpen = !isOpen;
            gridRef.current.reindex();
            setClues(gridRef.current.clues);
            populateCellReferences();
            populateClueReferences();
            return;
        }

        setCurrentCell(cellIndex);
        let result = clueReferences[cellIndex].indexOf(currentClue)
        if (result !== -1) {
            // Alternate the clues selected if 2 are present
            result += 1;
            const orthogonalClueIndex = result >= clueReferences[cellIndex].length ? 0 : result;
            setCurrentClue(clueReferences[cellIndex][orthogonalClueIndex]);
        } else {
            const clue = gridRef.current.clues[clueReferences[cellIndex][0]];
            if (clue.orientation === "AC" && clueReferences[cellIndex].length > 1) {

                // Check if the AC clue (if both are present) is filled. There's no point 
                // in defaulting to selecting the AC clue if it is - bad UX.
                let clueAlreadyFilled = true;
                for (let x = clue.startCol; x < clue.startCol + clue.cellList.length; x++) {
                    const index = x + clue.startRow * gridRef.current.width;
                    if (gridContents[index] === '#') {
                        clueAlreadyFilled = false
                    }
                }
                if (clueAlreadyFilled) {
                    setCurrentClue(clueReferences[cellIndex][1]);
                } else {
                    setCurrentClue(clueReferences[cellIndex][0]);
                }
            } else {
                setCurrentClue(clueReferences[cellIndex][0]);
            }
        };
    }

    /**
     * Handles clicks on clues in child component ClueList.
     * 
     * @param {Integer} clueNumber 
     */
    const onClueClick = (clueId) => {

        let clue;
        let clueIndex;
        for (let i = 0; i < clues.length; i++) {
            if (clues[i].id === clueId) {
                clue = clues[i];
                clueIndex = i;
            }
        }
        const startCol = clue.start_col;
        const startRow = clue.start_row;
        const cellIndex = startCol + startRow * gridRef.current.width;
        setCurrentCell(cellIndex);
        setCurrentClue(clueIndex);
        window.scrollTo(0, 0);
    }


    /**
     * Handles events generated by Keyboard component (user clicking on keys). See 
     * https://react.dev/learn/updating-arrays-in-state#adding-to-an-array for obscure
     * method of mutating state array using map function in React.
     * @param {Integer} keyCode 
     */
    const handleKeyPress = useCallback((keyCode) => {

        if (currentClue == null) return;

        setKeyboardTripswitch(prev => !prev);

        /**
         * Saves the new gridContents string to localStorage, and calls setGridContents
         * to trigger a rerender.
         * 
         * @param {String} newGridContents 
         */
        const updateGridContents = (newGridContents) => {
            window.localStorage.setItem(GRID_CONTENTS_LS_KEY, gridContents);
            window.localStorage.setItem(PUZZLE_ID_LS_KEY, data.puzzle.id);
            setGridContents(newGridContents);
        }


        const advanceCurrentCell = () => {
            const index = cellReferences[currentClue].indexOf(currentCell);
            if (index < cellReferences[currentClue].length - 1) {
                setCurrentCell(cellReferences[currentClue][index + 1]);
            }
        }

        const retreatCurrentCell = () => {
            const index = cellReferences[currentClue].indexOf(currentCell);
            if (index > 0) {
                setCurrentCell(cellReferences[currentClue][index - 1]);
            }
        }

        const currentCellIsLastInClue = () => {
            const index = clueReferences[currentClue].indexOf(currentCell);
            return index === cellReferences[currentClue].length - 1;
        }

        const keyIsLetter = keyCode >= 65 && keyCode <= 90;
        const keyIsSpace = keyCode === 32;
        const keyIsBackspace = keyCode === 8;

        if (keyIsLetter || keyIsSpace) {
            const character = String.fromCharCode(keyCode);
            const newGridContents = replaceCharAt(gridContents, currentCell, character);
            updateGridContents(newGridContents);
            advanceCurrentCell();
            setIndicatorLetter(character);
        } else if (keyIsBackspace) {
            // Case 1 - if the cell is the last in the clue, then its
            // value should be deleted and then the cell pointer moved back.
            if (currentCellIsLastInClue()) {
                const newGridContents = replaceCharAt(gridContents, currentCell, OPEN_CELL);
                updateGridContents(newGridContents);
                retreatCurrentCell();
            } else {
                // Case 2 - the cell pointer should be moved back and then the value deleted.
                retreatCurrentCell();
                const newGridContents = replaceCharAt(gridContents, currentCell, OPEN_CELL);
                updateGridContents(newGridContents);
            }
        }
    }, [cellReferences, clueReferences, currentCell, currentClue, data.puzzle.id, gridContents]);

    /**
     * Add key listener to window on page load, and remove it when page is 
     * closed
     */
    useEffect(() => {
        if (onMobile) {
            return;
        }
        const handleTyping = (event) => {
            handleKeyPress(event.keyCode);
        }
        window.addEventListener('keyup', handleTyping);
        return () => window.removeEventListener('keyup', handleTyping);
    }, [onMobile, handleKeyPress]);

    const getPotentials = async () => {
        const clueCells = gridRef.current.clues[currentClue].cellList;
        const queryArray = [];
        for (let cell of clueCells) {
            const index = cell.index;
            const gridChar = gridContents.charAt(index);
            const isEmpty = gridChar === "#" || gridChar === " ";
            const queryChar = isEmpty ? "_" : gridChar;
            queryArray.push(queryChar);
        }
        const query = queryArray.join('');
        try {
            const url = `/crossword_builder/query/${query}/`;
            const { data } = await axiosRes.get(url);
            setCandidates(data.results);
            setShowCandidatesModal(true);
        } catch (err) {
            console.log(err);
        }
    }

    const getDefinitions = async () => {
        const clueCells = gridRef.current.clues[currentClue].cellList;
        const queryArray = [];
        for (let cell of clueCells) {
            const index = cell.index;
            const gridChar = gridContents.charAt(index);
            const isEmpty = gridChar === "#" || gridChar === " ";
            const queryChar = isEmpty ? "_" : gridChar;
            queryArray.push(queryChar);
        }
        const query = queryArray.join('');
        try {
            const url = `/crossword_builder/get_definition/${query}/`;
            const { data } = await axiosRes.get(url);
            setDBDefinitions(data.results);

            const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${query}`;
            const response = await fetch(apiUrl);
            const obj = await response.json();
            if (!Object.hasOwn(obj, 'title')) {
                const array = [];
                for (let word of obj) {
                    for (let meaning of word.meanings) {
                        for (let def of meaning.definitions) {
                            array.push(def.definition);
                        }
                    }
                }
                setAPIDefinitions(array);
            } else {
                setAPIDefinitions([]);
            }
            setShowCluesModal(true);
        } catch (err) {
            console.log(err);
        }
    }

    const handleCandidateSelect = (candidate) => {
        // Update the grid objects clues.
        let gridContentsCopy = gridContents.slice();
        const clue = clues[currentClue];
        clue.cellList.map((cell, index) => {
            const newChar = candidate.charAt(index);
            cell.value = newChar;
            gridContentsCopy = replaceCharAt(gridContentsCopy, cell.index, newChar);
        })
        setGridContents(gridContentsCopy);
        setShowCandidatesModal(false);

        // Update the gridContents
    }

    const handleDefinitionSelection = (definition) => {
        gridRef.current.clues[currentClue].clue = definition;
        setClues(gridRef.current.clues);
    }


    // Rendering process begins here
    if (!gridRef.current) {
        return (<span>Loading...</span>);
    }
    const grid = data.puzzle.grid;
    const cellsWidthRatio = 100 / (grid.width + 4);
    const myStyle = {
        display: 'grid',
        gridTemplateRows: `repeat(${grid.height}, clamp(10px, ${cellsWidthRatio}vw, ${MAX_DIMENSION}px))`,
        gridTemplateColumns: `repeat(${grid.width}, clamp(10px, ${cellsWidthRatio}vw, ${MAX_DIMENSION}px))`,
    }
    let closedCellCount = 0;
    let filledCellCount = 0;

    const cells = [...gridContents].map((char, pointer) => {

        const highlighted = clueReferences[pointer].includes(currentClue);
        const selected = pointer === currentCell;

        let letter;
        if (char === CLOSED_CELL) {
            closedCellCount += 1;
        }
        if (char === CLOSED_CELL || char === OPEN_CELL) {
            letter = '';
        } else {
            letter = char;
            filledCellCount += 1;
        }

        // Create an empty list named cells, and then fill it with Cell components
        // based on the gridContents string. The key prop is required by React.


        return (
            <Cell key={`cell-${pointer}`}
                inUse={char !== CLOSED_CELL}
                isEditing={true}
                index={pointer}
                letter={letter}
                clickHandler={onCellClick}
                cellsWidthRatio={cellsWidthRatio}
                maxDimension={MAX_DIMENSION}
                selected={selected}
                highlighted={highlighted}
                semantic={true}
            ></Cell>
        )
    });

    if (typeof (window) !== "undefined" && typeof (window) !== null) {
        const mobile = window.matchMedia("(any-pointer:coarse)").matches;
        if (onMobile !== mobile) {
            setOnMobile(mobile);
        }
    }
    const showKeyboard = onMobile;

    const candidateButtons = candidates.map((candidate, index) => (
        <button
            key={index}
            onClick={() => handleCandidateSelect(candidate)}
        >{candidate}</button>
    ));

    const dbDefinitionSpans = dbDefinitions.map((def, index) => (
        <div 
            key={index}
            className={styles.Definition}
            onClick={() => {handleDefinitionSelection(def)}}
        >
            <span>{index + 1} : </span>
            <span>{def}</span>
        </div>
    ));

    const apiOutputSpans = apiDefinitions.map((def, index) => (
        <div 
            key={`apidiv_${index}`}
            onClick={() => {handleDefinitionSelection(def)}}
            className={styles.Definition}>
            <span>{index + 1} : </span>
            <span>{def}</span>
        </div>
    ));

    const currentWord = gridRef.current.clues[currentClue].getCurrentSolution();

    return (
        <div className={styles.container}>
            <Row className="mt-2">
                <Col className='d-flex justify-content-center'>
                    <div
                        id="gridDiv"
                        style={myStyle}
                        className={styles.grid_background}
                    >
                        {cells}
                    </div>
                </Col>
                <Col className="d-flex flex-column align-items-center">
                    <div>
                        <label htmlFor="grid-checkbox">Edit Grid</label>
                        <input
                            id="grid-checkbox"
                            type="checkbox"
                            checked={isEditingGrid}
                            className="ml-3"
                            onChange={() => setIsEditingGrid(!isEditingGrid)}
                        />
                    </div>
                    <button
                        onClick={getPotentials}
                        className="mt-3"
                    >Get Words</button>
                    <button
                        onClick={getDefinitions}
                    >Get Definitions
                    </button>
                </Col>
            </Row>

            {!showKeyboard &&
                <Row className="mt-2">
                    <Col>
                        <textarea
                            rows="2"
                            readOnly
                            className={styles.current_clue_display}
                            value={currentClue != null ? data.clues[currentClue]?.clue : ''}>
                        </textarea>
                    </Col>
                </Row>
            }

            <Row className='mt-4'>
                <ClueList
                    clues={clues}
                    onClueClick={onClueClick}
                ></ClueList>
            </Row>

            {showKeyboard &&
                <Keyboard
                    clickHandler={handleKeyPress}
                    indicatorLetter={indicatorLetter}
                    keyboardTripswitch={keyboardTripswitch}
                    clueString={data.clues[currentClue].clue}>
                </Keyboard>
            }

            <Modal 
                show={showCandidatesModal}
                onHide={() => setShowCandidatesModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Choose Word</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {candidateButtons.length ? (
                        candidateButtons
                    ) : (
                        <span>Sorry, no matches</span>
                    )}
                </Modal.Body>
            </Modal>

            <Modal 
                show={showCluesModal}
                onHide={() => setShowCluesModal(false)}
                className={styles.CustomModal}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Clue Search : { currentWord }</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h4 className="text-center">Database</h4>
                    {dbDefinitionSpans}
                    <h4 className="text-center">API</h4>
                    {apiOutputSpans}
                </Modal.Body>
            </Modal>
        </div>
    );
}