export const createCellReferences = (gridObject) => {
    const array = new Array(gridObject.clues.length);
        const width = gridObject.width;

        for (let i = 0; i < array.length; i++) {
            array[i] = new Array();
            const clue = gridObject.clues[i];
            for (let j = 0; j < clue.cellList.length; j++) {
                let cellIndex;
                if (clue.orientation === 'AC') {
                    cellIndex = clue.startCol + j + (clue.startRow * width);
                } else {
                    cellIndex = clue.startCol + ((j + clue.startRow) * width);
                }
                array[i].push(cellIndex);
            }
        }
        return array;
}

export const createClueReferences = (gridObject) => {
    const width = gridObject.width;
        const height = gridObject.height;
        const length = width * height;
        const array = new Array(length);
        for (let i = 0; i < array.length; i++) {
            array[i] = new Array();
        }
        gridObject.clues.forEach((clue, number) => {
            for (let i = 0; i < clue.cellList.length; i++) {
                const startCol = parseInt(clue.startCol);
                const startRow = parseInt(clue.startRow);
                let index = 0;
                if (clue.orientation === 'AC') {
                    index = startCol + i + (startRow * width);
                    // Ensure AC clues are always first in intersection cells for consistent clicking
                    array[index].unshift(number);
                } else {
                    index = startCol + ((i + startRow) * width);
                    array[index].push(number);
                }
            }
        });
    return array;
}