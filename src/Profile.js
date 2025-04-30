import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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
    console.log('navigation state received:', location.state);

    //check if we have user data from state
    if (userFromState) {
      const { _id, googleId, ...safeUserData } = userFromState;
      setUser(safeUserData);
      setLoading(false);
      return;
    }

    //fall back toi fetching by gmail if no state
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

      {/* Profile Header */}
      <div className="profile-header mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{user.name}'s Profile</h1>
        {user.email || user.gmail ? (
          <p className="text-gray-600 mt-1">{user.email || user.gmail}</p>
        ) : null}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pronouns */}
        {user.pronouns && (
          <div className="detail-card">
            <h3 className="detail-label">Pronouns</h3>
            <p className="detail-value">{user.pronouns}</p>
          </div>
        )}

        {/* Major */}
        {user.major && (
          <div className="detail-card">
            <h3 className="detail-label">Major</h3>
            <p className="detail-value">{user.major}</p>
          </div>
        )}

        {/* Year */}
        {user.year && (
          <div className="detail-card">
            <h3 className="detail-label">Year</h3>
            <p className="detail-value">{user.year}</p>
          </div>
        )}
  </div>
</div>
  );
};

export default Profile;
