export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/login`,
  SIGNUP: `${API_BASE_URL}/signup`,
  SERVICE_REQUESTS: `${API_BASE_URL}/service-requests`,
  UPLOAD_PHOTOS: `${API_BASE_URL}/upload-photos`,
  GEMINI_CHAT: `${API_BASE_URL}/api/gemini-chat`,
  PARTNER: `${API_BASE_URL}/api/partner`,
  INTEGRATOR: `${API_BASE_URL}/api/integrator`,
} as const;