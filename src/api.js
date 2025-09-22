import axios from 'axios';

// centralized Axios instance
const api = axios.create({
 
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:6446'
});

export default api;
