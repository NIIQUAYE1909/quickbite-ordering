// Environment configuration for QuickBite
// This file provides environment variables to the frontend
// Works with Vercel environment variables (process.env) and window.env fallback

window.env = {
    // API URL - Vercel will use VITE_API_URL env var, or falls back to window.env.API_URL
    // For production: set VITE_API_URL in Vercel dashboard
    API_URL: process.env.VITE_API_URL || window.env?.API_URL || 'https://quickbite-backend.onrender.com/api'
};
