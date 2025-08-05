import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './css/Profile.css';

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
  const fetchUser = async () => {
    try {
      //get user ID from localStorage (more reliable than gmail)
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser?._id) {
        navigate('/');
        return;
      }

      //fetch fresh data from backend
      const response = await fetch(`http://localhost:4000/user/${storedUser._id}`, {
        headers: { 'Authorization': `Bearer ${storedUser.token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch user');
      const userData = await response.json();
      setUser(userData); //no need to filter out _id/googleId here
      
    } catch (error) {
      console.error('Error fetching user:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  fetchUser();
}, [navigate]);

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

        {user.attendedEvents?.length > 0 ? (
          <div className="detail-card">
            <h3 className="detail-label">Attended Events</h3>
            <ul className="detail-value list-disc pl-5 space-y-1">
              {user.attendedEvents.map(event => (
                <li key={event._id}>{event.title}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="detail-card">
            <h3 className="detail-label">Attended Events</h3>
            <p className="detail-value">No events attended yet</p>
          </div>
        )}
   </div>
  
  <div>
    <button 
      className='event-button event-button--primary'
      onClick={() => navigate('/regularEvents', { state: { user } })}>
        Back to Events
    </button>

    <button
      className='event-button event-button--primary'
      onClick={() => navigate('/information', { state: { user } })}>
        Update Your Profile
    </button>
  </div>

</div>
  );
};

export default Profile;
