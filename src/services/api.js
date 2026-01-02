import axios from "axios";

const api = axios.create({
  baseURL: "https://dphy3f0snrx0g.cloudfront.net/compele-api",
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('Compele-ChaveAcesso');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;