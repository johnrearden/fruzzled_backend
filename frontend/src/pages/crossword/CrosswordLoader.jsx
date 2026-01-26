import { useEffect, useState } from "react";
import { axiosReq } from "../../api/axiosDefaults";
import { CrosswordGrid } from "../../components/CrosswordGrid";
import { usePuzzleHistoryContext } from "../../contexts/PuzzleHistoryContext";
import SEO from "../../components/SEO";

export const CrosswordLoader = () => {
    const [data, setData] = useState({});
    const [loaded, setLoaded] = useState(false);
    const [key, setKey] = useState(0);
    const { savePuzzleToHistory, getPuzzleHistory } = usePuzzleHistoryContext();

    useEffect(() => {
        loadNewCrossword();
    }, [getPuzzleHistory]);


    const loadNewCrossword = async () => {
        const seenCrosswords = getPuzzleHistory('crossword', 0);
        let getQuery = "";
        if (seenCrosswords) {
            getQuery = `?seen_crosswords=${seenCrosswords}`;
        }
        const url = `/crossword_builder/get_unseen_puzzle/${getQuery}`;
        const { data } = await axiosReq.get(url);
        setData(data.puzzle);
        setLoaded(true);
        setKey(prev => prev + 1);
    }

    const component = loaded ? (
        <>
            <SEO
                title="Play Free Crossword Puzzles Online"
                description="Play free crossword puzzles online at Fruzzled. Challenge yourself with our collection of handcrafted crosswords. Track your completion time and accuracy!"
                path="/crossword"
            />
            <CrosswordGrid
                key={key}
                data={data}
                loadNewCallback={loadNewCrossword}/>
        </>

    ) : (
        <span>Loading</span>
    )

    return component;
}