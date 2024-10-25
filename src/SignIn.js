import React, { useState } from 'react';

// Consider the event to be coding workshop: 6701cc315e02bdc39d7666ae
const SignIn = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const eventID = '6701cc315e02bdc39d7666ae'; 

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    console.log('Sending data:', { email, eventID });

    try {
      const response = await fetch('http://localhost:4000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, eventID }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Only call response.json() once
      const data = await response.json();
      console.log('Success:', data);
      
      // Set message after successful fetch
      setMessage(data.message);
    } catch (error) {
      console.error('Fetch error:', error);
      setMessage('An error occurred during check-in.'); // Set a user-friendly error message
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
      <h2>Event Check-In</h2>
      <form onSubmit={handleSubmit} style={{ width: '300px', display: 'flex', flexDirection: 'column' }}>
        <label htmlFor="email">Enter Your Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '8px', margin: '10px 0' }}
        />
        <button type="submit" style={{ padding: '8px', backgroundColor: '#4CAF50', color: 'white', cursor: 'pointer' }}>
          Check In
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default SignIn;
