import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode'; // Using jwtDecode
import { useNavigate } from 'react-router-dom';
import './css/App.css';

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
      navigate('/regularevents'); //redirect after login
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
    <div className="container">
      <div className="card">
        <h1 className="heading">Women Who Compute Club</h1>
        {user ? (
          <div className="user-info">
            <h2>Welcome, {user.name}</h2>
            <p>Email: {user.utdEmail}</p>
            <button
              className="button"
              onClick={() => navigate('/regularevents', {
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
              Events Page
            </button>
            <button className="button" onClick={handleLogout}>
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

export default App;
