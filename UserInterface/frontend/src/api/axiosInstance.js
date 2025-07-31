// api/axiosInstance.js
import axios from 'axios';

const token = localStorage.getItem('token');

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api', // your backend URL
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export default axiosInstance;

