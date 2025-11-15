// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://3471e1fd9c4c.ngrok-free.app/api/v1',
  
  // API Endpoints
  ENDPOINTS: {
    PATIENTS: '/patients',
  },
  
  // Helper function to get full URL
  getUrl: (endpoint: string) => {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
  },
};

// Example usage:
// const url = API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.PATIENTS);
// Result: "http://localhost:8000/api/v1/patients"
