import {
    nonets
} from "../../constants/nonets";
import { arraysHaveSameItems } from "../utils";

export const hiddenPairs = (grid, searchArray, callback) => {
    console.log('hidden pairs')
    
    for (let n = 6; n < 7; n++) {
        console.log('nonet :', n, '****************************');
        let nonet = nonets[n];
        for (let i = 0; i < 9; i++) {
            console.log(searchArray[nonet[i]])
        }

        const occurCounts = new Array(9).fill(0);
        const occurLocations = new Array(9);
        for (let i = 0; i < 9; i++) {
            occurLocations[i] = [];
        }
        console.log(occurLocations);

        for (let cell of nonet) {
            for (let i = 0; i < 9; i++) {
                const digit = (i + 1).toString();
                if (searchArray[cell].includes(digit)) {
                    occurCounts[i]++;
                    occurLocations[i].push(cell);
                }
            }
        }

        console.log(occurCounts);
        console.log(occurLocations);

        // Isolate the digits that occur twice.
        let candidates = []
        for (let i = 0; i < 9; i++) {
            if (occurLocations[i].length === 2) {
                candidates.push({
                    index: i,
                    digit: (i + 1).toString(),
                    locations: occurLocations[i],
                })
            }
        }
        console.log(candidates);


        outerloop : for (let i = 0; i < candidates.length; i++) {
            for (let j = 0; j < candidates.length; j++) {
                if (i !== j) {
                    const cand1 = candidates[i];
                    const cand2 = candidates[j];
                    if (arraysHaveSameItems(cand1.locations, cand2.locations)) {
                        console.log('found match at', i, ',', j);
                        const digits = [cand1.digit, cand2.digit]
                        console.log('digits', digits);
                        break outerloop;
                    }
                }
            }
        }
        
    }
}