import { useEffect, useState } from "react";
import { axiosReq } from "../../api/axiosDefaults";
import { CrosswordGrid } from "../../components/CrosswordGrid";


export const CrosswordLoader = () => {
    const [data, setData] = useState({});
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const handleMount = async () => {
            const url = '/crossword_builder/get_recent_puzzles/10/';
            const { data } = await axiosReq.get(url);
            setData(data.puzzles[8]);
            console.log(data.puzzles[8]);
            setLoaded(true);

        }
        handleMount();
    }, [])

    const component = loaded ? (
        <CrosswordGrid data={data} />
    ) : (
        <span>Loading</span>
    )

    return component;
}