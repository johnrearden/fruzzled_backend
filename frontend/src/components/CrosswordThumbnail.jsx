import React, { useEffect, useState } from 'react';
import styles from '../styles/crossword/CrosswordThumbnail.module.css';
import { Toggle } from './Toggle';
import { Link, useNavigate } from 'react-router-dom';
import { axiosReq } from '../api/axiosDefaults';

export const CrosswordThumbnail = ({ puzzle }) => {

    const navigate = useNavigate();

    const { grid, clues, id } = puzzle;
    const [gridContents, setGridContents] = useState([]);

    const [deleteAllowed, setDeleteAllowed] = useState(false);
    const [deleteToggleOn, setDeleteToggleOn] = useState(false);

    const handleDeleteToggle = (val) => {
        setDeleteAllowed(val);
        setDeleteToggleOn(val);
        if (val) {
            setTimeout(() => {
                setDeleteAllowed(false);
                setDeleteToggleOn(false);
            }, 2000);
        }
    }

    const handleDelete = async () => {
        console.log('handleDelete');
        if (deleteAllowed) {
            console.log('deleteAllowed');   
            const url = '/crossword_builder/delete_puzzle/';
            const formData = new FormData();
            formData.append('puzzle_id', id);
            try {
                await axiosReq.post(url, formData);
                console.log('deleted');
                navigate(0);
            } catch (err) {
                console.log(err);
            }
        }
    }

    useEffect(() => {
        const array = grid.cells.slice().split('');
        clues.forEach(clue => {
            clue.solution.split('').forEach((char, index) => {
                let position;
                if (clue.orientation === "AC") {
                    position = clue.start_row * grid.width + clue.start_col + index;
                } else {
                    position = (clue.start_row + index) * grid.width + clue.start_col;
                }
                array[position] = char;
            })
        });
        setGridContents(array);
    }, [puzzle])

    const cells = gridContents.map((char, index) => {
        const cellClass = char === "-" ? styles.EmptyCell : ''
        const displayChar = char === '#' ? '' : char
        return (
            <span
                key={index}
                className={`${styles.MiniCell} ${cellClass}`}
            >{displayChar}</span>
        )
    });

    const gridStyle = {
        gridTemplateRows: `repeat(${grid.height}, 15px)`,
        gridTemplateColumns: `repeat(${grid.width}, 15px)`,
    }

    const componentWidth = grid.width * 15;

    const trashIconClass = deleteAllowed ? (
        styles.TrashIconLive
    ) : (
        styles.TrashIcon
    );

    return (
        <div
            className={styles.Container}
            style={{ width: componentWidth }}
        >
            <div className="d-flex flex-row justify-content-around align-items-center">

                {!puzzle.complete && (
                    <i 
                        className={`fa-solid fa-trash ${trashIconClass} mr-3 ml-2`}
                        onClick={handleDelete}
                    ></i>
                )}

                <span
                    className={styles.PuzzleId}
                ># {id}</span>

                {!puzzle.complete && (
                    <div style={{ display: 'inline-block' }}>
                        <Toggle
                            initial={deleteToggleOn}
                            iconClass="fa-solid fa-trash"
                            handleChange={(val) => handleDeleteToggle(val)}
                        />
                    </div>
                )}

            </div>



            <Link to={`/edit_crossword/${puzzle.id}`}>
                <div
                    className={`${styles.MiniGrid} mt-1`}
                    style={gridStyle}
                >
                    {cells}
                </div>
            </Link>
        </div>

    )
}
