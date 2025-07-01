import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setAuthLoading(false);
  }, []);

  const handleGoogleSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;
    const decodedToken = jwtDecode(token);

    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) throw new Error('Login failed');

      const { _id, name, email, utdEmail, token: backendToken } = await response.json();
      const userData = {
        _id,
        name,
        email,
        utdEmail,
        token: backendToken
      };

      localStorage.setItem('token', backendToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData; // Return user data for immediate use
    } catch (err) {
      console.error('Google login error:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      throw err; // Re-throw for error handling in components
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return { 
    user,
    loading: authLoading,
    handleGoogleSuccess,
    handleLogout
  };
};