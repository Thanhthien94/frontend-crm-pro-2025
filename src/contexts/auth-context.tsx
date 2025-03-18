'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { User } from '@/types/user';
import { setCookie, getCookie, deleteCookie } from 'cookies-next';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      // Get token from cookie
      const token = getCookie('token');
      console.log('Auth context init - token exists:', !!token);
      
      // Try to get user from localStorage as a quick start
      let localUser = null;
      const storedUser = localStorage.getItem('user');
      
      // Inconsistent state handling - synchronize storage
      if (storedUser && !token) {
        // User data exists but token is missing - we should clear the user data
        console.log('Auth context init - inconsistent state: user data exists but token missing');
        localStorage.removeItem('user');
      } else if (storedUser) {
        try {
          localUser = JSON.parse(storedUser);
          console.log('Auth context init - found user in localStorage');
          // Set user from localStorage temporarily while we validate with server
          setUser(localUser);
        } catch (error) {
          console.error('Failed to parse user data from localStorage', error);
          localStorage.removeItem('user');
        }
      }
      
      // If no token, we're definitely not authenticated
      if (!token) {
        console.log('Auth context init - no token, not authenticated');
        setUser(null); // Ensure user is null if no token
        setLoading(false);
        return;
      }
      
      // Always validate token with server regardless of local storage
      try {
        console.log('Auth context init - validating token with server');
        const response = await api.get('/auth/me');
        
        if (response.data && response.data.data) {
          console.log('Auth context init - token validated successfully');
          // Update user with fresh data from server
          setUser(response.data.data);
          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(response.data.data));
        } else {
          console.error('Auth context init - server returned invalid user data');
          throw new Error('Invalid user data');
        }
      } catch (error) {
        console.error('Auth context init - token validation failed', error);
        // Clear authentication
        deleteCookie('token', { path: '/' });
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('Login - attempting login with email:', email);
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      console.log('Login - successful, received user data:', user);
      
      // Store token in both HTTP-only cookie and a client-side cookie
      // The server should set the HTTP-only cookie, but we'll also set a client-side cookie
      setCookie('token', token, { 
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
        sameSite: 'lax'
      });
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update state
      setUser(user);
      
      // Clear any errors
      if (window.location.href.includes('error=')) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      console.log('Login - auth state updated successfully');
      // We don't redirect here anymore - the calling component handles the redirect
      
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const register = async (data: RegisterData) => {
    setLoading(true);
    try {
      console.log('Register - attempting with email:', data.email);
      const response = await api.post('/auth/register', data);
      const { token, user } = response.data;
      
      console.log('Register - successful, received user data:', user);
      
      // The server should set the HTTP-only cookie, but we'll also set a client-side cookie
      // as a fallback with the same path and expiry
      setCookie('token', token, { 
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
        sameSite: 'lax'
      });
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update state
      setUser(user);
      
      // Navigate to dashboard with delay to ensure cookies are set
      console.log('Register - redirecting to dashboard');
      
      // Use a longer timeout to ensure cookie processing
      setTimeout(() => {
        window.location.href = '/dashboard'; // Use direct location change instead of router
      }, 200);
    } catch (error) {
      console.error('Registration failed', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = async () => {
    try {
      console.log('Logout - attempting to logout');
      
      // Call backend logout endpoint to clear server-side cookie
      await api.get('/auth/logout');
      
      // Clear client-side data
      deleteCookie('token', { path: '/' });
      localStorage.removeItem('user');
      setUser(null);
      
      console.log('Logout - cleared all auth data');
      
      // Redirect to login page (use direct navigation to ensure clean state)
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed', error);
      // Still clear client-side data even if server call fails
      deleteCookie('token', { path: '/' });
      localStorage.removeItem('user');
      setUser(null);
      
      // Redirect to login page
      window.location.href = '/login';
    }
  };

  // Check if cookie token exists for accurate authentication state
  const cookieToken = getCookie('token');
  const isAuthenticated = !!cookieToken && !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}