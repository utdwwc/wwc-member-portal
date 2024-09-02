import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

function App() {
  const [user, setUser] = useState(null);

  const handleSuccess = (credentialResponse) => {
    console.log('Credential Response:', credentialResponse);
    const decodedToken = jwtDecode(credentialResponse.credential);
    console.log('Decoded Token:', decodedToken);
    setUser(decodedToken);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.heading}>Sign Up Here</h1>
        {user ? (
          <div style={styles.userInfo}>
            <h2>Welcome, {user.name}</h2>
            <p>Email: {user.email}</p>
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
};

export default App;
