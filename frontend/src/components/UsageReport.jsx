import { useEffect, useState } from "react"
import { axiosReq } from "../api/axiosDefaults";

export const UsageReport = () => {
    
    const [stats, setStats] = useState({});

    useEffect(() => {
        const handleMount = async () => {
            
            try {
                const { data } = await axiosReq.get('/usage_stats/get_stats_summary/');
                setStats(data);
                console.log(data);
            } catch (err) {
                console.log(err);
            }
        }
        handleMount();
    }, []);
    
    return (
        <>
            <h6>Stats</h6>
            <table class="table table-sm mx-5">
                <thead>
                    <tr scope="col" className="text-sm">
                        <th>Game</th>
                        <th>Last Hour</th>
                        <th>Last Day</th>
                        <th>Last Week</th>
                        <th>Last 4 Weeks</th>
                        <th>All Time</th>
                    </tr>
                </thead>
                <tbody>
                    <tr scope="row">
                        <td>Sudoku</td>
                        <td>{ stats.sudoku_last_hour_count }</td>
                        <td>{ stats.sudoku_today_count }</td>
                        <td>{ stats.sudoku_last_week_count }</td>
                        <td>{ stats.sudoku_last_4_weeks_count }</td>
                        <td>{ stats.sudoku_all_time_count }</td>
                    </tr>
                    <tr scope="row">
                        <td>Crossword</td>
                        <td>{ stats.crossword_last_hour_count }</td>
                        <td>{ stats.crossword_today_count }</td>
                        <td>{ stats.crossword_last_week_count }</td>
                        <td>{ stats.crossword_last_4_weeks_count }</td>
                        <td>{ stats.crossword_all_time_count }</td>
                    </tr>
                </tbody>
            </table>
        </>
    )
}