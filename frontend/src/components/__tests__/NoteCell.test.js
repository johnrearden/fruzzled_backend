import { screen, render } from "@testing-library/react";
import NoteCell from "../NoteCell";

describe("A NoteCell component", () => {

    const searchArray = ["1", "3", "8"];

    it("should display nine spans regardless of contents of searchArray", () => {
        render (
            <NoteCell searchArray={searchArray} />
        )
        const innerSpans = screen.getAllByTestId(/note_span/i);

        expect(innerSpans).toHaveLength(9);
    });

    it("should render every digit in the search array in the correct position", () => {
        render (
            <NoteCell searchArray={searchArray} />
        )
        const innerSpans = screen.getAllByTestId(/note_span/i);

        innerSpans.map((span, idx) => {
            const char = (idx + 1).toString();
            if (searchArray.includes(char)) {
                expect(span.textContent).toMatch(char);
            } else {
                expect(span.textContent).toMatch("");
            }
        })
    })
})