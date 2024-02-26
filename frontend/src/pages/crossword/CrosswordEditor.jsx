import { Keyboard } from '../../components/Keyboard';
import { ClueList } from '../../components/ClueList';
import { Cell } from '../../components/Cell';
import { replaceCharAt } from '../../utils/utils';
import { GRID_CONTENTS_LS_KEY, PUZZLE_ID_LS_KEY } from '../../constants/constants.js';
import styles from '../../styles/crossword/Grid.module.css';
import btnStyles from '../../styles/Button.module.css'
import { useEffect, useState, useCallback, useRef } from 'react';
import { Row, Col, Modal, Button, Alert } from 'react-bootstrap';
import { axiosReq, axiosRes } from '../../api/axiosDefaults.js';
import { OPEN, CLOSED } from '../../../../crosswords/static/js/crossword_grid.js';
import { createCellReferences, createClueReferences } from '../../utils/crossword_utils.js';
import { Grid } from '../../utils/crossword_grid.js';
import { Toggle } from '../../components/Toggle.jsx';
import { Link } from 'react-router-dom';
import { MobileWordInput } from '../../components/MobileWordInput.jsx';

const MAX_DIMENSION = 25;

export const CrosswordEditor = ({ data }) => {

    const [currentCell, setCurrentCell] = useState(0);
    const [currentClue, setCurrentClue] = useState(0);
    const [indicatorLetter, setIndicatorLetter] = useState('');
    const [onMobile, setOnMobile] = useState(false);
    const [isEditingGrid, setIsEditingGrid] = useState(false);
    const [clues, setClues] = useState([]);

    const [showInputModal, setShowInputModal] = useState(false);
    const [allowMobileInput, setAllowMobileInput] = useState(false);

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

    const [showCandidatesModal, setShowCandidatesModal] = useState(false);
    const [candidates, setCandidates] = useState([]);

    const [showCluesModal, setShowCluesModal] = useState(false);
    const [dbDefinitions, setDBDefinitions] = useState([]);
    const [apiDefinitions, setAPIDefinitions] = useState([]);

    const [showClueTextModal, setShowClueTextModal] = useState(false);
    const [currentClueModalText, setCurrentClueModalText] = useState("");

    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [successAlertText, setSuccessAlertText] = useState("");
    const [alertVariant, setAlertVariant] = useState('success');

    const [complete, setComplete] = useState(false);
    const [reviewed, setReviewed] = useState(false);
    const [released, setReleased] = useState(false);

    // A reference to the internal Grid state object.
    const gridRef = useRef(null);

    // Create and index the clues on load.
    useEffect(() => {
        const gridAsJSON = {
            cells: data.puzzle.grid.cells,
            width: data.puzzle.grid.width,
            height: data.puzzle.grid.height
        }
        const clueArray = data.clues.length ? data.clues : [];
        const gridModel = new Grid(gridAsJSON, clueArray);
        gridRef.current = gridModel;
        setClues(gridModel.clues);
        setGridContents(gridModel.getGridString());

        // Populate the cellReferences array
        const cellReferences = createCellReferences(gridRef.current);
        setCellReferences(cellReferences);

        // Populate the clueReferences array
        const clueReferences = createClueReferences(gridRef.current);
        setClueReferences(clueReferences);

        setComplete(data.puzzle.complete);
        setReviewed(data.puzzle.reviewed);
        setReleased(data.puzzle.released);

    }, [data]);

    const saveCrossword = async () => {
        const list = [];
        for (let clue of clues) {
            list.push(clue.convertToObject());
        }
        const gridString = gridRef.current.getGridObject().grid_string;
        const formData = new FormData();
        formData.append('puzzle_id', data.puzzle.id);
        formData.append('clues', JSON.stringify(list));
        formData.append('grid', gridString);
        formData.append('complete', complete);
        formData.append('reviewed', reviewed);
        formData.append('released', released);

        const url = '/crossword_builder/save_puzzle/';
        try {
            const { data } = await axiosReq.post(url, formData);
            setAlertVariant('success');
            setSuccessAlertText('Crossword saved')
            setShowSuccessAlert(true);
            setTimeout(() => setShowSuccessAlert(false), 1000);
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * Handles events generated by user clicking on individual cells.
     * @param {Integer} cellIndex 
     */
    const onCellClick = (cellIndex, event) => {

        // Handle case where user is toggling cell open or closed
        if (isEditingGrid || event.ctrlKey) {
            const currentChar = gridContents.charAt(cellIndex);
            const newChar = currentChar === CLOSED ? OPEN : CLOSED;
            let copy = gridContents.slice();
            copy = replaceCharAt(copy, cellIndex, newChar);
            setGridContents(copy);
            const isOpen = gridRef.current.cells[cellIndex].isOpen;
            gridRef.current.cells[cellIndex].isOpen = !isOpen;
            gridRef.current.reindex();
            setClues(gridRef.current.clues);
            setCellReferences(createCellReferences(gridRef.current));
            setClueReferences(createClueReferences(gridRef.current));
            return;
        } else if (!gridRef.current.cells[cellIndex].isOpen) {
            // Take no action if not editing and cell is closed
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
        if (onMobile) {
            console.log('showing')
            console.log('showInputModal', showInputModal)
            setShowInputModal(true);
        }
    }

    /**
     * Handles clicks on clues in child component ClueList.
     * 
     * @param {Integer} clueNumber 
     */
    const onClueClick = (clueIndex) => {
        const clue = clues[clueIndex];
        const startCol = clue.start_col;
        const startRow = clue.start_row;
        const cellIndex = startCol + startRow * gridRef.current.width;
        setCurrentCell(cellIndex);
        setCurrentClue(clueIndex);
        setCurrentClueModalText(clues[currentClue].clue);
        setShowClueTextModal(true);
    }


    /**
     * Handles events generated by Keyboard component (user clicking on keys). See 
     * https://react.dev/learn/updating-arrays-in-state#adding-to-an-array for obscure
     * method of mutating state array using map function in React.
     * @param {Integer} keyCode 
     */
    const handleKeyPress = useCallback(event => {
        const keyCode = event.keyCode;
        if (currentClue == null) return;

        setKeyboardTripswitch(prev => !prev);

        if (event.altKey) {
            switch (event.key) {
                case 'q': {
                    getPotentials();
                    break;
                }
                case 'd': {
                    getDefinitions();
                    break;
                }
                case 'c': {
                    clearCells();
                    break;
                }
                case 's': {
                    saveCrossword();
                    break;
                }
            }
            return;
        }

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
            const model = gridRef.current;
            for (let cell of model.clues[currentClue].cellList) {
                if (cell.index === currentCell) {
                    cell.value = character;
                }
            }
            setClues(model.clues);
            updateGridContents(newGridContents);
            advanceCurrentCell();
            setIndicatorLetter(character);
        } else if (keyIsBackspace) {
            // Case 1 - if the cell is the last in the clue, then its
            // value should be deleted and then the cell pointer moved back.
            if (currentCellIsLastInClue()) {
                const newGridContents = replaceCharAt(gridContents, currentCell, "#");
                updateGridContents(newGridContents);
                retreatCurrentCell();
            } else {
                // Case 2 - the cell pointer should be moved back and then the value deleted.
                retreatCurrentCell();
                const newGridContents = replaceCharAt(gridContents, currentCell, "#");
                updateGridContents(newGridContents);
            }
        }
    }, [cellReferences, clueReferences, currentCell, currentClue, data.puzzle.id, gridContents]);


    /**
     * Add key listener to window on page load, and remove it when page is 
     * closed
     */
    useEffect(() => {
        if (onMobile || showClueTextModal) {
            return;
        }
        const handleTyping = (event) => {
            handleKeyPress(event);
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
    }

    const handleDefinitionSelection = (definition) => {
        gridRef.current.clues[currentClue].clue = definition;
        setClues(gridRef.current.clues);
        setShowCluesModal(false);
    }

    const onClueTextAreaChange = (event) => {
        const newClueText = event.target.value;
        gridRef.current.clues[currentClue].clue = newClueText;
        setClues(gridRef.current.clues);
        setCurrentClueModalText(newClueText);
    }

    const onMobileWordInputClose = (characters) => {
        let gridCopy = gridContents.slice();
        characters.forEach((char, index) => {
            gridCopy = replaceCharAt(
                gridCopy,
                cellReferences[currentClue][index],
                char
            );
        });
        setGridContents(gridCopy);
        setShowInputModal(false);
    }

    const clearCells = () => {
        const clue = gridRef.current.clues[currentClue];
        let gridCopy = gridContents.slice();
        for (let cell of clue.cellList) {
            // Check if cell is in use by an intersecting (and complete) solution. If so, 
            // don't erase it.
            if (cell.clueAcross && cell.clueDown) {
                const intersector = clue.orientation === "AC" ? cell.clueDown : cell.clueAcross;
                let allCellsFilled = true;

                for (let c of intersector.cellList) {
                    if (c.value === '' || c.value === OPEN) {
                        allCellsFilled = false;
                    }
                }
                if (allCellsFilled) {
                    continue;
                }
            }
            cell.value = '';
            gridCopy = replaceCharAt(gridCopy, cell.index, OPEN);
        }
        setGridContents(gridCopy);
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
        const highlighted = clueReferences[pointer]?.includes(currentClue);
        const selected = pointer === currentCell;
        let letter;
        if (char === "-") {
            closedCellCount += 1;
        }
        if (char === "-" || char === "#") {
            letter = '';
        } else {
            letter = char;
            filledCellCount += 1;
        }

        return (
            <Cell key={`cell-${pointer}`}
                inUse={char !== "-"}
                isEditing={isEditingGrid}
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

    const candidateButtons = candidates.map((candidate, index) => {
        const orthogs = clues[currentClue].orthogs;
        const spans = candidate.split('').map((char, idx) => {
            let style = { fontFamily: 'monospace' };
            if (orthogs[idx] === "S") {
                style = {
                    borderTop: '1px solid black',
                    fontFamily: 'monospace'
                };
            } else if (orthogs[idx] === "E") {
                style = {
                    borderBottom: '1px solid black',
                    fontFamily: 'monospace'
                }
            } else if (orthogs[idx] === "M") {
                style = {
                    borderTop: '1px solid black',
                    borderBottom: '1px solid black',
                    fontFamily: 'monospace'
                }
            }
            return (
                <span key={idx} style={style}>{char}</span>
            )
        });
        return (
            <button
                key={index}
                onClick={() => handleCandidateSelect(candidate)}
                className="m-1"
            >{spans}</button>
        )
    });

    const dbDefinitionSpans = dbDefinitions.map((def, index) => (
        <div
            key={index}
            className={styles.Definition}
            onClick={() => { handleDefinitionSelection(def) }}
        >
            <span>{index + 1} : </span>
            <span>{def}</span>
        </div>
    ));

    const apiOutputSpans = apiDefinitions.map((def, index) => (
        <div
            key={`apidiv_${index}`}
            onClick={() => { handleDefinitionSelection(def) }}
            className={styles.Definition}>
            <span>{index + 1} : </span>
            <span>{def}</span>
        </div>
    ));

    const currentWord = gridRef.current.clues[currentClue];

    return (
        <div className={styles.container}>
            <Row className="mt-2">
                <Col className='d-flex flex-column justify-content-center align-items-center'>
                    <h6 className="text-center"># {data.puzzle.id}</h6>
                    <div
                        id="gridDiv"
                        style={myStyle}
                        className={styles.grid_background}
                    >
                        {cells}
                    </div>
                </Col>
                <Col className="d-flex flex-column align-items-center">
                    <div className="d-flex flex-row">
                        <Toggle
                            toggledOn={isEditingGrid}
                            label="Edit grid"
                            handleChange={() => setIsEditingGrid(!isEditingGrid)}
                        />
                        {onMobile && (
                            <Toggle
                                toggledOn={allowMobileInput}
                                label="Input"
                                handleChange={() => setAllowMobileInput(!allowMobileInput)}
                            />
                        )}
                    </div>
                    <button
                        onClick={getPotentials}
                        className={`${btnStyles.Button} mt-3`}
                    >
                        <i className="fa-solid fa-puzzle-piece mr-3"></i>
                        Get Words</button>
                    <button
                        onClick={getDefinitions}
                        className={`${btnStyles.Button} mt-1`}
                    >
                        <i className="fa-solid fa-circle-question mr-3"></i>
                        Get Definitions
                    </button>
                    <button
                        onClick={clearCells}
                        className={`${btnStyles.Button} mt-1`}
                    >
                        <i className="fa-solid fa-trash mr-3"></i>
                        Clear Word</button>
                    <button
                        onClick={() => {
                            setCurrentClueModalText(clues[currentClue].clue);
                            setShowClueTextModal(true);
                        }}
                        className={`${btnStyles.Button} mt-1`}
                    >
                        <i className="fa-solid fa-pen-to-square mr-3"></i>
                        Edit Clue Text</button>
                    <button
                        onClick={saveCrossword}
                        className={`${btnStyles.Button} mt-1`}
                    >
                        <i className="fa-solid fa-cloud-arrow-up mr-3"></i>
                        Save Crossword
                    </button>
                    <div className="d-flex flex-row">
                        <div className="m-2">
                            <Toggle
                                label="Complete"
                                toggledOn={complete}
                                handleChange={() => setComplete(!complete)}
                            />
                        </div>
                        <div className="m-2">
                            <Toggle
                                label="Reviewed"
                                toggledOn={reviewed}
                                handleChange={() => setReviewed(!reviewed)}
                            />
                        </div>
                        <div className="m-2">
                            <Toggle
                                label="Released"
                                toggledOn={released}
                                handleChange={() => setReleased(!released)}
                            />
                        </div>
                    </div>
                    <Link to="/crossword_dashboard">
                        <button className={btnStyles.Button}>
                            <i className="fa-solid fa-arrow-left mr-2"></i>
                            Dashboard
                        </button>
                    </Link>
                </Col>
            </Row>

            <Row className='mt-4'>
                <ClueList
                    clues={clues}
                    onClueClick={onClueClick}
                    currentClue={currentClue}
                ></ClueList>
            </Row>

            <Modal
                show={showCandidatesModal}
                onHide={() => setShowCandidatesModal(false)}
                animation={false}
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
            >
                <Modal.Header closeButton>
                    <Modal.Title>Clue Search : {currentWord}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h4 className="text-center">Database</h4>
                    {dbDefinitionSpans}
                    <h4 className="text-center">API</h4>
                    {apiOutputSpans}
                </Modal.Body>
            </Modal>

            <Modal
                show={showClueTextModal}
                onHide={() => setShowClueTextModal(false)}
                className={styles.CustomModal}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Clue text for : {currentWord}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <textarea
                        rows="6"
                        className={styles.current_clue_display}
                        value={currentClueModalText}
                        onChange={onClueTextAreaChange}
                    >
                    </textarea>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="primary"
                        onClick={() => setShowClueTextModal(false)}
                    >Save changes</Button>
                </Modal.Footer>
            </Modal>

            {
                showSuccessAlert && (
                    <Alert
                        variant={alertVariant}
                        className={styles.Alert}
                    >
                        {successAlertText}
                    </Alert>
                )
            }

            {
                currentClue !== null && allowMobileInput && (
                    <Modal
                        show={showInputModal}
                        onHide={() => setShowInputModal(false)}
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Enter your text</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>
                                {data.clues[currentClue]?.clue}
                            </p>
                            <MobileWordInput
                                letters={
                                    cellReferences[currentClue].map(index => {
                                        const char = gridContents.charAt(index);
                                        return char;
                                    })
                                }
                                selectedIndex={cellReferences[currentClue].indexOf(currentCell)}
                                cellsWidthRatio={cellsWidthRatio}
                                MAX_DIMENSION={MAX_DIMENSION}
                                onEditComplete={onMobileWordInputClose}
                            />
                        </Modal.Body>
                    </Modal>
                )
            }
        </div >
    );
}