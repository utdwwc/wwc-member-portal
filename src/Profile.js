import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';


const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const location = useLocation(); // Add this line
  const gmail = location.state?.gmail; // Now this will work


  const fetchUser = async () => {
    try {
       console.log(gmail); 
       console.log(`Fetch URL: /user/gmail/${gmail}`);
      const response = await fetch(`http://localhost:4000/user/gmail/${gmail}`); // issue with the fetch 
      console.log("In profile, sending to setUser"); 
      if (response.ok) {
        const userData = await response.json();
        console.log("In profile, sending to setUser"); 
        setUser(userData);
      } else if (response.status === 404) {
        setError('User not found');
      } else {
        setError('Error fetching user data');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  // Fetch user data when component loads
  useEffect(() => {
    console.log('Gmail from location.state in profile:', gmail); // Add this to debug
    if (gmail) {
      fetchUser();
    } else {
      console.error('No email provided in location.state');
    }
  }, [gmail]);

  return (
    <div>
      {error && <p>{error}</p>}
      {user ? (
        <div>
          <h1>{user.name}</h1>
          <p>Email: {user.email}</p>
          <p>Pronouns: {user.pronouns}</p>
          <p>Major: {user.major}</p>
          <p>Year: {user.year}</p>
          <p>JPMorgan: {user.JPMorgan ? 'Yes' : 'No'}</p>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
};

export default Profile;
