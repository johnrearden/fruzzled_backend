import styles from '../styles/CompletenessDisplay.module.css';

export const CompletenessDisplay = ({ completenessPercentage, shorthand }) => {

    const clipStyle = {
        clipPath: `polygon(0 0, ${completenessPercentage}% 0, ${completenessPercentage}% 100%, 0 100%)`
    }

    const message = shorthand ? `${completenessPercentage}%` : `${completenessPercentage}% complete`;

    return (

        <>
            <div className={styles.container}>
                <div className={styles.underlayer}>
                    {message}
                </div>
                <div className={styles.overlayer} style={clipStyle}>
                    {message}
                </div>
            </div>
            
        </>

    )
}