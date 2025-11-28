const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
                     (import.meta.env.MODE === 'development' 
                       ? 'http://localhost:5000/api' 
                       : 'https://your-render-backend.onrender.com/api');

export const apiConfig = {
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for sending cookies with requests
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

export const setupAuthHeader = (token) => ({
  headers: {
    ...apiConfig.headers,
    'Authorization': token ? `Bearer ${token}` : ''
  },
  withCredentials: true
});
