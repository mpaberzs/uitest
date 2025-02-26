import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'http://host.docker.internal:8000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
