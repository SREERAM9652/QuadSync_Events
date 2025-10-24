import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://quadsync-events.onrender.com', // fallback to local backend
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
