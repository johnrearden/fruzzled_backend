import styles from '../styles/crossword/Cell.module.css';

export const Cell = (props) => {

    const cellStyle = {
        minHeight: `clamp(12px, ${props.cellsWidthRatio}vw, ${props.maxDimension}px)`,
        lineHeight: `clamp(12px, ${props.cellsWidthRatio}vw, ${props.maxDimension}px)`,
        fontSize: `clamp(9px, ${props.cellsWidthRatio / 1.3}vw, ${props.maxDimension * 0.75}px)`,
    }

    const styleHighlighted = props.highlighted ? styles.part_of_current_clue : '';
    const styleSelected = props.selected ? styles.selected_cell : '';
    const styleSemantic = props.semantic ? styles.semantic : styles.non_semantic;

    let classString;
    if (props.showCorrectness) {
        const correctnessStyle = props.correct ? '' : styles.incorrect_cell;
        classString = `${styles.cell_div} ${correctnessStyle}`;
    } else {
        classString = `${styles.cell_div} ${styleHighlighted} ${styleSelected} ${styleSemantic}`;
    }

    return props.inUse ? (
        <div
            className={ classString }
            onClick={ () => props.clickHandler(props.index) }
        >
            <span 
                className={ styles.cell_value }
                style={ cellStyle }
            >
                {props.letter}
            </span>
        </div>
    ) 
        : 
    (
        <div 
            className={ styles.closed }
            onClick={props.isEditing ? 
                () => props.clickHandler(props.index) 
                : () => {}}
        ></div>
    )
}