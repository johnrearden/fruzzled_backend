import { useEffect, useState } from "react";
import { axiosReq } from "../../api/axiosDefaults";
import { useParams } from "react-router-dom";
import { CrosswordEditor } from "./CrosswordEditor";


export const CrosswordEditLoader = () => {
    const [data, setData] = useState({});
    const [loaded, setLoaded] = useState(false);
    const { id }= useParams();

    useEffect(() => {
        const handleMount = async () => {
            const url = `/crossword_builder/get_puzzle/${id}/`;
            const { data } = await axiosReq.get(url);
            setData(data.puzzle);
            setLoaded(true);

        }
        handleMount();
    }, [])

    const component = loaded ? (
        <CrosswordEditor data={data} />
    ) : (
        <span>Loading</span>
    )

    return component;
}