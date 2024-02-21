import { useEffect, useState } from "react";
import { axiosReq } from "../../api/axiosDefaults";
import { CrosswordGrid } from "../../components/CrosswordGrid";
import { CrosswordThumbnail } from "../../components/CrosswordThumbnail";


export const CrosswordLoader = () => {
    const [data, setData] = useState({});
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const handleMount = async () => {
            const url = '/crossword_builder/get_puzzle/21/';
            const { data } = await axiosReq.get(url);
            setData(data.puzzle);
            setLoaded(true);

        }
        handleMount();
    }, [])

    const component = loaded ? (
        <>
            <CrosswordGrid data={data} />
            
        </>

    ) : (
        <span>Loading</span>
    )

    return component;
}