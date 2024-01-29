import styles from '../styles/SiteLogo.module.css';

export const SiteLogo = (props) => {

    const LOGO_COLORS = [
        'red', 'green', 'blue', 'darkred', 'purple', 'orange', 'darkgreen', 'darkblue',
    ]

    const letters = props.mainText.map((char, index) => {
        return (
            <div
                key={`letter_${index}`}
                className="d-inline-block"
                style={{
                    color: `${LOGO_COLORS[index]}`
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
        <div className={`${styles.fancy_text} ${styles.FreckleFaceFont} text-center`}>

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