import { render, screen } from "@testing-library/react";
import user from "@testing-library/user-event";
import '@testing-library/jest-dom';
import PuzzleCell from "../PuzzleCell";
import styles from '../../styles/PuzzleCell.module.css';

describe("PuzzleCells", () => {

    test("should render the value prop if value is digit", () => {
        const value = "1";
        const index = 0;
        const selected = false;
        const warning = false;
        const illegal = false;
        const correct = false;

        render(
            <PuzzleCell value={value} index={index} selected={selected}
                warning={warning} illegal={illegal} correct={correct}
                loaded={true}/>
        );

        const digitDiv = screen.getByText(value);
        expect(digitDiv).toBeInTheDocument();
        expect(digitDiv).toHaveTextContent("1");
    });

    test("should render an empty string if value is not digit", () => {
        const value = "-";
        const index = 0;
        const selected = false;
        const warning = false;
        const illegal = false;
        const correct = false;

        const { container } = render(
            <PuzzleCell value={value} index={index} selected={selected}
                warning={warning} illegal={illegal} correct={correct}
                loaded={true}/>
        );

        const digitDiv = container.querySelector("[aria-label='puzzle cell']")
        expect(digitDiv).toBeInTheDocument();
        expect(digitDiv).toHaveTextContent("");
    });

    it("should call the handleSelection function prop on user click", () => {
        const value = "1";
        const index = 0;
        const selected = false;
        const warning = false;
        const illegal = false;
        const correct = false;

        const mockCallback = jest.fn();

        render(
            <PuzzleCell value={value} index={index} selected={selected}
                warning={warning} illegal={illegal} correct={correct}
                handleSelection={mockCallback} loaded={true}/>
        );

        const digitDiv = screen.getByText(value);
        user.click(digitDiv);

        expect(mockCallback).toHaveBeenCalled();
        expect(mockCallback).toHaveBeenCalledWith(index);
    });

    it("should have the class 'Selected' if props.selected is true", () => {
        const value = "1";
        const index = 0;
        const selected = true;
        const warning = false;
        const illegal = false;
        const correct = false;

        render(
            <PuzzleCell value={value} index={index} selected={selected}
                warning={warning} illegal={illegal} correct={correct}
                loaded={true}/>
        );

        const digitDiv = screen.getByText(value);
        expect(digitDiv).toHaveClass(styles.Selected);
    })

    it("should have the class 'Warning' if props.warning is true", () => {
        const value = "1";
        const index = 0;
        const selected = false;
        const warning = true;
        const illegal = false;
        const correct = false;

        render(
            <PuzzleCell value={value} index={index} selected={selected}
                warning={warning} illegal={illegal} correct={correct}
                loaded={true}/>
        );

        const digitDiv = screen.getByText(value);
        expect(digitDiv).toHaveClass(styles.Warning);
    });

    it("should have the class 'Clashing_cell' if props.illegal is true", () => {
        const value = "1";
        const index = 0;
        const selected = false;
        const warning = false;
        const illegal = true;
        const correct = false;

        render(
            <PuzzleCell value={value} index={index} selected={selected}
                warning={warning} illegal={illegal} correct={correct}
                loaded={true}/>
        );

        const digitDiv = screen.getByText(value);
        expect(digitDiv).toHaveClass(styles.Clashing_Cell);
    });

    it("should have the class 'Offending_Choice' if props.selected and props.warning are true", () => {
        const value = "1";
        const index = 0;
        const selected = true;
        const warning = true;
        const illegal = false;
        const correct = false;

        render(
            <PuzzleCell value={value} index={index} selected={selected}
                warning={warning} illegal={illegal} correct={correct}
                loaded={true}/>
        );

        const digitDiv = screen.getByText(value);
        expect(digitDiv).toHaveClass(styles.Offending_Choice);
    })
})