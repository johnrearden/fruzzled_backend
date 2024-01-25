import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom';
import Puzzle from "../Puzzle";
import styles from "../../styles/PuzzleCell.module.css";

const SAMPLE_GRID = "25------4----5---9-8-3--25---------2-3---7---8---4-16-1---6-58--------9---64-----";

describe("A Puzzle component", () => {

    it("should render a cell for each character in the grid prop", () => {
        render(
            <Puzzle 
                grid={SAMPLE_GRID}
                searchArray={[]}
                showNotes={false}
                selectedCell={-1}
                warningGroup={[]}
                clashingCell={-1}
                completed={false}  
                loaded={true}  
            />
        );
        const cells = screen.getAllByTestId(/puzzle_cell_/i);
        expect(cells).toHaveLength(SAMPLE_GRID.length);
    });

    it("should, when showNotes prop is true, show as many note cells as there are unknowns", () => {
        const searchArray = new Array(81).fill([]);
        
        render(
            <Puzzle 
                grid={SAMPLE_GRID}
                searchArray={searchArray}
                showNotes={true}
                selectedCell={-1}
                warningGroup={[]}
                clashingCell={-1}
                completed={false}  
                loaded={true}
            />
        );
        const noteCellCount = SAMPLE_GRID.split("").filter(char => char === "-").length;
        const noteCells = screen.getAllByTestId(/note_cell/i);
        expect(noteCells).toHaveLength(noteCellCount);
    })

    it("should show correct value based on character in grid", () => {
        render(
            <Puzzle 
                grid={SAMPLE_GRID}
                searchArray={[]}
                showNotes={false}
                selectedCell={-1}
                warningGroup={[]}
                clashingCell={-1}
                completed={false} 
                loaded={true}   
            />
        );
        const cells = screen.getAllByTestId(/puzzle_cell_/i);
        cells.map((cell, idx) => {
            const char = SAMPLE_GRID.charAt(idx);
            if (char === "-") {
                expect(cell.textContent).toMatch("");
            } else {
                expect(cell.textContent).toMatch(char);
            }
        })
    })

    it("should render any cell in the warning group with the warning class", () => {
        const warningGroup = [0, 1, 2, 3, 78];
        render(
            <Puzzle 
                grid={SAMPLE_GRID}
                searchArray={[]}
                showNotes={false}
                selectedCell={-1}
                warningGroup={warningGroup}
                clashingCell={-1}
                completed={false}   
                loaded={true} 
            />
        );
        const cells = screen.getAllByTestId(/puzzle_cell_/i);
        cells.map((cell, idx) => {
            if (warningGroup.includes(idx)) {
                expect(cell).toHaveClass(styles.Warning);
            } else {
                expect(cell).not.toHaveClass(styles.Warning);
            }
        })
    })
})