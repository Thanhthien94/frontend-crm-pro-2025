// src/lib/auth-debug.ts

import { getCookie } from 'cookies-next';

export function debugAuthState() {
  console.group('Auth Debug Information');
  
  // Check token
  const token = getCookie('token');
  console.log('Token exists:', !!token);
  if (token) {
    try {
      // In ra phần đầu của token để debug (không in toàn bộ vì lý do bảo mật)
      console.log('Token first 10 chars:', token.substring(0, 10) + '...');
      
      // Parse JWT payload nếu có thể
      const parts = token.split('.');
      if (parts.length === 3) {
        try {
          const payload = JSON.parse(atob(parts[1]));
          console.log('Token payload:', payload);
          console.log('Token expiry:', new Date(payload.exp * 1000).toLocaleString());
        } catch (e) {
          console.log('Could not parse token payload');
        }
      }
    } catch (e) {
      console.log('Could not parse token');
    }
  }
  
  // Check user in localStorage
  const userStr = localStorage.getItem('user');
  // console.log('User in localStorage:', !!userStr);
  // if (userStr) {
  //   try {
  //     const user = JSON.parse(userStr);
  //     console.log('User data:', user);
  //   } catch {
  //     console.log('Could not parse user data');
  //   }
  // }
  
  console.groupEnd();
  
  return {
    hasToken: !!token,
    hasUserData: !!userStr,
    isConsistent: (!!token && !!userStr) || (!token && !userStr)
  };
}

export function addAuthDebugButton() {
  if (typeof window !== 'undefined') {
    // Chỉ thêm trong môi trường development
    if (process.env.NODE_ENV === 'development') {
      const button = document.createElement('button');
      button.textContent = 'Debug Auth';
      button.style.position = 'fixed';
      button.style.bottom = '10px';
      button.style.right = '10px';
      button.style.zIndex = '9999';
      button.style.padding = '8px 12px';
      button.style.backgroundColor = '#f0f0f0';
      button.style.border = '1px solid #ccc';
      button.style.borderRadius = '4px';
      button.style.cursor = 'pointer';
      button.style.fontSize = '12px';
      
      button.addEventListener('click', () => {
        const result = debugAuthState();
        
        if (!result.isConsistent) {
          console.error('Auth state inconsistency detected!');
        }
      });
      
      document.body.appendChild(button);
    }
  }
}