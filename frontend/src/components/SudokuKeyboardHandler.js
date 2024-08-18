    import React, { useCallback, useEffect } from 'react';

    const SudokuKeyboardHandler = ({
        selectedCellIndex,
        handleCellSelection,
        handleDigitChoice,
        exhaustedDigits,
        handleUndo
    }) => {

        /**
         * Handle the four arrow keys keyup event, and the 9 digit keys 1-9
         */
        const handleKeyPress = useCallback((event, keycode) => {

            if (keycode === 37) { // left arrow 
                let currentIndex = selectedCellIndex;
                if (currentIndex % 9 === 0) {
                    currentIndex += 8;
                } else {
                    currentIndex--;
                }
                handleCellSelection(currentIndex);

            } else if (keycode === 39) { // right arrow
                let currentIndex = selectedCellIndex;
                if (currentIndex % 9 === 8) {
                    currentIndex -= 8;
                } else {
                    currentIndex++;
                }
                handleCellSelection(currentIndex);

            } else if (keycode === 38) { // up arrow
                let currentIndex = selectedCellIndex;
                if (currentIndex <= 8) {
                    currentIndex += 72;
                } else {
                    currentIndex -= 9;
                }
                handleCellSelection(currentIndex);

            } else if (keycode === 40) { // down arrow
                let currentIndex = selectedCellIndex;
                if (currentIndex >= 72) {
                    currentIndex -= 72;
                } else {
                    currentIndex += 9;
                }
                handleCellSelection(currentIndex);

            } else if ((keycode >= 49 && keycode <= 57) || (keycode >= 97 && keycode <= 105)) {
                // Either top row number keys or numeric keypad
                if (!exhaustedDigits.includes(event.key)) {
                    handleDigitChoice(event.key);
                }
            } else if (event.key === 'Backspace') {
                handleUndo();
            }

        }, [selectedCellIndex, handleCellSelection]);


        /**
         * Add key listener to window on page load, and remove it when page is 
         * closed
         */
        useEffect(() => {
            
            const handleTyping = (event) => {
                handleKeyPress(event, event.keyCode);
            }
            window.addEventListener('keyup', handleTyping);
            return () => window.removeEventListener('keyup', handleTyping);
        }, [selectedCellIndex, handleKeyPress]);
    }

    export default SudokuKeyboardHandler