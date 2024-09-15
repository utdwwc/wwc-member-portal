import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode'; // Using jwtDecode
import { useNavigate } from 'react-router-dom';

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // Use navigate hook for navigation

  const handleSuccess = (credentialResponse) => {
    console.log('Credential Response:', credentialResponse);
    const decodedToken = jwtDecode(credentialResponse.credential); // Use jwtDecode
    console.log('Decoded Token:', decodedToken);
    setUser(decodedToken);
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/'); // Redirect to home page after logout
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.heading}>Sign Up Here</h1>
        {user ? (
          <div style={styles.userInfo}>
            <h2>Welcome, {user.name}</h2>
            <p>Email: {user.email}</p>
            <button style={styles.button} onClick={() => navigate('/information')}>
              Go to Information Page
            </button>
            <button style={styles.button} onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        ) : (
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => {
              console.log('Login Failed');
            }}
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
