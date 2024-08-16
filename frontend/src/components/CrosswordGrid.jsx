import { ClueList } from '../components/ClueList';
import { Cell } from './Cell';
import { CompletenessDisplay } from './CompletenessDisplay';
import { getVerboseTimeString, replaceCharAt } from '../utils/utils';
import { GRID_CONTENTS_LS_KEY, PUZZLE_ID_LS_KEY } from '../constants/constants.js';
import styles from '../styles/crossword/Grid.module.css';
import btnStyles from '../styles/Button.module.css'
import { useTheme } from '../contexts/ThemeContext';
import themes from '../styles/Themes.module.css';
import { useEffect, useState, useRef, createRef, useCallback } from 'react';
import { Row, Col, Modal } from 'react-bootstrap';
import { MobileWordInput } from './MobileWordInput.jsx';
import { usePuzzleHistoryContext } from '../contexts/PuzzleHistoryContext';
import { useProfile } from '../contexts/ProfileContext.jsx';
import ProfileForm from './ProfileForm.jsx';
import { CrosswordTimer } from './CrosswordTimer.jsx';
import { axiosReq } from '../api/axiosDefaults.js';
import { useNavigate } from 'react-router-dom';

const MAX_DIMENSION = 32;

export const CrosswordGrid = ({ data }) => {

    const theme = useTheme();
    const themeStyles = theme === 'light' ? themes.lightTheme : themes.darkTheme;

    const navigate = useNavigate();

    const profile = useProfile();
    const [showProfileModal, setShowProfileModal] = useState(false);

    const timeExpiredRef = useRef(0);
    const [percentageCorrect, setPercentageCorrect] = useState(0);
    const percentageCompleteRef = useRef(0);

    const { savePuzzleToHistory, getPuzzleHistory } = usePuzzleHistoryContext();

    const [currentCell, setCurrentCell] = useState(data.clues[0].start_col + data.clues[0].start_row * data.puzzle.grid.width);
    const [currentClue, setCurrentClue] = useState(0);
    const [userHasFinished, setUserHasFinished] = useState(false);
    const [indicatorLetter, setIndicatorLetter] = useState('');
    const [onMobile, setOnMobile] = useState(false);
    const [showInputModal, setShowInputModal] = useState(false);

    const [correctCellChars, setCorrectCellChars] = useState([]);

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

    useEffect(() => {
        const storedGridContents = window.localStorage.getItem(GRID_CONTENTS_LS_KEY);
        const storedPuzzleId = window.localStorage.getItem(PUZZLE_ID_LS_KEY);
        if (storedPuzzleId == data.puzzle.id) {
            setGridContents(storedGridContents);
        }
    }, [data.puzzle.grid.cells, data.puzzle.id]);

    /**
     * Calculate and update the percentageCorrect state each time the grid changes
     */
    useEffect(() => {
        if (correctCellChars.length) {
            let totalCorrect = 0;
            correctCellChars.forEach((char, index) => {
                if (char !== '-') {
                    if (char.toLowerCase() === gridContents.charAt(index).toLowerCase()) {
                        totalCorrect++;
                    }
                }
            })
            setPercentageCorrect(Math.round(totalCorrect / gridContents.length * 100))
        }
    }, [gridContents])

    /**
     * Submit a completed puzzle instance to the backend
     */
    const submitCrosswordInstance = async () => {
        const formData = new FormData();
        formData.append("crossword_puzzle", data.puzzle.id);
        formData.append("started_on", data.puzzle.start_time);
        formData.append("completed_at", new Date().toISOString());
        formData.append("percent_complete", percentageCompleteRef.current);
        formData.append("percent_correct", percentageCorrect);

        try {
            const {data} = await axiosReq.post(
                '/crossword_builder/create_crossword_instance/',
                formData);
                //navigate('/');
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * An array, with an element for each clue, which stores a list of the cells
     * occupied by that clue on the grid. 
     * 
     * Allows a clue to know which cells it
     * contains.
     */
    const [cellReferences, setCellReferences] = useState(() => {
        let array = new Array(data.clues.length);
        let width = data.puzzle.grid.width;
        for (let i = 0; i < array.length; i++) {
            array[i] = new Array();
            const clue = data.clues[i];
            for (let j = 0; j < clue.solution.length; j++) {
                let cellIndex;
                if (clue.orientation === 'AC') {
                    cellIndex = clue.start_col + j + (clue.start_row * width);
                } else {
                    cellIndex = clue.start_col + ((j + clue.start_row) * width);
                }
                array[i].push(cellIndex);
            }

        }
        return array;
    });

    /**
     * An array, with an element for each cell, which stores a list of the 
     * clues that appear in that cell. 
     * 
     * Allows a cell to know which clue(s) it affects.
     */
    const [clueReferences, setClueReferences] = useState(() => {
        const width = data.puzzle.grid.width;
        const height = data.puzzle.grid.height;
        const length = width * height;
        let array = new Array(length);
        for (let i = 0; i < array.length; i++) {
            array[i] = new Array();
        }
        data.clues.forEach((clue, number) => {
            for (let i = 0; i < clue.solution.length; i++) {
                const startCol = parseInt(clue.start_col);
                const startRow = parseInt(clue.start_row);
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
        return array;
    });

    /* 
    * As soon as the cellReferences array is populated, create an array consisting of the
    * correct characters for each cell in the grid, or '-' if the cell is blank.
    * Set the correctCellChars state variable to be this array.
    */
    useEffect(() => {
        const correctCellValues = [];
        const cells = data.puzzle.grid.cells;
        for (let i = 0; i < cells.length; i++) {
            if (cells.charAt(i) === '#') {
                const clueIndex = clueReferences[i][0];
                const clue = data.clues[clueIndex];
                const clueStartIndex = clue.start_col + clue.start_row * data.puzzle.grid.width;
                let letterIndex;
                if (clue.orientation === 'AC') {
                    letterIndex = i - clueStartIndex;
                } else {
                    letterIndex = (i - clueStartIndex) / data.puzzle.grid.width;
                }
                const correctChar = clue.solution[letterIndex];
                correctCellValues.push(correctChar);
            } else {
                correctCellValues.push('-');
            }
        }
        setCorrectCellChars(correctCellValues);
    }, [clueReferences])

    /**
     * Handles events generated by user clicking on individual cells.
     * @param {Integer} cellIndex 
     */
    const onCellClick = (cellIndex) => {
        setCurrentCell(cellIndex);
        let result = clueReferences[cellIndex].indexOf(currentClue)
        if (result !== -1) {
            // Alternate the clues selected if 2 are present
            result += 1;
            const orthogonalClueIndex = result >= clueReferences[cellIndex].length ? 0 : result;
            setCurrentClue(clueReferences[cellIndex][orthogonalClueIndex]);
        } else {
            const clue = data.clues[clueReferences[cellIndex][0]];
            if (clue.orientation === "AC" && clueReferences[cellIndex].length > 1) {

                // Check if the AC clue (if both are present) is filled. There's no point 
                // in defaulting to selecting the AC clue if it is - bad UX.
                let clueAlreadyFilled = true;
                for (let x = clue.start_col; x < clue.start_col + clue.solution.length; x++) {
                    const index = x + clue.start_row * data.puzzle.grid.width;
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
        }
        if (onMobile) {
            setShowInputModal(true);
        }
    }

    console.log('currentClue', currentClue);
    console.log('currentCell', currentCell);
    console.log('index of same', cellReferences[currentClue].indexOf(currentCell));

    /**
     * Handles clicks on clues in child component ClueList.
     * 
     * @param {Integer} clueNumber 
     */
    const onClueClick = (clueIndex) => {
        const clue = data.clues[clueIndex];
        const startCol = clue.start_col;
        const startRow = clue.start_row;
        const cellIndex = startCol + startRow * data.puzzle.grid.width;
        setCurrentCell(cellIndex);
        setCurrentClue(clueIndex);
        window.scrollTo({
            top: 0,
            left: 0,
            behaviour: 'smooth'
        });
    }

    /**
     * Handles events generated by Keyboard component (user clicking on keys). See 
     * https://react.dev/learn/updating-arrays-in-state#adding-to-an-array for obscure
     * method of mutating state array using map function in React.
     * @param {Integer} keyCode 
     */
    const handleKeyPress = useCallback((event, keyCode) => {

        event.preventDefault();

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
                const newGridContents = replaceCharAt(gridContents, currentCell, '#');
                updateGridContents(newGridContents);
                retreatCurrentCell();
            } else {
                // Case 2 - the cell pointer should be moved back and then the value deleted.
                retreatCurrentCell();
                const newGridContents = replaceCharAt(gridContents, currentCell, '#');
                updateGridContents(newGridContents);
            }
        } else if (keyCode === 37) { // left arrow key
            const height = data.puzzle.grid.height;
            const currentRowLeftmost = Math.floor(currentCell / height) * height;
            let pointer = currentCell;
            while (--pointer >= currentRowLeftmost) {
                if (gridContents.charAt(pointer) !== '-') {
                    onCellClick(pointer);
                    break;
                }
            }
        } else if (keyCode === 39) { // right arrow key
            const h = data.puzzle.grid.height;
            const w = data.puzzle.grid.width;
            const currentRowRightmost = Math.floor(currentCell / h) * h + w;
            let pointer = currentCell;
            while (++pointer < currentRowRightmost) {
                if (gridContents.charAt(pointer) !== '-') {
                    onCellClick(pointer);
                    break;
                }
            }
        } else if (keyCode === 38) { // up arrow key
            const w = data.puzzle.grid.width;
            const currentColTop = currentCell % w;
            let pointer = currentCell;
            while (true) {
                pointer -= w;
                if (pointer < currentColTop) {
                    return;
                }
                if (gridContents.charAt(pointer) !== '-') {
                    onCellClick(pointer);
                    break;
                }
            }
        } else if (keyCode === 40) { // down arrow key
            const w = data.puzzle.grid.width;
            const h = data.puzzle.grid.height;
            const currentColBottom = currentCell % w + ((h - 1) * w);
            let pointer = currentCell;
            while (true) {
                pointer += w;
                if (pointer > currentColBottom) {
                    return;
                }
                if (gridContents.charAt(pointer) !== '-') {
                    onCellClick(pointer);
                    break;
                }
            }
        } else if (keyCode === 13) {
            onCellClick(currentCell);
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
            handleKeyPress(event, event.keyCode);
        }
        window.addEventListener('keyup', handleTyping);
        return () => window.removeEventListener('keyup', handleTyping);
    }, [onMobile, handleKeyPress]);


    /**
     * Toggles the red and green styling to indicate if a letter(cell) is
     * correct or not
     */
    const onFinished = () => {
        savePuzzleToHistory(data.puzzle.id, 'crossword', 0);
        if (!profile) {
            setShowProfileModal(true);
        } else {
            setUserHasFinished(true);
            submitCrosswordInstance();
        }

    }

    const profileModalCallback = () => {
        console.log('profileModalCallback invoked');
        setShowProfileModal(false);
        setUserHasFinished(true);
        submitCrosswordInstance();
    }

    const onMobileWordInputClose = (characters, shouldClose) => {
        let gridCopy = gridContents.slice();
        characters.forEach((char, index) => {
            gridCopy = replaceCharAt(
                gridCopy,
                cellReferences[currentClue][index],
                char
            );
        });
        setGridContents(gridCopy);
        if (shouldClose) {
            setShowInputModal(false);
        }
    };

    /**
     * Unfortunate initial design decision. This component needs to know the time, to 
     * display it to the user on finish and to submit it to the backend. Originally put the
     * time state in the CrosswordTimer 
     */
    const crosswordTimerCallback = (time) => {
        timeExpiredRef.current = time;
    }

    // Rendering process begins here
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

        // If the showCellCorrectness flag is true, check if the letter in this
        // cell is correct. If flag is false, the unused value can be false.
        const missing = char === '#' || char === ' ' || char === '';
        let correct = false;
        let correctChar = '';
        if (userHasFinished && char != '-') {
            correctChar = correctCellChars[pointer];
            correct = char.toLowerCase() == correctChar.toLowerCase();
        }
        let letter;
        if (char === "-") {
            closedCellCount += 1;
            letter = '';
        } else {
            letter = userHasFinished ? correctCellChars[pointer] : char;
            if (!missing) {
                filledCellCount += 1;
            }
        }

        return (
            <Cell key={`cell-${pointer}`}
                inUse={char !== "-"}
                isEditing={false}
                index={pointer}
                letter={letter}
                correctLetter={correctChar}
                clickHandler={onCellClick}
                cellsWidthRatio={cellsWidthRatio}
                maxDimension={MAX_DIMENSION}
                selected={selected}
                highlighted={highlighted}
                showCorrectness={userHasFinished}
                correct={correct}
                missing={missing}
                semantic={true}
            ></Cell>
        )
    });

    const openCellCount = gridContents.length - closedCellCount;
    const calculatedPercentComplete = Math.floor(filledCellCount / openCellCount * 100);
    percentageCompleteRef.current = calculatedPercentComplete;

    if (typeof (window) !== "undefined" && typeof (window) !== null) {
        const mobile = window.matchMedia("(any-pointer:coarse)").matches;
        if (onMobile !== mobile) {
            setOnMobile(mobile);
        }
    }

    return (
        <>
            <div className={styles.container}>
                <Row className={styles.InfoOnTop}>
                    <Col className="d-flex justify-content-center align-items-center">
                        <span
                            className={`${styles.CrosswordNumber} mr-5`}
                        ># {data.puzzle.id}</span>
                        <CrosswordTimer
                            puzzleId={data.puzzle.grid.id}
                            running={!userHasFinished}
                            callback={crosswordTimerCallback}
                        />
                    </Col>
                    <Col className="d-flex justify-content-center align-items-center">
                    
                    </Col>
                </Row>

                <Row className={styles.InfoOnTop}>
                    <div className="d-flex justify-content-center">
                        <div className="mt-md-3 mt-2 w-50">
                            <CompletenessDisplay
                                completenessPercentage={calculatedPercentComplete}
                                shorthand={false}
                            />
                        </div>
                    </div>
                </Row>

                <Row className="mt-2">
                    <Col xs={12} md={8} lg={6} className='d-flex justify-content-center'>
                        <div
                            id="gridDiv"
                            style={myStyle}
                            className={styles.grid_background}
                        >
                            {cells}
                        </div>
                    </Col>

                    <Col xs={12} md={4} lg={6}
                        className="d-flex flex-column align-items-center mt-md-5"
                    >
                        <Row className="w-100">
                            <Col xs={6} className="d-flex align-items-center justify-content-end">
                                <span
                                    className={`${styles.CrosswordNumber} mr-2`}
                                ># {data.puzzle.id}</span>
                            </Col>
                            <Col cs={6} className="d-flex align-items-center justify-content-start">
                                <div className="ml-2">
                                    <CrosswordTimer
                                        puzzleId={data.puzzle.grid.id}
                                        running={!userHasFinished}
                                        callback={crosswordTimerCallback}
                                    />
                                </div>
                                
                            </Col>
                        </Row>
                        <div className={styles.InfoToSide}>
                            
                            
                        </div>

                        <div className={`${styles.InfoToSide} mt-3 w-75`}>
                            <CompletenessDisplay
                                completenessPercentage={calculatedPercentComplete}
                                shorthand={false}
                            />
                        </div>


                        {!userHasFinished && (
                            <>
                                <p
                                    className={`${styles.current_clue_display} mt-md-5 mt-2`}
                                >
                                    {currentClue != null ? data.clues[currentClue].clue : ''}
                                </p>
                                <button
                                    className={`${btnStyles.Button} mt-md-4 mt-2`}
                                    onClick={onFinished}
                                >I'm done!</button>
                            </>
                        )}

                        {!onMobile && (
                            <p>
                                Use arrow keys
                                <i className={`${styles.ArrowIcon} fa-solid fa-arrows-up-down-left-right`}></i>
                                and return

                            </p>
                        )}


                    </Col>
                </Row>

                {!userHasFinished && (
                    <Row className='mt-4'>
                        <ClueList
                            clues={data.clues}
                            onClueClick={onClueClick}
                            currentClue={currentClue}
                        ></ClueList>
                    </Row>
                )}
            </div>

            {userHasFinished && (
                <div className={`${styles.UserFinishedMessage} text-center mt-5`}>
                    You got {percentageCorrect}% of the crossword correct in&nbsp;
                    {getVerboseTimeString(timeExpiredRef.current)}!
                </div>
            )}

            {currentClue !== null && (
                <Modal
                    show={showInputModal}
                    onHide={() => setShowInputModal(false)}
                    contentClassName={`${styles.ProfileModal} ${themeStyles}`}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>

                            {`${data.clues[currentClue].clue_number}
                            
                            ${data.clues[currentClue].orientation === "DN" ? "Down" : "Across"}`}
                        </Modal.Title>
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
                            onEdit={onMobileWordInputClose}
                        />
                        <div className="text-center">
                            {clueReferences[currentCell].length > 1 && (
                                <button
                                    className={`${btnStyles.Button} mt-3 text-center`}
                                    onClick={() => onCellClick(currentCell)}
                                >
                                    <i className="fa-solid fa-shuffle mr-3"></i>
                                    Intersecting Clue
                                </button>
                            )}
                        </div>


                    </Modal.Body>
                </Modal>
            )}

            <Modal
                show={showProfileModal}
                onHide={() => setShowProfileModal(false)}
                contentClassName={`${styles.ProfileModal} ${themeStyles}`}
                centered
                data-cy="profile_modal"
            >
                <Modal.Body>
                    <ProfileForm callback={profileModalCallback} />
                </Modal.Body>
            </Modal>

        </>
    );
}