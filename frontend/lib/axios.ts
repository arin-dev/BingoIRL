import axios from 'axios';

const axiosInstance = axios.create();

const AUTH_ERRORS = new Set(['Invalid token', 'Requires Authorization']);

axiosInstance.interceptors.response.use(
  res => res,
  err => {
    if (AUTH_ERRORS.has(err?.response?.data?.error)) {
      localStorage.removeItem('token');
      window.location.href = '/signin';
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;
