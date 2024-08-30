import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Button, Col, Container, Modal, Row } from 'react-bootstrap';

import btnStyles from '../../styles/Button.module.css'
import styles from '../../styles/sudoku/PuzzleContainer.module.css'
import themes from '../../styles/Themes.module.css';

import DigitChooser from '../../components/DigitChooser';
import Timer from '../../components/Timer';
import Puzzle from '../../components/Puzzle';
import ProfileForm from '../../components/ProfileForm';
import { CompletenessDisplay } from '../../components/CompletenessDisplay';

import { axiosReq } from '../../api/axiosDefaults';
import { checkCellValidity, getExhaustedDigits, replaceCharAt } from '../../utils/utils';
import { DIFFICULTY_LEVELS, LCLSTRG_KEY, LCLSTRG_UNDO_STACK_KEY } from '../../constants/constants';

import { useCurrentUser } from '../../contexts/CurrentUserContext';
import { usePuzzleHistoryContext } from '../../contexts/PuzzleHistoryContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useProfile } from '../../contexts/ProfileContext';

import { createSearchArray, getSearchArraysFromGrid, getSearchArraysRemoveOnly, solvePuzzle } from '../../utils/solver';
import { bruteForce } from '../../utils/strategies/bruteForce';
import SudokuKeyboardHandler from '../../components/SudokuKeyboardHandler';


const PuzzleContainer = () => {

    // Have to load theme here as react-bootstrap modal doesn't inherit them. WTF.
    const theme = useTheme();
    const themeStyles = theme === 'light' ? themes.lightTheme : themes.darkTheme;

    const profile = useProfile();

    const { savePuzzleToHistory, getPuzzleHistory } = usePuzzleHistoryContext();

    const [showProfileModal, setShowProfileModal] = useState(false);

    const { difficulty } = useParams();
    const [puzzleData, setPuzzleData] = useState({
        grid: Array(82).join('-')
    });
    const [searchArray, setSearchArray] = useState(() => createSearchArray());
    const [completeness, setCompleteness] = useState(0);
    const [initialKnownCount, setInitialKnownCount] = useState(0);
    const [startTime, setStartTime] = useState(0);

    // Digits already placed 9 times in the puzzle
    const [exhaustedDigits, setExhaustedDigits] = useState([]);

    const navigate = useNavigate();
    const currentUser = useCurrentUser();

    // Current cell selected by user.
    const [selectedCellIndex, setSelectedCellIndex] = useState(0);

    // The row, col or square in which a digit appears twice
    const [warningGroup, setWarningGroup] = useState([]);

    // The cell that duplicated the value of the current selected cell.
    const [clashingCell, setClashingCell] = useState(-1);

    const [undoStack, setUndoStack] = useState([]);

    const [showNotes, setShowNotes] = useState(false);

    const toggleNotes = () => {
        setShowNotes(!showNotes);
    }

    console.log(undoStack);

    // Load data on mount.
    useEffect(() => {
        const handleMount = async () => {
            try {
                const puzzleHistory = getPuzzleHistory("sudoku", difficulty);
                let getQuery = '';
                if (puzzleHistory) {
                    getQuery = `?used_puzzles=${puzzleHistory}`;
                }
                const url = `/get_random_puzzle/${difficulty}/${getQuery}`;
                const { data } = await axiosReq.get(url);
                setPuzzleData(data);
                const initialKnownCount = data.grid.split('').filter(chr => chr !== '-');
                setInitialKnownCount(initialKnownCount.length);
                const searchArrays = getSearchArraysFromGrid(data.grid);
                setSearchArray(searchArrays);
                setStartTime(new Date());
            } catch (err) {
                console.log(err);
                navigate('/');
            }
        }

        const previousPuzzle = window.localStorage.getItem(LCLSTRG_KEY);
        const previousUndoStack = window.localStorage.getItem(LCLSTRG_UNDO_STACK_KEY);
        if (previousPuzzle) {
            const puzzleData = JSON.parse(previousPuzzle);
            setPuzzleData(puzzleData);
            const uStack = JSON.parse(previousUndoStack);
            setUndoStack(uStack);
        } else {
            handleMount();
        }
        
    }, [difficulty, history, getPuzzleHistory]);

    // Tests if a digit is valid in the current selected cell, and displays
    // the warnings if not.
    const performValidityCheck = (digit) => {
        const { isValid, clashingCell, group } = checkCellValidity(
            puzzleData.grid, selectedCellIndex, digit);
        if (!isValid) {
            setWarningGroup(group);
            setClashingCell(clashingCell);
        } else {
            if (warningGroup.length > 0) {
                setWarningGroup([]);
                setClashingCell(-1);
            }
        }
    }

    const handleDigitChoice = (digit) => {
        const currentSelectedCellValue = puzzleData.grid[selectedCellIndex];

        performValidityCheck(digit);

        setPuzzleData(prevData => {
            const index = selectedCellIndex;
            const grid = prevData.grid;
            const newGrid = replaceCharAt(grid, index, digit);
            const newData = {
                ...prevData,
                grid: newGrid,
            }
            window.localStorage.setItem(LCLSTRG_KEY, JSON.stringify(newData));
            
            return newData;
        })

        setUndoStack(prev => {
            const undoItem = {
                index: selectedCellIndex,
                previousValue: currentSelectedCellValue
            }
            const newStack = [...prev, undoItem];
            return newStack;
        });
    }

    const handleCellSelection = (index) => {
        if (warningGroup.length === 0) {
            console.log(`index === ${index}`)
            setSelectedCellIndex(index);
        }
    }

    const handleUndo = () => {
        if (undoStack.length < 1) {
            alert('This is the original puzzle - can\'t undo from here')
            return;
        }
        const itemToUndo = undoStack[undoStack.length - 1];
        const { index, previousValue } = itemToUndo;

        setPuzzleData(prev => {
            const newData = {
                ...prev,
                grid: replaceCharAt(puzzleData.grid, index, previousValue)
            }
            window.localStorage.setItem(LCLSTRG_KEY, JSON.stringify(newData));
            return newData;
        })

        setUndoStack(prev => {
            const newStack = [...prev]
            newStack.pop();
            return newStack;
        });
        performValidityCheck(previousValue);
    }

    /**
     * Store undoStack in localStorage each time the array reference changes
     */
    useEffect(() => {
        console.log('useEffect undoStack fired')
        window.localStorage.setItem(LCLSTRG_UNDO_STACK_KEY, JSON.stringify(undoStack));
    }, [undoStack]);

    const handleLeaderboardButtonClick = () => {
        console.log('handleLeaderboardButtonClick');
        if (!profile) {
            setShowProfileModal(true);
        } else {
            submitPuzzle();
        }
    }

    const profileModalCallback = () => {
        console.log('profileModalCallback invoked');
        setShowProfileModal(false);
        submitPuzzle();
    }

    const submitPuzzle = async () => {

        // First, submit the puzzle
        const formData = new FormData();
        formData.append("puzzle", puzzleData.id);
        formData.append("grid", puzzleData.grid);
        formData.append("started_on", puzzleData.start_time);
        formData.append("completed_at", new Date().toISOString());
        formData.append("completed", "true");
        try {
            const {data} = await axiosReq.post(
                '/create_puzzle_instance/', 
                formData,
                );
                navigate(`/leaderboard/${data.id}/`)
        } catch (err) {
            console.log(err);
        }
    }

    // Update completeness and exhaustedDigits each time the grid changes
    useEffect(() => {
        if (puzzleData.grid != null) {
            const knownCellCount = puzzleData.grid.split('').filter(chr => chr !== '-');
            const completeness = (knownCellCount.length - initialKnownCount) / (81 - initialKnownCount) * 100;
            setCompleteness(completeness);
        }
        if (puzzleData.grid) {
            setExhaustedDigits(getExhaustedDigits(puzzleData.grid));
            const srcArrs = getSearchArraysRemoveOnly(puzzleData.grid, searchArray);
            setSearchArray(srcArrs);
        }
    }, [puzzleData, currentUser]);


    // Submit the puzzle if completeness hits 100%
    useEffect(() => {
        if (completeness >= 100) {
            window.localStorage.removeItem(LCLSTRG_KEY);
            savePuzzleToHistory(puzzleData.id, "sudoku", difficulty);
        }
    }, [completeness, currentUser, puzzleData, history, difficulty, savePuzzleToHistory]) 

    const callback = (grid, newSearchArray) => {
        setPuzzleData(prev => ({
            ...prev,
            grid: grid,
        }));
        setSearchArray(newSearchArray);
    }

    const handleSolve = useCallback(() => {
        console.log(puzzleData.grid, 'source')
        solvePuzzle(puzzleData.grid, searchArray, callback);
    }, [puzzleData, searchArray]);


    const handleBruteForce = () => {
        bruteForce(puzzleData.grid.slice(), callback);
    }

    const handleRefreshNotes = () => {
        const refreshed = getSearchArraysFromGrid(puzzleData.grid);
        setSearchArray(refreshed);
    }

    // Set success message style
    const successStyle = 
        completeness === 100 
        ? `${styles.SuccessMessage} ${styles.PointerEventsOn} ${styles.RevealMessage}` 
        : `${styles.SuccessMessage} ${styles.PointerEventsOff}`;

    return (
        <Container>
            <Row className="d-flex justify-content-center mt-3">
                <p className="mr-5">{DIFFICULTY_LEVELS[difficulty].toUpperCase()}</p>
                <Timer startTime={startTime}></Timer>
            </Row>
            <Row className="mt-2">
                <Col xs={{ span: 8, offset: 2 }} sm={{ span: 6, offset: 3 }} md={{ span: 4, offset: 4 }}>
                    <CompletenessDisplay
                        completenessPercentage={Math.round(completeness)}
                        shorthand />
                </Col>
            </Row>
            <Row className="d-flex justify-content-center mt-4 position-relative">
                <Puzzle
                    grid={puzzleData?.grid}
                    searchArray={searchArray}
                    setSearchArray={setSearchArray}
                    showNotes={showNotes}
                    selectedCell={selectedCellIndex}
                    handleCellSelection={handleCellSelection}
                    warningGroup={warningGroup}
                    clashingCell={clashingCell}
                    completed={completeness === 100}
                    />
                <div 
                    className={`${successStyle} text-center`}
                    data-cy="success_message_div"    
                >
                    <h1>Well Done!</h1>
                    <button 
                        className={`${btnStyles.Button} mt-4`}
                        onClick={handleLeaderboardButtonClick}
                        data-cy="leaderboard_button"
                        >Leaderboard</button>
                    
                </div>
            </Row>
            <Row className="d-flex justify-content-center mt-3">
                <DigitChooser
                    exhaustedDigits={exhaustedDigits}
                    handleDigitChoice={handleDigitChoice} />

            </Row>
            <Row className="d-flex justify-content-center mt-3">
                <button
                    className={`${btnStyles.Button} mx-2`}
                    onClick={handleUndo}
                    aria-label="back button"
                    >
                    <i className="fa-solid fa-arrow-rotate-left"></i>
                </button>
                <button
                    className={`${btnStyles.Button} mx-2`}
                    onClick={toggleNotes}>
                        Notes
                </button>
                { currentUser && (
                    <button
                        className={`${btnStyles.Button} mx-2`}
                        onClick={handleBruteForce}>
                        Brute Force
                    </button>
                )}
                
                <button
                    className={`${btnStyles.Button} mx-2`}
                    onClick={handleRefreshNotes}
                    disabled={!showNotes}
                    >
                    Refresh Notes
                </button>
                
                
                
                { currentUser && (
                    <>
                        <Button
                            className={`${btnStyles.Button} mx-2`}
                            onClick={handleSolve}>
                            Solve
                        </Button>
                        
                </>
                )}
            </Row>

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

            <SudokuKeyboardHandler 
                selectedCellIndex={selectedCellIndex}
                handleCellSelection={handleCellSelection}
                handleDigitChoice={handleDigitChoice}
                exhaustedDigits={exhaustedDigits}
                handleUndo={handleUndo}
            />

        </Container>
    )
}

export default PuzzleContainer