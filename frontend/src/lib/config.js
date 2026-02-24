const normalizeUrl = (url) => (url || '').replace(/\/$/, '');

const defaultApiUrl = 'http://localhost:5000';

export const API_BASE_URL = normalizeUrl(import.meta.env.VITE_API_BASE_URL || defaultApiUrl);
export const SOCKET_URL = normalizeUrl(import.meta.env.VITE_SOCKET_URL || API_BASE_URL);
