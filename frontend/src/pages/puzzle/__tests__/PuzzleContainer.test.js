import { screen, render } from "@testing-library/react";
import '@testing-library/jest-dom';
import user from "@testing-library/user-event";
import PuzzleContainer from "../PuzzleContainer";
import { PuzzleHistoryProvider } from '../../../contexts/PuzzleHistoryContext';
import { MemoryRouter, Route } from "react-router-dom/cjs/react-router-dom";
import { axiosReq } from "../../../api/axiosDefaults";
import { getColumn, getRow, getSquare } from "../../../utils/utils";
import styles from "../../../styles/PuzzleCell.module.css";

const TEST_GRID = "-387642--16---8-3-4791-26--3------2--2-34--51---25-4---13-275--6-7-1----25-6----7";

const smallPause = (millis) => new Promise(resolve => setTimeout(resolve(), millis));

beforeEach(() => {
    jest.spyOn(axiosReq, 'get').mockResolvedValue({
        data: {
            "id": 13,
            "grid": TEST_GRID,
            "created_on": "2023-12-19T19:53:45.768902Z",
            "difficulty": 0,
            "instances_created": 400,
            "instances_completed": 73,
            "creator": "admin",
            "is_owner": true,
            "start_time": "2024-01-17T22:49:03.294509"
        }
    })
})

describe("A PuzzleContainer", () => {

    const renderComponent = () => {
        render (
            <PuzzleHistoryProvider>
                <MemoryRouter initialEntries={["/get_puzzle/0"]}>
                    <Route path="/get_puzzle/:difficulty">
                        <PuzzleContainer />
                    </Route>
                </MemoryRouter>
            </PuzzleHistoryProvider>
        );
    }
    
    it("should change the content of the selected cell when a Digit button is pressed", async () => {
    
        renderComponent();

        const digit = "2";
        const digitButton = await screen.findByTestId(`digit_chooser_${digit}`);

        expect(digitButton).toBeInTheDocument();
        user.click(digitButton);

        const cellZero = await screen.findByTestId('puzzle_cell_0');
        expect(cellZero.textContent).toMatch(digit);
    });

    it("should render each cell with the appropriate digit or empty string", async() => {

        renderComponent();

        const cells = await screen.findAllByTestId(/puzzle_cell_/i);
        cells.map((cell, idx) => {
            const char = TEST_GRID.charAt(idx);
            const expectedText = char === "-" ? "" : char;
            expect(cell.textContent).toMatch(expectedText);
        })
        expect(cells).toHaveLength(81);
    });

    it("should highlight a cell if the user clicks it", async () => {

        renderComponent();

        const cellIndex = 10;
        let clickedCell = await screen.findByTestId(`puzzle_cell_${cellIndex}`);
        user.click(clickedCell);

        clickedCell = await screen.findByTestId(`puzzle_cell_${cellIndex}`);

        expect(clickedCell).toHaveClass(styles.Selected);
    })

    it("should remove the last digit added when the back button is pressed", async () => {

        renderComponent();

        const testCellIndex = 8;
        const testDigit = "1";
        let testCell = await screen.findByTestId(`puzzle_cell_${testCellIndex}`);
        const digitButton = screen.getByTestId(`digit_chooser_${testDigit}`);
        const backButton = screen.getByRole('button', {name: 'back button'});

        user.click(testCell);
        user.click(digitButton);

        expect(testCell.textContent).toMatch(testDigit);

        user.click(backButton);

        expect(testCell.textContent).toMatch("");

    })

    it("should highlight a column if the user duplicates a digit", async() => {
        
        renderComponent();

        const insertionCell = 7;
        const insertedDigit = "5";
        const columnCells = getColumn(insertionCell);

        let cellToClick = await screen.findByTestId(`puzzle_cell_${insertionCell}`);
        const digitButton = screen.getByTestId(`digit_chooser_${insertedDigit}`)
        user.click(cellToClick);
        user.click(digitButton);
        
        expect(cellToClick.textContent).toMatch(insertedDigit);

        const cells = await screen.findAllByTestId(/puzzle_cell_/i);

        for (let colCell of columnCells) {
            expect(cells[colCell]).toHaveClass(styles.Warning);
        }
    })

    it("should highlight a row if the user duplicates a digit", async() => {
        
        renderComponent();

        const insertionCell = 17;
        const insertedDigit = "8";
        const rowCells = getRow(insertionCell);

        let cellToClick = await screen.findByTestId(`puzzle_cell_${insertionCell}`);
        const digitButton = screen.getByTestId(`digit_chooser_${insertedDigit}`)
        user.click(cellToClick);
        user.click(digitButton);
        
        expect(cellToClick.textContent).toMatch(insertedDigit);

        const cells = await screen.findAllByTestId(/puzzle_cell_/i);

        for (let rowCell of rowCells) {
            expect(cells[rowCell]).toHaveClass(styles.Warning);
        }
    })

    it("should highlight a square if the user duplicates a digit", async() => {
        
        renderComponent();

        const insertionCell = 17;
        const insertedDigit = "2";
        const squareCells = getSquare(insertionCell);

        let cellToClick = await screen.findByTestId(`puzzle_cell_${insertionCell}`);
        const digitButton = screen.getByTestId(`digit_chooser_${insertedDigit}`)
        user.click(cellToClick);
        user.click(digitButton);
        
        expect(cellToClick.textContent).toMatch(insertedDigit);

        const cells = await screen.findAllByTestId(/puzzle_cell_/i);

        for (let squareCell of squareCells) {
            expect(cells[squareCell]).toHaveClass(styles.Warning);
        }
    })
})