import React from 'react';
import styles from '../styles/Modal.module.css'

export const Modal = ({
    show, 
    onHide,
    children
}) => {


    return (
        <div className={styles.Backdrop}>
            {children}
        </div>
    )
}