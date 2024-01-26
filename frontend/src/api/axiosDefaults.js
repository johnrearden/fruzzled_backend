import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_AXIOS_DEFAULT_URL;
axios.defaults.headers.post['Content-Type'] = 'multipart/form-data';
axios.defaults.withCredentials = true;

export const baseURL = axios.defaults.baseURL;

export const axiosReq = axios.create();
export const axiosRes = axios.create();