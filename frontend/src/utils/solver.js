import {
    arraysHaveSameItems,
    getColumn,
    getRow,
    getSquare,
    replaceCharAt
} from "./utils"
import {
    nonets
} from "../constants/nonets";
import { hiddenPairs } from "./strategies/hiddenPairs";

export const solvePuzzle = (currentGrid, searchArrayOriginal, callback) => {

    // Create a copy of the grid and searchArray, to avoid mutating state directly.
    let grid = currentGrid.slice();

    const searchArray = searchArrayOriginal.map((array) => [...array])

    hiddenPairs(grid, searchArray, callback);

    // Create array listing unsolved cells
    //const unsolvedIndices = new Array(81).fill(true);

    for (let i = 0; i < 81; i++) {
        if (grid.charAt(i) !== '-') {
            searchArray[i] = [];
        }
        if (searchArray[i].length === 0) {
            continue;
        }
        const row = getRow(i).filter((item) => item !== i);
        const col = getColumn(i).filter((item) => item !== i);
        const square = getSquare(i).filter((item) => item !== i);

        // Get set of cellIndices in row/col/square combination
        const concat = [...row, ...col, ...square];
        const cellIndices = new Set(concat);
        const existingDigits = new Set();
        for (const index of cellIndices) {
            const digit = grid.charAt(index);
            existingDigits.add(digit);
        }

        searchArray[i] = searchArray[i].filter((item) => !existingDigits.has(item));
        if (searchArray[i].length === 1) {
            grid = replaceCharAt(grid, i, searchArray[i][0]);
            console.log('process of elimination, putting', searchArray[i][0], 'in', i);
            //console.log(grid);
            callback(grid, searchArray);
        } 
    }

    //return;

    // Check nonets.

    for (let n = 0; n < nonets.length; n++) {
        let nonet = nonets[n];
        // console.log('88888888888    nonet' + n + '    88888888888888')

        // Identify the digits missing from each nonet, and list the unknown cells
        let missingDigits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
        const existingDigits = [];
        const unknownCells = [];
        for (let cell of nonet) {
            existingDigits.push(grid.charAt(cell));
            if (grid.charAt(cell) === "-") {
                unknownCells.push(cell);
            }
            //console.log(existingDigits);
        }
        missingDigits = missingDigits.filter(digit => !existingDigits.includes(digit));
        //console.log('missingDigits', JSON.stringify(missingDigits, null, 2))
        //console.log('unknownCells', JSON.stringify(unknownCells, null, 2))

        // Check each unknown cell. If any missing digit occurs only in one cell, 
        // that cell is now known.

        // number of times each missingDigit occurs in the unknown cells
        const occurencesCount = {
            "1": 0,
            "2": 0,
            "3": 0,
            "4": 0,
            "5": 0,
            "6": 0,
            "7": 0,
            "8": 0,
            "9": 0,
        };

        // the last occurence (only occurence if count is 1) of the missing digit.
        const lastOccurence = {};

        for (let cell of unknownCells) {
            //console.log('working on cell', cell);
            const missingFromCell = searchArray[cell];
            //console.log('missingFromCell', cell, JSON.stringify(missingFromCell, null, 2));
            for (let digit of missingDigits) {
                //console.log(digit, 'in missingFromCell', missingFromCell.includes(digit));
                if (missingFromCell.includes(digit)) {
                    //console.log(digit + ' missing from ' + cell);
                    const newCount = occurencesCount[digit] + 1;
                    occurencesCount[digit] = newCount;
                    lastOccurence[digit] = cell;
                }
            }
        }

        //console.log('occurencesCount', JSON.stringify(occurencesCount, null, 2));
        //console.log('lastOccurence', JSON.stringify(lastOccurence, null, 2));

        for (let [digit, count] of Object.entries(occurencesCount)) {
            if (count === 1) {
                const cell = lastOccurence[digit];
                console.log(digit, 'only occurs once in cell', cell, 'returning');
                grid = replaceCharAt(grid, cell, digit);
                callback(grid, searchArray);
                return;
            }
        }
    }

    console.log('No progress with method 2..............................');

    //rowsInSquares(grid, searchArray, callback);

    //colsInSquares(grid, searchArray, callback);

    //obviousPairs(grid, searchArray, callback);

    


}

export const rowsInSquares = (grid, searchArray, callback) => {
    for (let n = 18; n < 27; n++) {
        const square = nonets[n];
        const rows = new Array(3);
        for (let i = 0; i < 3; i++) {
            rows[i] = new Set();
        }

        // Get 2 neighbouring squares.
        let neighbours = [];
        if (n % 3 === 0) {
            neighbours = [nonets[n + 1], nonets[n + 2]];
        } else if (n % 3 === 1) {
            neighbours = [nonets[n - 1], nonets[n + 1]];
        } else {
            neighbours = [nonets[n - 2], nonets[n - 1]];
        }
        //console.log('neightbours for  ', n, ' : ',neighbours)

        // Combine the searchArrays for the cells in each row.
        for (let i = 0; i < 9; i += 1) {
            const cell = square[i];
            const schArr = searchArray[cell]
            //console.log('schArr for cell', cell, 'is', schArr);
            for (let item of schArr) {
                rows[Math.floor(i / 3)].add(item);
            }
        }
        // for (let row of rows) {
        //     console.log(Array.from(row));
        // }

        // Find if any digits only occur in one combined searchArray
        const occurCount = Array(9).fill(0);
        const lastOccurs = Array(9).fill(-1);
        for (let i = 0; i < 9; i++) {
            const digit = (i + 1).toString();
            for (let j = 0; j < 3; j++) {
                if (rows[j].has(digit)) {
                    occurCount[i]++;
                    lastOccurs[i] = j;
                }
            }
            //console.log('digit ', digit, 'appears ', occurCount[i], ' times, last in row ' + lastOccurs[i]);
            if (occurCount[i] === 1) {
                for (let neighbour of neighbours) {
                    const rowStartCell = lastOccurs[i] * 9;
                    for (let k = 0; k < 3; k++) {
                        const cell = neighbour[0] + rowStartCell + k;
                        //console.log('cell is ', cell, ', neighbour start : ', neighbour[0], ', rowStartCell : ', rowStartCell)
                        searchArray[cell] = searchArray[cell].filter(item => item !== digit);
                        //console.log(searchArray[cell]);
                        //console.log('removing ', digit, ' from cell ', cell);
                        //console.log('rows from squares, searchArrays pruned');
                        callback(grid, searchArray);
                    }
                }
            }

        }
    }
}

export const colsInSquares = (grid, searchArray, callback) => {
    console.log('cols in squares!!!!!!!!!!!!!!!!!!!!!!!!!')
    for (let n = 18; n < 27; n++) {
        const square = nonets[n];
        const cols = new Array(3);
        for (let i = 0; i < 3; i++) {
            cols[i] = new Set();
        }

        // Get 2 neighbouring squares.
        let neighbours = [];
        if (Math.floor((n - 18) / 3) === 0) {
            neighbours = [nonets[n + 3], nonets[n + 6]];
        } else if (Math.floor((n - 18) / 3) === 1) {
            neighbours = [nonets[n - 3], nonets[n + 3]];
        } else {
            neighbours = [nonets[n - 6], nonets[n - 3]];
        }
        //console.log('neighbours for  ', n, ' : ',neighbours)

        // Combine the searchArrays for the cells in each column.
        for (let i = 0; i < 9; i += 1) {
            const cell = square[i];
            const schArr = searchArray[cell];
            //console.log('sArr for ', cell, ' : ', schArr);
            for (let item of schArr) {
                cols[i % 3].add(item);
            }
        }
        // for (let col of cols) {
        //     console.log(Array.from(col));
        // }

        // Find if any digits only occur in one combined searchArray
        const occurCount = Array(9).fill(0);
        const lastOccurs = Array(9).fill(-1);
        for (let i = 0; i < 9; i++) {
            const digit = (i + 1).toString();
            for (let j = 0; j < 3; j++) {
                if (cols[j].has(digit)) {
                    occurCount[i]++;
                    lastOccurs[i] = j;
                }
            }
            //console.log('digit ', digit, 'appears ', occurCount[i], ' times, last in col ' + lastOccurs[i]);
            
            if (occurCount[i] === 1) {
                for (let neighbour of neighbours) {
                    const colStartCell = lastOccurs[i];
                    
                    for (let k = 0; k < 3; k++) {
                        const cell = neighbour[0] + colStartCell + (k * 9);
                        //console.log('cell is ', cell, ', neighbour start : ', neighbour[0], ', colStartCell : ', colStartCell)
                        searchArray[cell] = searchArray[cell].filter(item => item !== digit);
                        //console.log(searchArray[cell]);
                        //console.log('removing ', digit, ' from cell ', cell);
                        console.log('cols from squares, searchArrays pruned');
                        callback(grid, searchArray);
                        
                    }
                }
            }
        }
    }


}

// eslint-disable-next-line
const obviousPairs = (grid, searchArray, callback) => {
    let nonet;
    for (let n = 0; n < 27; n++) {
        nonet = nonets[n];

        // Get cells that only have 2, and keep refs to the others also.
        let pairs = [];
        const others = [];

        for (let cell of nonet) {
            if (searchArray[cell].length === 2) {
                pairs.push(cell);
            } else {
                others.push(cell);
            }
        }
        
        // check if any of the pairs have the same digits.
        const digitsToEliminateFromOthers = [];
        for (let i = 0; i < pairs.length; i++) {
            for (let j = 0; j < pairs.length; j++) {
                if (i !== j) {
                    const pair1 = searchArray[pairs[i]].sort();
                    const pair2 = searchArray[pairs[j]].sort();
                    if (arraysHaveSameItems(pair1, pair2)) {
                        //console.log('nonet : ', n);
                        //console.log('same items ', pairs[i], ', ', pairs[j]);
                        digitsToEliminateFromOthers.push(...pair1);
                        //console.log('digitsToEliminate : ', digitsToEliminateFromOthers);
                        let digitsRemoved = false;

                        // Remove this pair from the nonet's cells, and eliminate it's digits
                        const pairedCells = [pairs[i], pairs[j]];
                        const rest = [...nonet].filter(cell => !pairedCells.includes(cell));

                        for (let cell of rest) {
                            const len = searchArray[cell].length;
                            searchArray[cell] = searchArray[cell].filter(dgt => !pair1.includes(dgt));
                            if (searchArray[cell].length < len) {
                                digitsRemoved = true;
                            }
                            //console.log('other : ', cell, ', array: ', searchArray[cell])
                        }
                        if (digitsRemoved) {
                            console.log('obvious pairs - searchArrays pruned');
                            callback(grid, searchArray);
                        }
                    }
                }
            }
        }

    }


}

export const createSearchArray = () => {
    const searchArray = new Array(81);
    for (let i = 0; i < 81; i++) {
        searchArray[i] = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
    }
    return searchArray;
}

export const getSearchArraysFromGrid = (grid) => {
    const searchArray = new Array(81);
    for (let i = 0; i < 81; i++) {
        searchArray[i] = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
    }
    for (let i = 0; i < 81; i++) {
        if (grid.charAt(i) !== '-') {
            searchArray[i] = [];
        }
        if (searchArray[i].length === 0) {
            continue;
        }
        const row = getRow(i).filter((item) => item !== i);
        const col = getColumn(i).filter((item) => item !== i);
        const square = getSquare(i).filter((item) => item !== i);

        // Get set of cellIndices in row/col/square combination
        const concat = [...row, ...col, ...square];
        const cellIndices = new Set(concat);
        const existingDigits = new Set();
        for (const index of cellIndices) {
            const digit = grid.charAt(index);
            existingDigits.add(digit);
        }

        searchArray[i] = searchArray[i].filter((item) => !existingDigits.has(item));
    }
    return searchArray;
}

export const checkGridLegality = (grid, searchArrays) => {
    for (let i = 0; i < grid.length; i++) {
        if (grid.charAt(i) === '-' && searchArrays[i].length === 0) {
            console.log('searchArray for empty  cell', i, 'is empty');
            return false;
        }
    }
    return true;
}