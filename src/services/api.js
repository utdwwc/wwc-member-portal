const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

export const API_ENDPOINTS = {
  // Auth Endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    GOOGLE_OAUTH: `${API_BASE_URL}/api/auth/google`,
    PROFILE: `${API_BASE_URL}/api/auth/profile`,
    VERIFY_TOKEN: `${API_BASE_URL}/api/auth/verify`,
  },

  // User Endpoints
  USERS: {
    BASE: `${API_BASE_URL}/api/users`,
    BY_ID: (id) => `${API_BASE_URL}/api/users/${id}`,
    PROFILE: `${API_BASE_URL}/api/users/profile`,
    UPDATE_PROFILE: `${API_BASE_URL}/api/users/profile/update`,
  },

  // Event Endpoints
  EVENTS: {
    BASE: `${API_BASE_URL}/api/events`,
    BY_ID: (id) => `${API_BASE_URL}/api/events/${id}`,
    REGULAR: `${API_BASE_URL}/api/events/regular`,
    UPCOMING: `${API_BASE_URL}/api/events/upcoming`,
    PAST: `${API_BASE_URL}/api/events/past`,
  },

  // Event Check-in Endpoints
  CHECKIN: {
    BASE: `${API_BASE_URL}/api/checkin`,
    EVENT: (eventId) => `${API_BASE_URL}/api/checkin/event/${eventId}`,
    USER: (userId) => `${API_BASE_URL}/api/checkin/user/${userId}`,
    VERIFY: `${API_BASE_URL}/api/checkin/verify`,
  },

  // Application Endpoints
  APPLICATIONS: {
    BASE: `${API_BASE_URL}/api/applications`,
    BY_ID: (id) => `${API_BASE_URL}/api/applications/${id}`,
    EVENT: (eventId) => `${API_BASE_URL}/api/applications/event/${eventId}`,
    USER: (userId) => `${API_BASE_URL}/api/applications/user/${userId}`,
    STATUS: (appId) => `${API_BASE_URL}/api/applications/${appId}/status`,
  },

  // Admin Endpoints
  ADMIN: {
    USERS: `${API_BASE_URL}/api/admin/users`,
    EVENTS: `${API_BASE_URL}/api/admin/events`,
    STATS: `${API_BASE_URL}/api/admin/stats`,
    OFFICERS: `${API_BASE_URL}/api/admin/officers`,
    APPLICATIONS: `${API_BASE_URL}/api/admin/applications`,
  },

  // Information/Content Endpoints
  INFORMATION: {
    BASE: `${API_BASE_URL}/api/information`,
    ABOUT: `${API_BASE_URL}/api/information/about`,
    RESOURCES: `${API_BASE_URL}/api/information/resources`,
    FAQ: `${API_BASE_URL}/api/information/faq`,
  },
};

// Helper function for API requests
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(endpoint, {
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: 'include', // For cookies if using them
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Specific API functions for common operations
export const api = {
  // Auth functions
  login: (credentials) => apiRequest(API_ENDPOINTS.AUTH.LOGIN, {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  logout: () => apiRequest(API_ENDPOINTS.AUTH.LOGOUT, {
    method: 'POST',
  }),

  getProfile: () => apiRequest(API_ENDPOINTS.USERS.PROFILE),

  // Event functions
  getEvents: () => apiRequest(API_ENDPOINTS.EVENTS.BASE),
  getEvent: (id) => apiRequest(API_ENDPOINTS.EVENTS.BY_ID(id)),
  createEvent: (eventData) => apiRequest(API_ENDPOINTS.EVENTS.BASE, {
    method: 'POST',
    body: JSON.stringify(eventData),
  }),

  // Check-in functions
  checkIn: (checkInData) => apiRequest(API_ENDPOINTS.CHECKIN.BASE, {
    method: 'POST',
    body: JSON.stringify(checkInData),
  }),

  // Application functions
  submitApplication: (applicationData) => apiRequest(API_ENDPOINTS.APPLICATIONS.BASE, {
    method: 'POST',
    body: JSON.stringify(applicationData),
  }),

  // Admin functions
  getUsers: () => apiRequest(API_ENDPOINTS.ADMIN.USERS),
  getStats: () => apiRequest(API_ENDPOINTS.ADMIN.STATS),
};