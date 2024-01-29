import classNames from 'classnames';
import styles from '../styles/ButtonCustom.module.css';
import { useRef, useEffect } from 'react';

export const Button = ({ children, extraClasses, ...rest }) => {

    const timerRef = useRef(null);

    useEffect(() => {
        return () => clearTimeout(timerRef.current);
    }, []);

    const allClassNames = classNames(
        styles.standard_button,
        extraClasses,
    )

    const handleClick = (event) => {
        
        clearTimeout(timerRef.current);

        event.target.classList.add(styles.standard_button_depress);
        
        timerRef.current = setTimeout(() => {
            event.target.classList.remove(styles.standard_button_depress);
        }, 300);
    }

    return (
        <button 
            className={allClassNames}
            onClick={handleClick}
            {...rest}
        >
            {children}
        </button>
    )

}