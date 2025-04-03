const API_URL = {
  development: 'http://localhost:3001',
  production: 'https://logs-backend2.onrender.com', // Replace with your actual backend URL on Render
};

// Determine current environment
const environment = import.meta.env.MODE || 'development';

// Export the base API URL
export const BASE_URL = API_URL[environment];

console.log(`Using API URL: ${BASE_URL} (${environment} environment)`);