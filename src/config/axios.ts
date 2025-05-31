import axios from 'axios';

const api = axios.create({ baseURL: "http://localhost:3000/api/", });

api.interceptors.request.use(
    function (config) {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Adding token to request headers', config.url);
            console.log('Token exists and is being added to request header');
        }else {
            console.log('No token found for request:', config.url);
          }
      
          return config;
        },
        function (error) {
            console.error('Request interceptor error:', error);
            return Promise.reject(error);
          }
);

api.interceptors.response.use(
    function (response) {
        console.log('Response received:', response.status, response.config.url);
        return response;
    },
    function (error) {
        console.error('Response interceptor error:', error);
        console.log('Error status:', error.response?.status);

        if (error.response?.status === 401 && 
            !error.config.url.includes('/auth/login') && 
            !error.config.url.includes('/auth/register')) {
            console.error('Unauthorized error - token may be invalid');
        }
    
    return Promise.reject(error);
  }
);

export default api;
