import axios from 'axios';

// La URL del backend se lee de una variable de entorno de Vite (ver .env.example).
// Si no existe, se usa localhost:5000 como valor por defecto para desarrollo.
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL });

// Antes de cada peticion, si hay un token guardado, lo adjuntamos automaticamente.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('energia_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
