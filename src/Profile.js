import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  //get user object from location state
  const userFromState = location.state?.user;
  const gmail = userFromState?.gmail; //now properly nested

  useEffect(() => {
    //check if we have user data from state
    if (userFromState) {
      console.log('Using user data from navigation state');
      const { _id, googleId, ...safeUserData } = userFromState;
      setUser(safeUserData);
      setLoading(false);
      return;
    }

    setError('No user data received');
    setLoading(false);
    console.error('No user data in location state');

    // fall back to fetching if no state
    if (!gmail) {
      setError('no user specified :/');
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:4000/user/gmail/${gmail}`);
        
        if (!response.ok) {
          throw new Error(response.status === 404 
            ? 'User not found' 
            : 'Failed to fetch user data');
        }

        const userData = await response.json();
        
        // Filter out sensitive fields (IDs) before setting state
        const { _id, googleId, ...safeUserData } = userData;
        setUser(safeUserData);
        
      } catch (err) {
        setError(err.message);
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [gmail, userFromState, navigate]);

  if (loading) return <p>Loading user data...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!user) return <p>No user data available</p>;

  return (
    <div className="profile-details space-y-4">

      {/* profile header */}
      <div className="profile-header mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{user.name}'s Profile</h1>
      </div>

      {/* details grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {
          <div className="detail-card">
            <h3 className="detail-label">Points</h3>
            <p className="detail-value">{user.points || '0'}</p>
          </div>
        }

        {user.pronouns && (
          <div className="detail-card">
            <h3 className="detail-label">Pronouns</h3>
            <p className="detail-value">{user.pronouns}</p>
          </div>
        )}

        {user.major && (
          <div className="detail-card">
            <h3 className="detail-label">Major</h3>
            <p className="detail-value">{user.major}</p>
          </div>
        )}

        {user.year && (
          <div className="detail-card">
            <h3 className="detail-label">Year</h3>
            <p className="detail-value">{user.year}</p>
          </div>
        )}

        {user.utdEmail && (
          <div className="detail-card">
            <h3 className="detail-label">School Email</h3>
            <p className="detail-value">{user.utdEmail}</p>
          </div>
        )}
  </div>
  
  <div>
    <button
      onClick={() => navigate('/regularEvents', { state: { user } })}>
        Events Page
    </button>
  </div>

</div>
  );
};

export default Profile;
