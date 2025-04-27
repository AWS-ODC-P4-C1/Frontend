import axios from 'axios';

const api = axios.create({
  baseURL: 'http://ec2-54-191-62-131.us-west-2.compute.amazonaws.com:8000/api', 
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // if (error.response && error.response.status === 401) {
    //   localStorage.removeItem('token');
    //   window.location.href = '/login';
    // }
    return Promise.reject(error);
  }
);

export default api;
