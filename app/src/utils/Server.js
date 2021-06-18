import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_SERVER_URL,
});

axiosInstance.interceptors.request.use(function (config) {
    config.headers.HTTP2_HEADER_CONTENT_TYPE = 'application/json'
    let token = sessionStorage.getItem('jwtToken');
    if (!(token === undefined || token === '' || token === null))
        config.headers.Authorization = `Bearer ${token}`;
    return config;
}, function (error) {
    return Promise.reject(error);
});

axiosInstance.interceptors.response.use(
    (res) => res,
    (err) => {
        if (axios.isCancel(err)) {
            console.log(`Req canceled ${err}`);
        }
        return Promise.reject(err);
    }
);

export default axiosInstance;
