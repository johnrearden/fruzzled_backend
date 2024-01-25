import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom"

export const useRedirect = (userAuthStatus) => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleMount = async () => {
            try {
                await axios.post('dj-rest-auth/token/refresh/');
                if (userAuthStatus === 'loggedIn') {
                    navigate('/');
                }
            } catch (err) {
                if (userAuthStatus === 'loggedOut') {
                    navigate('/');
                }
            }
        }
        handleMount();
    }, [history, userAuthStatus])
}

// Here's a comment to create a merge conflict
