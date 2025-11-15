import { API_BASE } from '../config/api.js';
import { getToken } from '../utils/auth.js';

const getHeaders = (includeAuth = false) => {
  const headers = { 'Content-Type': 'application/json' };
  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

export const authService = {
    
  async register(username, password) {
    console.log("registering")
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username, password })
    });
    return await res.json();
  },

  async login(username, password) {
    
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username, password })
    });

    return await res.json();
  }
};

export const chatService = {
  async sendMessage(prompt) {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ prompt })
    });
    return await res.json();
  },

  async generateImage(prompt, size = 512) {
    const res = await fetch(`${API_BASE}/generate-image`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ prompt, size })
    });
    return await res.json();
  },

  async loadChats() {
    const res = await fetch(`${API_BASE}/chats`, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to load chats');
    return await res.json();
  }
};