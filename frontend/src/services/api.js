import axios from 'axios';

const api = axios.create({
    baseURL: 'https://cautious-doodle-59xv6q6vjw92797w-3001.app.github.dev',
    timeout: 5000,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;