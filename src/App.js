import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode'; // Using jwtDecode
import { useNavigate } from 'react-router-dom';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  //check for exsting user on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, []);

  const handleSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;
    const decodedToken = jwtDecode(token);// use jwtDecode
    console.log('Google Token:', decodedToken);

    try {
      //send token to your backend for verification
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) throw new Error('Login failed');

      const { _id, name, email, utdEmail, token: backendToken } = await response.json();
      console.log('User data received from backend:', {_id, name, email, utdEmail});

      const userData = {
        _id,
        name,
        email: email,
        token: backendToken
      };

      //store user data
      localStorage.setItem('token', backendToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      console.log('Login successful. MongoDB _id:', _id);
      navigate('/information'); //redirect after login
    } catch (err) {
      console.error('Google login error: ', err.message);
      //clear data on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.heading}>Women Who Compute Club</h1>
        {user ? (
          <div style={styles.userInfo}>
            <h2>Welcome, {user.name}</h2>
            <p>Email: {user.utdEmail}</p>
            <button
              style={styles.button}
              onClick={() => navigate('/information', {
                state: {
                  user: {
                    _id: user._id,
                    pronouns: user.pronouns,
                    major: user.major,
                    year: user.year,
                    utdEmail: user.utdEmail
                  }
                }
              })}
            >
              Go to Information Page
            </button>
            <button style={styles.button} onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        ) : (
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => console.log('Login Failed')}
          />
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #f8f9fa, #c9d6df)',
    fontFamily: 'Arial, sans-serif',
  },
  card: {
    background: '#fff',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    maxWidth: '400px',
    width: '100%',
  },
  heading: {
    color: '#333',
    marginBottom: '20px',
    fontSize: '24px',
  },
  userInfo: {
    fontSize: '18px',
    marginTop: '20px',
  },
  button: {
    background: '#4285F4',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '20px',
    marginRight: '10px',
  },
};

export default App;
