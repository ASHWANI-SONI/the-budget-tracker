import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api', // Env var in real app
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
