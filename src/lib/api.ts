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
    'bypass-tunnel-reminder': 'true',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error: AxiosError) => {
    console.error('API Error:', error.response || error.message);

    // Xử lý nếu gặp lỗi HTML (Do Tunnel chặn hoặc Server lỗi)
    if (
      error.response &&
      typeof error.response.data === 'string' &&
      (error.response.data as string).includes('<!DOCTYPE html>')
    ) {
      return Promise.reject(
        new Error('Lỗi kết nối Tunnel: Vui lòng mở link server trên máy tính để xác nhận.')
      );
    }

    const errorData = error.response?.data as { error?: string; message?: string };
    const errorMessage =
      errorData?.error || errorData?.message || error.message || 'Đã xảy ra lỗi không xác định';

    return Promise.reject(new Error(errorMessage));
  }
);

export default api;
