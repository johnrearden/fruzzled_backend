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
import { getCookieConsentValue } from 'react-cookie-consent';
import SEO from '../../components/SEO';
import ShareButton from '../../components/ShareButton';


const SudokuChallenge = () => {

    const theme = useTheme();
    const themeStyles = theme === 'light' ? themes.lightTheme : themes.darkTheme;

    const profile = useProfile();
    const [cookieConsent, setCookieConsent] = useState(false);

    const { savePuzzleToHistory } = usePuzzleHistoryContext();

    const [showProfileModal, setShowProfileModal] = useState(false);

    const { puzzleId } = useParams();
    const [puzzleData, setPuzzleData] = useState({
        grid: Array(82).join('-')
    });
    const [searchArray, setSearchArray] = useState(() => createSearchArray());
    const [completeness, setCompleteness] = useState(0);
    const [initialKnownCount, setInitialKnownCount] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [exhaustedDigits, setExhaustedDigits] = useState([]);

    const navigate = useNavigate();
    const currentUser = useCurrentUser();

    const [selectedCellIndex, setSelectedCellIndex] = useState(0);
    const [warningGroup, setWarningGroup] = useState([]);
    const [clashingCell, setClashingCell] = useState(-1);
    const [undoStack, setUndoStack] = useState([]);
    const [showNotes, setShowNotes] = useState(false);

    const toggleNotes = () => {
        setShowNotes(!showNotes);
    }

    // Load specific puzzle by ID on mount
    useEffect(() => {
        const handleMount = async () => {
            try {
                const url = `/get_puzzle/${puzzleId}/`;
                const { data } = await axiosReq.get(url);
                setPuzzleData(data);
                const initialKnownCount = data.grid.split('').filter(chr => chr !== '-');
                setInitialKnownCount(initialKnownCount.length);
                const searchArrays = getSearchArraysFromGrid(data.grid);
                setSearchArray(searchArrays);
                setStartTime(new Date());
                const cookieConsentString = getCookieConsentValue('profile-consent-cookie');
                setCookieConsent(cookieConsentString === 'true' ? true : false);
                setLoading(false);
            } catch (err) {
                console.log(err);
                setError('Puzzle not found');
                setLoading(false);
            }
        }

        handleMount();
    }, [puzzleId]);

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
            setSelectedCellIndex(index);
        }
    }

    const handleUndo = () => {
        if (showProfileModal) {
            return;
        }

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
            return newData;
        })

        setUndoStack(prev => {
            const newStack = [...prev]
            newStack.pop();
            return newStack;
        });
        performValidityCheck(previousValue);
    }

    const handleLeaderboardButtonClick = () => {
        if (!profile) {
            setShowProfileModal(true);
        } else {
            submitPuzzle();
        }
    }

    const profileModalCallback = () => {
        setShowProfileModal(false);
        submitPuzzle();
    }

    const submitPuzzle = async () => {
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

    useEffect(() => {
        if (completeness >= 100) {
            savePuzzleToHistory(puzzleData.id, "sudoku", puzzleData.difficulty);
        }
    }, [completeness, currentUser, puzzleData, savePuzzleToHistory])

    const callback = (grid, newSearchArray) => {
        setPuzzleData(prev => ({
            ...prev,
            grid: grid,
        }));
        setSearchArray(newSearchArray);
    }

    const handleSolve = useCallback(() => {
        solvePuzzle(puzzleData.grid, searchArray, callback);
    }, [puzzleData, searchArray]);

    const handleBruteForce = () => {
        bruteForce(puzzleData.grid.slice(), callback);
    }

    const handleRefreshNotes = () => {
        const refreshed = getSearchArraysFromGrid(puzzleData.grid);
        setSearchArray(refreshed);
    }

    if (loading) {
        return (
            <Container>
                <Row className="d-flex justify-content-center mt-5">
                    <p>Loading puzzle...</p>
                </Row>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Row className="d-flex justify-content-center mt-5">
                    <p>{error}</p>
                    <button
                        className={`${btnStyles.Button} mt-3`}
                        onClick={() => navigate('/sudoku_home')}
                    >
                        Play a random puzzle
                    </button>
                </Row>
            </Container>
        );
    }

    const successStyle =
        completeness === 100
        ? `${styles.SuccessMessage} ${styles.PointerEventsOn} ${styles.RevealMessage}`
        : `${styles.SuccessMessage} ${styles.PointerEventsOff}`;

    const difficultyName = DIFFICULTY_LEVELS[puzzleData.difficulty] || 'Sudoku';

    return (
        <Container>
            <SEO
                title={`Sudoku Challenge #${puzzleId}`}
                description={`Play this ${difficultyName} sudoku puzzle challenge on Fruzzled. Can you beat your friend's time?`}
                path={`/sudoku/challenge/${puzzleId}`}
                breadcrumbs={[
                    { name: 'Home', url: 'https://fruzzled.ie' },
                    { name: 'Sudoku', url: 'https://fruzzled.ie/sudoku_home' },
                    { name: `Challenge #${puzzleId}`, url: `https://fruzzled.ie/sudoku/challenge/${puzzleId}` }
                ]}
            />
            <Row className="d-flex justify-content-center mt-3">
                <p className="mr-5" data-cy="difficulty-display">
                    CHALLENGE #{puzzleId} - {difficultyName.toUpperCase()}
                </p>
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
                    <h4>Challenge Complete!</h4>
                    <div className="mb-3">
                        <ShareButton
                            puzzleType="sudoku"
                            difficulty={difficultyName}
                            challengeId={puzzleId}
                        />
                    </div>
                    {!!cookieConsent ? (
                        <button
                            className={`${btnStyles.Button} mt-4`}
                            onClick={handleLeaderboardButtonClick}
                            data-cy="leaderboard_button"
                        >Leaderboard
                        </button>
                    ) : (
                        <>
                            <button
                                className={`${btnStyles.Button} mt-4`}
                                onClick={() => navigate('/sudoku_home')}
                            >Play Another
                            </button>
                            <button
                                className={`${btnStyles.Button} mt-4`}
                                onClick={() => navigate('/')}
                            >Home
                            </button>
                        </>
                    )}
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
                    <Button
                        className={`${btnStyles.Button} mx-2`}
                        onClick={handleSolve}>
                        Solve
                    </Button>
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

export default SudokuChallenge
