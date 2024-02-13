import { useEffect, useState } from "react";
import { axiosReq } from "../../api/axiosDefaults";
import { CrosswordGrid } from "../../components/CrosswordGrid";


export const CrosswordLoader = () => {
    const [data, setData] = useState({});
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const handleMount = async () => {
            const url = '/crossword_builder/get_puzzle/242/';
            const { data } = await axiosReq.get(url);
            setData(data.puzzle);
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