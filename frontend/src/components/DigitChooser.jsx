import React from 'react'
import styles from '../styles/DigitChooser.module.css'

const DigitChooser = (props) => {

    const { handleDigitChoice, exhaustedDigits } = props;

    const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

    const buttons = digits.map(digit => {
        const active = !exhaustedDigits.includes(digit);
        return (
        <div
            className={active ? styles.Digit : styles.Inactive_Digit}
            key={digit}
            onClick={active ? () => handleDigitChoice(digit) : null}
            data-testid={`digit_chooser_${digit}`}
        >
            {digit}
        </div>
    )})

    return (
        <>
            {buttons}
        </>

    )
}

export default DigitChooser