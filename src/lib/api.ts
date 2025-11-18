import axios, { AxiosError } from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL;

if (!VITE_API_URL) {
  console.error('VITE_API_URL is not defined! Please check your .env.local file.');
}

const API_BASE_URL = `${VITE_API_URL}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error: AxiosError) => {
    console.error('API Error:', error.response || error.message);

    const errorData = error.response?.data as { error?: string };
    const errorMessage = errorData?.error || error.message || 'Đã xảy ra lỗi không xác định';

    return Promise.reject(new Error(errorMessage));
  }
);

export default api;
