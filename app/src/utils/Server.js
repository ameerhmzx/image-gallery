import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_SERVER_URL,
});

axiosInstance.interceptors.request.use(function (config) {
    config.headers.HTTP2_HEADER_CONTENT_TYPE = 'application/json'
    let token = sessionStorage.getItem('jwtToken');
    if(token !== undefined && token !== '')
        config.headers.Authorization = `Bearer ${token}`;

    console.log(config);
    return config;
}, function (error) {
    return Promise.reject(error);
});

export default axiosInstance;
