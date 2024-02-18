export const OPEN = '#';
export const CLOSED = '-';
export const START = "S";
export const MIDDLE = "M";
export const END = "E";
export const NONE = "-";

export class Clue {
    constructor(startRow, startCol, orientation) {
        this.clue = 'No clue yet';
        this.cellList = [];
        this.orthogs = [];
        this.word_lengths = '';
        this.orientation = orientation;
        this.startRow = startRow;
        this.startCol = startCol;
        this.clue_number = 0;
        this.len = 1;
    }

    convertToObject() {
        const list = [];
        for (let cell of this.cellList) {
            const char = cell.value === '' ? '#' : cell.value;
            list.push(char);
        }
        const solution_string = list.join('');
        return {
            'solution': solution_string,
            'clue': this.clue,
            'clue_number': this.clue_number,
            'orientation': this.orientation,
            'start_row': this.startRow,
            'start_col': this.startCol,
            'word_lengths': this.word_lengths,
        }
    }

    getCurrentSolution = () => {
        const array = [];
        for (let cell of this.cellList) {
            array.push(cell.value);
        }
        return array.join('');
    }
}

export class Cell {
    constructor(row, col, value, isOpen, index) {
        this.row = row;
        this.col = col;
        this.value = value;
        this.isOpen = isOpen;
        this.index = index;
        this.clueAcross = null;
        this.clueDown = null;
    }
}

export class Grid {
    constructor(gridAsJSON, clueData) {
        this.width = gridAsJSON.width;
        this.height = gridAsJSON.height;
        this.cells = []
        this.clues = []
        this.currentHighlightedCell = null;
        this.currentHighlightedClue = null;
        for (let i = 0; i < gridAsJSON.cells.length; i++) {
            const cell = new Cell(
                Math.floor(i / this.width),
                i % this.width,
                '',
                gridAsJSON.cells[i] === '#',
                i);
            this.cells.push(cell);
        }
        for (let item of clueData) {
            const newClue = new Clue(item.start_row, item.start_col, item.orientation);
            newClue.clue = item.clue;
            this.clues.push(newClue);

            // Give each cell in this.cells its correct value
            const startIndex = newClue.startCol + newClue.startRow * this.width;
            for (let i = 0; i < item.solution.length; i++) {
                const or = newClue.orientation
                const index = or === 'AC' ? startIndex + i : startIndex + i * this.width;
                const val = item.solution[i];
                this.cells[index].value = val;
                newClue.cellList.push(this.cells[index]);
            }
        }

        this.reindex();
    }

    getGridObject = () => {
        const cellValues = [];
        for (let cell of this.cells) {
            const value = cell.isOpen ? '#' : '-';
            cellValues.push(value);
        }
        const gridString = cellValues.join('');
        return {
            'grid_string': gridString,
            'width': this.width,
            'height': this.height,
        }
    }

    getGridString = () => {
        const cellValues = [];
        for (let cell of this.cells) {
            const char = cell.value === '' ? '#' : cell.value;
            const value = cell.isOpen ? char : '-';
            cellValues.push(value);
        }
        return cellValues.join('');
    }

    reindex = () => {

        // Place the clues in a Map keyed by their solutions, so that their clue and wordLength
        // fields can be conserved as long as the cells they previously occupied have not been deleted.
        const clueCache = new Map();
        const wordLengthCache = new Map();
        for (let item of this.clues) {
            const key = item.getCurrentSolution();
            if (!key.includes("#")) {
                clueCache.set(key, item.clue);
                wordLengthCache.set(key, item.word_lengths);
            }
        }

        // Clear the grid's clue list.
        this.clues = [];

        // Clear each cells clue attributes
        for (let cell of this.cells) {
            cell.clueAcross = null;
            cell.clueDown = null;
        }

        // Iterate through the cells, assigning each one's clueAcross and
        // clueDown attribute a clue, that clue being shared with it's 
        // open neighbours.
        for (let i = 0; i < this.cells.length; i++) {

            // If cell is closed, skip it - it's not part of a clue
            if (!this.cells[i].isOpen) {
                continue;
            }

            // Check cell neighbours
            const hasLeft = hasLeftNeighbour(this.cells[i], this);
            const hasRight = hasRightNeighbour(this.cells[i], this);
            const hasTop = hasTopNeighbour(this.cells[i], this);
            const hasBottom = hasBottomNeighbour(this.cells[i], this);
            let orthogType = NONE;

            // If cell has no left neighbour, but has a right neighbour, 
            // it starts an AC clue. Create an AC clue, and place a reference
            // to it in this cell.
            if (!hasLeft && hasRight) {
                const clue = new Clue(
                    Math.floor(i / this.width),
                    i % this.width,
                    'AC'
                );
                clue.cellList.push(this.cells[i]);
                this.clues.push(clue);
                this.cells[i].clueAcross = clue;

                // Check the orthogType
                if (hasTop && !hasBottom) orthogType = END;
                if (!hasTop && hasBottom) orthogType = START;
                if (hasTop && hasBottom) orthogType = MIDDLE;
                clue.orthogs.push(orthogType);
            }

            // If cell has a left neighbour, it shares the same clue reference.
            // Increment this clue's length value, len.
            if (hasLeft) {
                const sharedClue = this.cells[i - 1].clueAcross;
                sharedClue.len += 1;
                sharedClue.cellList.push(this.cells[i]);
                this.cells[i].clueAcross = sharedClue;

                // Check the orthogType
                if (hasTop && !hasBottom) orthogType = END;
                if (!hasTop && hasBottom) orthogType = START;
                if (hasTop && hasBottom) orthogType = MIDDLE;
                sharedClue.orthogs.push(orthogType);
            }

            // If cell has no top neighbour, but has a bottom neighbour, 
            // it starts a DN clue. Create a DN clue, and place a reference
            // to it in this cell.
            if (!hasTop && hasBottom) {
                const clue = new Clue(
                    Math.floor(i / this.width),
                    i % this.width,
                    'DN'
                );
                clue.cellList.push(this.cells[i]);
                this.clues.push(clue);
                this.cells[i].clueDown = clue;

                // Check the orthogType
                if (hasLeft && !hasRight) orthogType = END;
                if (!hasLeft && hasRight) orthogType = START;
                if (hasLeft && hasRight) orthogType = MIDDLE;
                clue.orthogs.push(orthogType);
            }

            // if cell has a top neighbour, it shares the same clue reference
            // Increment this clue's length value, len.
            if (hasTop) {
                const sharedClue = this.cells[i - this.width].clueDown;
                sharedClue.len += 1;
                sharedClue.cellList.push(this.cells[i]);
                this.cells[i].clueDown = sharedClue;

                // Check the orthogType
                if (hasLeft && !hasRight) orthogType = END;
                if (!hasLeft && hasRight) orthogType = START;
                if (hasLeft && hasRight) orthogType = MIDDLE;
                sharedClue.orthogs.push(orthogType);
            }
        }


        // Calculate numbers for each clue, considering AC and DN separately.
        // However, an AC and a DN clue can start in the same cell, and should
        // then use the same number. Numbers cannot be duplicated in either the
        // set of AC clues or the set of DN clues.

        class Loc {
            constructor(row, col) {
                this.row = row;
                this.col = col;
            }
        }

        // Create a map, to hold the clues, keyed by a Loc object representing
        // their starting cells.
        const clueMap = new Map();

        for (let clue of this.clues) {
            const loc = new Loc(clue.startRow, clue.startCol);
            if (clueMap.has(loc)) {
                clueMap.get(loc).push(clue);
            } else {
                clueMap.set(loc, []);
                clueMap.get(loc).push(clue);
            }
        }
        const sortedClueMap = new Map([...clueMap].sort((a, b) => {
            return a.col - b.col || a.row - b.row;
        }));

        // Keep a counter for the next indices of AC and DN clues respectively
        let acrossCounter = 1;
        let downCounter = 1;

        // Keep track of the DN indices already used, so that they are not duplicated
        const unusableDownIndices = [];

        // Iterate through the sorted map.
        for (let loc of sortedClueMap.keys()) {
            const clueList = sortedClueMap.get(loc);
            if (clueList.length > 1) {
                // An AC and a DN clue share a starting cell - they get the same number
                for (let clue of clueList) {
                    if (clue.orientation === 'AC') {
                        clue.clue_number = acrossCounter;
                    } else {
                        clue.clue_number = acrossCounter;
                        unusableDownIndices.push(acrossCounter);
                    }
                }
                acrossCounter++;
            } else {
                // This clue has a unique starting cell
                const clue = clueList[0];
                if (clue.orientation === 'AC') {
                    // AC clues cannot have duplicate numbers
                    clue.clue_number = acrossCounter;
                    acrossCounter++;
                } else {
                    // Ensure a DN clue does not reuse a number
                    while (unusableDownIndices.includes(downCounter)) {
                        downCounter++;
                    }
                    clue.clue_number = downCounter;
                    unusableDownIndices.push(downCounter);
                    downCounter++;
                }
            }
        }

        // Finally, look up the clueCache and wordLengthCache maps. If the clue's solution
        // is among the keys, the solution and its cells are unchanged, and the clue and 
        // word_length can be conserved.
        for (let item of this.clues) {
            const key = item.getCurrentSolution();
            if (clueCache.get(key)) {
                item.clue = clueCache.get(key);
            }
            if (false && wordLengthCache.get(key)) {
                item.word_lengths = wordLengthCache.get(key);
            } else {
                item.word_lengths = `(${item.len})`;
            }
        }

        // console.log('reindexed')
    }
}

const hasLeftNeighbour = (cell, grid) => {
    if (cell.col % grid.width === 0) {
        return false;
    }
    const index = getCellIndex(cell, grid);
    return grid.cells[index - 1].isOpen;
}

const hasRightNeighbour = (cell, grid) => {
    if (cell.col === grid.width - 1) {
        return false;
    }
    const index = getCellIndex(cell, grid);
    return grid.cells[index + 1].isOpen;
}

const hasTopNeighbour = (cell, grid) => {
    if (cell.row % grid.height === 0) {
        return false;
    }
    const index = getCellIndex(cell, grid);
    return grid.cells[index - grid.width].isOpen;
}

const hasBottomNeighbour = (cell, grid) => {
    if (cell.row === grid.height - 1) {
        return false;
    }
    const index = getCellIndex(cell, grid);
    return grid.cells[index + grid.width].isOpen;
}

export const getCellIndex = (cell, grid) => {
    return cell.col + cell.row * grid.width;
}