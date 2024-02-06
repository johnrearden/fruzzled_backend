import React, { useState } from 'react';
import { axiosReq, axiosRes } from '../../api/axiosDefaults';
import { CrosswordEditor } from './CrosswordEditor';

const CreateNewCrossword = () => {

    const [data, setData] = useState({});
    const [editing, setEditing] = useState(false);

    const [width, setWidth] = useState(14);
    const [height, setHeight] = useState(14);

    const handleChange = (event) => {
        if (event.target.name === "width") {
            setWidth(event.target.value);
        } else if (event.target.name === "height") {
            setHeight(event.target.value);
        }
    }

    const handleSubmit = async (event) => {

        event.preventDefault();

        const cellString = populateGrid(width, height);
        let url = "/crossword_builder/create_new_puzzle/";
        const formData = new FormData();
        formData.append('width', width);
        formData.append('height', height);
        formData.append('cells', cellString);
        formData.append('puzzle_type', "CROSSWORD");
        try {
            let { data } = await axiosRes.post(url, formData);
            const id = data['new_puzzle_id'];
            url = `/crossword_builder/get_puzzle/${id}/`;
            const response = await axiosRes.get(url);
            setData(response.data.puzzle
                );
            setEditing(true);

        } catch (err) {
            console.log(err);
        }
    }

    const populateGrid = (cols, rows) => {
        const array = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (r % 2 === 0) {
                    array.push('#');
                } else {
                    const symbol = c % 2 === 0 ? '#' : '-';
                    array.push(symbol);
                }
            }
        }
        return array.join('');
    }

    return editing ? (
        <CrosswordEditor data={data} />
    ) : (
        <div>
            <form>
                <input 
                    type="number"
                    name="width" 
                    value={width}
                    onChange={handleChange}
                ></input>
                <input 
                    type="number"
                    name="height" 
                    value={height}
                    onChange={handleChange}
                ></input>
                <button type="submit" onClick={handleSubmit}>Create</button>
            </form>
        </div>
    )
}

export default CreateNewCrossword;
