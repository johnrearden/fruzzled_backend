import styles from '../styles/anagram/AnagramPuzzle.module.css';
import { useEffect, useState, createRef, useRef, useLayoutEffect } from 'react';
import { usePrevious } from '../utils/utils';
import { AnagramTile } from './AnagramTile';
import { getClosestPosition } from '../utils/utils';

const ANIMATION_DURATION = 400;

export const AnagramPuzzle = ({
    letters,
    parentLetterOrder,
    correctLetters,
    fixedLetters,
    onCorrectOrder,
    outOfTime,
    }) => {

    // State, triggering re-renders
    const [letterOrder, setLetterOrder] = useState([...parentLetterOrder]);
    const previousLetterOrder = usePrevious(letterOrder);
    const [completed, setCompleted] = useState(false);

    // Refs, keeping track of DOM nodes and their bounding rects
    const domRefs = useRef([]);
    const draggedTileRef = useRef(null);
    const containerRef = useRef(null);

    const boundingRects = useRef([]);
    const pointerData = useRef({});

    // Grab the initial bounding rects of the tiles. This will be the canonical
    // source of truth for the tile positions. It assumes that the container is not 
    // resized during the lifetime of the component.
    useLayoutEffect
    (() => {
        const rects = {};
        domRefs.current.forEach((ref, index) => {
            const node = ref.current;
            rects[index] = node.getBoundingClientRect();
        });
        boundingRects.current = rects;
    }, []);


    useEffect(() => {
        setLetterOrder(parentLetterOrder);
    }, [parentLetterOrder]);


    // If the letter order changes, animate the tiles to their new positions.
    useLayoutEffect(() => {
        if (!previousLetterOrder) {
            return;
        }

        letterOrder.forEach((item, index) => {

            const hasMoved = item !== previousLetterOrder[index];
            if (hasMoved) {
                const domNode = domRefs.current[item].current;
                const currentRect = boundingRects.current[index];
                const previousPosition = previousLetterOrder.indexOf(item);
                const previousRect = boundingRects.current[previousPosition];

                const deltaX = previousRect.left - currentRect.left;
                if (deltaX) {
                    // Move to the old position, without animating, on the next frame.
                    requestAnimationFrame(() => {
                        domNode.style.transform = `translateX(${deltaX}px)`;
                        domNode.style.transition = 'transform 0s';

                        // Animate back to the new position on the subsequent frame.
                        requestAnimationFrame(() => {
                            domNode.style.transform = '';
                            domNode.style.transition = `transform ${ANIMATION_DURATION}ms`;
                        });
                    });
                }
            }
        });
    }, [letterOrder, parentLetterOrder, previousLetterOrder]);


    const onPointerDown = (clientX, clientY, letterRefIndex) => {

        if (pointerData.current.clone) {
            return;
        }

        const letterRef = domRefs.current[letterRefIndex];

        const id = parseInt(letterRef.current.id);
        if (fixedLetters[id] || completed || outOfTime) {
            return;
        }

        const scrollTopOffset = document.documentElement.scrollTop;
        const scrollLeftOffset = document.documentElement.scrollLeft;

        const draggedTile = letterRef.current;
        const clone = draggedTile.cloneNode(true);
        draggedTile.classList.add(`${styles.dragged_letter_box}`);
        draggedTileRef.current = draggedTile;

        clone.classList.add(styles.clone);
        const bndRectLeft = letterRef.current.getBoundingClientRect().left;
        const bndRectTop = letterRef.current.getBoundingClientRect().top
        const margin = window.getComputedStyle(letterRef.current).margin.replace('px', '');
        clone.style.position = 'absolute';
        clone.style.pointerEvents = 'none';
        clone.style.left = `${bndRectLeft + scrollLeftOffset - margin}px`;
        clone.style.top = `${bndRectTop + scrollTopOffset - margin}px`;
        containerRef.current.appendChild(clone);
        

        pointerData.current = {
            clone: clone,
            offsetX: clientX - letterRef.current.getBoundingClientRect().left,
            offsetY: clientY - letterRef.current.getBoundingClientRect().top,
            mouseX: clientX,
            mouseY: clientY,
        }
    }


    const onPointerMove = (clientX, clientY) => {

        if (!pointerData.current.clone) {
            return;
        }

        if (!draggedTileRef.current) {
            return;
        }
        const data = pointerData.current;
        const clone = data.clone;
        const draggedNodeId = parseInt(draggedTileRef.current.id);
        const closestPosition = getClosestPosition(clone, boundingRects.current);
        const closestIsFixed = fixedLetters[closestPosition] === true;
        const closestIsSelf = closestPosition === letterOrder.indexOf(draggedNodeId);

        if (!closestIsFixed && !closestIsSelf) {
            const newOrder = [...letterOrder];
            const dragged = letterOrder.indexOf(draggedNodeId);
            [newOrder[closestPosition], newOrder[dragged]] = [newOrder[dragged], newOrder[closestPosition]];
            setLetterOrder(newOrder);
        }

        if (clone) {
            clone.style.left = `${clientX - data.offsetX}px`;
            clone.style.top = `${clientY - data.offsetY}px`;
            const containingRect = containerRef.current.getBoundingClientRect();
            const tolerance = 0;
            
            if (
                clientX < containingRect.left - tolerance
                || clientX > containingRect.right + tolerance
                || clientY < containingRect.top - tolerance
                || clientY > containingRect.bottom + tolerance) {
                handleDragStop();
            }
            pointerData.current = {
                ...data,
                mouseX: clientX,
                mouseY: clientY,
            };
        }
    }


    const handleDragStop = () => {
        const data = pointerData.current;
        const clone = data.clone;
        const draggedTile = draggedTileRef.current;

        if (clone && draggedTile) {
            // Check if the letter order is correct.
            let isCorrect = true;
            if (letterOrder.length > 0) {
                letterOrder.forEach((item, index) => {
                    const first = correctLetters[index].toLowerCase();
                    const second = letters[item].toLowerCase();
                    const lettersAreInterchangeable = first === second;
                    if (!lettersAreInterchangeable) {
                        isCorrect = false;
                    }
                });
                if (isCorrect) {
                    setCompleted(true);
                    // setTimeout(() => onCorrectOrder(), 1500);
                    onCorrectOrder();
                }
            }

            // Animate the clone back to the dragged tile.
            pointerData.current.clone = null;
            const cloneLeft = clone.getBoundingClientRect().left;
            const cloneTop = clone.getBoundingClientRect().top;
            clone.remove();
            draggedTile.classList.remove(`${styles.dragged_letter_box}`);
            draggedTileRef.current = null;

            const draggedTilePosition = letterOrder.indexOf(parseInt(draggedTile.id));
            const draggedTileRect = boundingRects.current[draggedTilePosition];
            const deltaX = cloneLeft - draggedTileRect.left;
            const deltaY = cloneTop - draggedTileRect.top;
            requestAnimationFrame(() => {
                draggedTile.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
                draggedTile.style.transition = `transform 0s`;
                requestAnimationFrame(() => {
                    draggedTile.style.transform = '';
                    draggedTile.style.transition = `transform ${ANIMATION_DURATION * 0.25}ms`;
                });
            });
        }
    }

    const anagramTiles = letterOrder.map((index) => {
        const ref = createRef()
        domRefs.current[index] = ref;

        return (
            <AnagramTile
                key={`tile-${index}`}
                letter={letters[index]}
                ref={ref}
                id={index}
                fixed={fixedLetters[index] === true}
                outOfTime={outOfTime}
                completed={completed}
                onPointerDown={onPointerDown}
                draggable={false}
                fingerPointer={true}
            />
        );
    });

    
    

    return (
        <div
            className={styles.outer_container}
            onPointerMove={(event) => onPointerMove(event.clientX, event.clientY)}
            onPointerUp={handleDragStop}
        >
            <div
                ref={containerRef}
                className={styles.anagram_holder}
            >
                {anagramTiles}
            </div>
        </div>
    )
}