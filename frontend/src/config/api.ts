// API configuration
// In production, use relative paths (Nginx will proxy to backend)
// In development, use localhost
const isDevelopment = import.meta.env.DEV;
export const API_URL = isDevelopment 
  ? 'http://localhost:5001' 
  : ''; // Empty string means use relative paths

export default API_URL;
