import { render, screen } from "@testing-library/react";
import user from "@testing-library/user-event";
import '@testing-library/jest-dom';
import DigitChooser from '../DigitChooser';
import styles from '../../styles/DigitChooser.module.css';


describe("DigitChooser tests", () => {
    test('renders the 9 digits with an empty exhaustedDigits array prop', async () => {

        const exhaustedDigits = [];
        const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    
        render(
            <DigitChooser exhaustedDigits={exhaustedDigits}/>
        )
    
        for (let digit of digits) {
            const digitDiv = await screen.findByText(digit);
            expect(digitDiv).toBeInTheDocument();
        }
    });

    test('9 digit divs are rendered', async () => {
        const exhaustedDigits = [];

        render(
            <DigitChooser exhaustedDigits={exhaustedDigits} />
        );

        const digitDivs = await screen.findAllByText(/[1-9]/);
        expect(digitDivs).toHaveLength(9);
    });

    test("renders digits not listed in exhaustedDigits prop with Digit class", async() => {
        const digits = [1, 2, 3];
        const exhaustedDigits = [];

        render(
            <DigitChooser exhaustedDigits={exhaustedDigits} />
        );

        for (let digit of digits) {
            const digitDiv = await screen.findByText(digit);
            expect(digitDiv).toHaveClass(styles.Digit);
        }
    });

    test("renders digits listed in exhaustedDigits prop with Inactive_Digit class", async () => {
        
        const exhaustedDigits = ["1", "4"];

        render(
            <DigitChooser exhaustedDigits={exhaustedDigits} /> 
        )

        for (let digit of exhaustedDigits) {
            const digitDiv = await screen.findByText(digit);
            expect(digitDiv).toHaveClass(styles.Inactive_Digit);
        }
    });

    test("calls handleDigitChoice function prop (passing digit) when any button is pressed", async () => {
        const mockCallback = jest.fn();

        const exhaustedDigits = [];

        render(
            <DigitChooser 
                exhaustedDigits={exhaustedDigits}
                handleDigitChoice={mockCallback} /> 
        );

        const button1 = await screen.findByText("1");
        user.click(button1);
        expect(mockCallback).toHaveBeenCalled();
        expect(mockCallback).toHaveBeenCalledWith("1");

    });
});
