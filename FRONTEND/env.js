// Environment configuration for QuickBite
// This file provides environment variables to the frontend
// For production, update the API_URL to your Render backend URL

window.env = {
    // API URL - use localhost for local development
    // For production on Render: https://quickbite-backend.onrender.com/api
    API_URL: (window.location.hostname.includes('onrender.com')) 
        ? 'https://quickbite-backend.onrender.com/api' 
        : 'http://localhost:8080/api'
};
