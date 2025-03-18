import api from './api';
import { User } from '@/types/user';
import { getCookie } from 'cookies-next';

export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.user) {
      // Token is handled by HTTP-only cookie on the server
      // Only store user data in localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const register = async (data: {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}) => {
  try {
    const response = await api.post('/auth/register', data);
    if (response.data.user) {
      // Token is handled by HTTP-only cookie on the server
      // Only store user data in localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    // Call backend to clear the cookie
    await api.get('/auth/logout');
    localStorage.removeItem('user');
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout failed', error);
    // If server request fails, still try to clean up client-side
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  // Check for token in cookie instead of localStorage
  return !!getCookie('token');
};