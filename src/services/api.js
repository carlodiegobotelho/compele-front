import axios from "axios";

const api = axios.create({
  baseURL: "http://34.232.0.139/compele-api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('Compele-ChaveAcesso');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;