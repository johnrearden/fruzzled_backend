import React, { forwardRef } from 'react';
import styles from '../styles/anagram/AnagramTile.module.css';
import { LOGO_COLORS } from '../constants/constants';


// eslint-disable-next-line react/display-name
export const AnagramTile = forwardRef(({ 
    letter, 
    id, 
    fixed, 
    completed, 
    onPointerDown}, ref) => {

    let className = styles.letter_box;
    let delayStyle = {};
    if (completed) {
        const delay = Math.random() * 500;
        const color_choice = LOGO_COLORS[Math.floor(Math.random() * LOGO_COLORS.length)];
        delayStyle = {
            animationDelay: `${delay}ms`,
            '--logo_color_choice': `${color_choice}`,
            
        };
        className = `${styles.letter_box} ${styles.correct} ${styles.color_flash}`;
        
    } else if (fixed) {
        className = `${styles.letter_box} ${styles.spin_to_correct}`;
    } 

    return (
        <div
            ref={ref}
            id={id}
            onPointerDown={(event) => onPointerDown(event.clientX, event.clientY, id)}
            className={ className }
            style={ delayStyle }
            >
            {letter}
            {/* <span className={styles.finger}><FaHandPointer/></span> */}
        </div>
    );
});