import { useContext, createContext, useState, useEffect, useMemo } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { axiosReq, axiosRes } from "../api/axiosDefaults";
import { removeTokenTimestamp, shouldRefreshToken } from "../utils/utils";

export const CurrentUserContext = createContext();
export const SetCurrentUserContext = createContext();

export const useCurrentUser = () => useContext(CurrentUserContext);
export const useSetCurrentUser = () => useContext(SetCurrentUserContext);

export const CurrentUserProvider = ({ children }) => {

    const [currentUser, setCurrentUser] = useState(null);

    const navigate = useNavigate();

    const handleMount = async () => {
        try {
            const { data } = await axiosRes.get('/dj-rest-auth/user/');
            setCurrentUser(data);
        } catch (err) {
            console.log(err.message);
        }
    }

    useEffect(() => {
        handleMount();
    }, [])

    useMemo(() => {
        axiosReq.interceptors.request.use(
            
            async (config) => {
                
                if (shouldRefreshToken()) {
                    try {
                        await axios.post('/dj-rest-auth/token/refresh/')
                    } catch (err) {
                        //alert(`error posting refresh token in axiosReq ${err}`);
                        setCurrentUser(prevCurrentUser => {
                            if (prevCurrentUser) {
                                navigate('/signin');
                            }
                            return null;
                        })
                        removeTokenTimestamp();
                        return config;
                    }
                }
                return config;
            },
            (err) => {
                return Promise.reject(err);
            }
        )

        axiosRes.interceptors.response.use(
            (response) => response,
            async (err) => {
                //alert(`error in axiosRes : ${err}`);
                if (err.response?.status === 401) {
                    try {
                        await axios.post('/dj-rest-auth/token/refresh/')
                    } catch (err) {
                        //alert(`error posting refresh token in axiosRes ${err}`);
                        setCurrentUser(prevCurrentUser => {
                            if (prevCurrentUser) {
                                navigate('/signin');
                            }
                            return null;
                        });
                        removeTokenTimestamp();
                    }
                    return axios(err.config);
                }
                return Promise.reject(err);
            }
        )
    }, [history]);

    return (
        <CurrentUserContext.Provider value={currentUser}>
            <SetCurrentUserContext.Provider value={setCurrentUser}>
                {children}
            </SetCurrentUserContext.Provider>
        </CurrentUserContext.Provider >
    );
}