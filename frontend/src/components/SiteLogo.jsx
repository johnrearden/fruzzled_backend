import styles from '../styles/SiteLogo.module.css';

export const SiteLogo = (props) => {

    const LOGO_COLORS = [
        '#916403', 
        '#054412', 
        '#4d1ebd', 
        'darkred', 
        'purple', 
        '#8a8816', 
        'darkgreen', 
        '#2368cf',
    ]

    const letters = props.mainText.map((char, index) => {
        return (
            <div
                key={`letter_${index}`}
                className="d-inline-block letter"
                style={{
                    color: 'var(--scnd-color)'
                }}
            >
                {char}
            </div>
        )
    });

    const shadows = props.mainText.map((char, index) => {
        return (
            <div
                key={`shadow_${index}`}
                className='d-inline-block'
            >
                {char}
            </div>
        )
    })

    return (
        <div className={`${styles.fancy_text} ${styles.FreckleFaceFont} text-center mt-5`}>

            <div className={styles.app_logo}>
                <div className={styles.hoppers}>
                    {letters}
                </div>
                <div
                    className={styles.suffix}
                >
                    .ie
                </div>
            </div>

            <div className={styles.shadow}>
                <div className={styles.hoppers}>
                    {shadows}
                </div>
                <div
                    className={styles.suffix}
                >
                    .ie
                </div>
            </div>

        </div>

    )
}