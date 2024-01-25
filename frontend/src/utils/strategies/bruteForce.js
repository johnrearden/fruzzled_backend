import {
    getSearchArraysFromGrid
} from "../solver";
import {
    getColumn,
    getRow,
    getSquare,
    replaceCharAt
} from "../utils";

export const bruteForce = async (grid, callback) => {

    const ALL_POSSIBLES = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

    const unknownCells = [];
    const possibles = [];
    for (let i = 0; i < grid.length; i++) {
        if (grid.charAt(i) === "-") {
            unknownCells.push(i);
            possibles.push(ALL_POSSIBLES.slice());
        }
    }

    let pointer = 0;
    let counter = 0;

    while (true) {

        if (counter++ > 10000000) {
            console.log("10 million iterations");
            break;
        }

        // if (counter % 1000000 === 0) {
        //     let searchArrays = getSearchArraysFromGrid(grid);
        //     callback(grid, searchArrays);
        //     console.log(counter);
        //     await delay(20);
        // }

        

        //await delay(10);

        // 1st halting condition. No possiblilities remain for the first unknown cell
        if (!possibles[0].length) {
            console.log("Puzzle has no solution");
            break;
        }

        

        const cellIndex = unknownCells[pointer];
        let searchArrays;

        // If no possibles remain for this cell, backtrack
        if (!possibles[pointer].length) {
            grid = replaceCharAt(grid, cellIndex, "-");
            //searchArrays = getSearchArraysFromGrid(grid);
            //callback(grid, searchArrays);
            pointer--;
            //console.log('No possibles remain, backtracking');
            continue;
        }

        // If at least one possible remains, try it.
        const candidate = possibles[pointer].pop();
        grid = replaceCharAt(grid, cellIndex, candidate);
        //searchArrays = getSearchArraysFromGrid(grid);
        //callback(grid, searchArrays);
        
        // If the grid is still legal, increment the pointer and refill the possibles array.
        // Otherwise, remove the added candidate and loop again.
        if (candidateIsLegal(cellIndex, grid)) {
            //console.log("candidate", candidate, "is legal in cell", cellIndex, ", advancing", possibles[pointer]);
            pointer++;

            // 2nd halting condition. Last unknown cell has a value.
            if (pointer === unknownCells.length) {
                console.log("puzzle solved!");
                console.log("iteration", counter);
                searchArrays = getSearchArraysFromGrid(grid);
                callback(grid, searchArrays);
                break;
            }
            possibles[pointer] = ALL_POSSIBLES.slice();
            //callback(grid, searchArrays);
        } else {
            //console.log("illegal candidate", candidate, "at cell", cellIndex, possibles[pointer]);
            grid = replaceCharAt(grid, cellIndex, "-");
            //searchArrays = getSearchArraysFromGrid(grid);
            //callback(grid, searchArrays);
        }
    }
}

// eslint-disable-next-line
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const candidateIsLegal = (cellIndex, grid) => {
    const candidate = grid.charAt(cellIndex);

    const row = getRow(cellIndex).filter(idx => idx !== cellIndex);
    const col = getColumn(cellIndex).filter(idx => idx !== cellIndex);
    const square = getSquare(cellIndex).filter(idx => idx !== cellIndex);

    const allComparators = [...row, ...col, ...square];
    for (let i = 0; i < allComparators.length; i++) {
        if (candidate === grid.charAt(allComparators[i])) {
            return false;
        }
    }
    return true;
}

