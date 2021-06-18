import axios from 'axios';
import axiosCancel from "axios-cancel";

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_SERVER_URL,
});

axiosInstance.interceptors.request.use(function (config) {
    config.headers.HTTP2_HEADER_CONTENT_TYPE = 'application/json'
    let token = sessionStorage.getItem('jwtToken');
    if (!(token === undefined || token === '' || token === null))
        config.headers.Authorization = `Bearer ${token}`;

    console.log(config);
    return config;
}, function (error) {
    return Promise.reject(error);
});

axiosInstance.interceptors.response.use(
    (res) => res,
    (err) => {
        if (axiosInstance.isCancel(err)) {
            console.log(err);
            return;
        }
        return Promise.reject(err);
    }
);

axiosCancel(axiosInstance, {debug: false});
export default axiosInstance;
