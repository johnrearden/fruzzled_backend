import { createContext, useContext, useEffect, useState } from "react";
import { axiosRes } from "../api/axiosDefaults";

export const ProfileContext = createContext();
export const SetProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);
export const useSetProfile = () => useContext(SetProfileContext);

export const ProfileProvider = ({ children }) => {
    
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const handleMount = async () => {
            try {
                const {data} = await axiosRes.get('/player_profile/');
                setProfile(data);
            } catch (err) {
                console.log(err);
            }
        }
        handleMount();
    }, []);

    return (
        <ProfileContext.Provider value={profile}>
            <SetProfileContext.Provider value={setProfile}>
                { children }
            </SetProfileContext.Provider>
        </ProfileContext.Provider>
    )
}