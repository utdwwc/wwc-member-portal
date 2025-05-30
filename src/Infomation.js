import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './css/Information.css';

function Information() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [user, setUser] = useState(null); //testing 04/29/25
  const [formData, setFormData] = useState({
    pronouns: '',
    major: '',
    year: '',
    utdEmail: ''
  });
  const [loading, setLoading] = useState({
    profile: false,
    resume: false,
    initialLoad: true
  });
  const [error, setError] = useState(null);

  console.log('Current user state:', user);
  console.log('Location state:', state);
  

  /*PURPOSE: Check for User on Component Mount*/
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      console.warn('No user found in localStorage, redirecting to login');
      navigate('/'); //redirect to login if no user data
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    console.log('User from localStorage:', parsedUser);
    setUser(parsedUser);

    //use localStorage user if state is null
    if (!state && parsedUser) {
      console.log('Using user data from localStorage');
      setFormData({
        pronouns: parsedUser.pronouns || '',
        major: parsedUser.major || '',
        year: parsedUser.year || '',
        utdEmail: parsedUser.utdEmail || ''
      });
    }
  }, [navigate]);

  /* PURPOSE: Pre-fill Form with Existing User Data if Available */
  useEffect(() => {
    if (state?.user) {
      console.log('Using user data from location state');
      setFormData({
        pronouns: state.user.pronouns || '',
        major: state.user.major || '',
        year: state.user.year || '',
        utdEmail: state.user.utdEmail || ''
      });
    }
  }, [state]);

  /* PURPOSE: Updates Backend with New Form Inputs */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  /* PURPOSE: Updates Profile in Backend with Form Details */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?._id) {
      console.error('No user ID available');
      setError('User not properly loaded');
      return;
    }

    //add early return if no changes detected
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (JSON.stringify(formData) === JSON.stringify({
      pronouns: currentUser.pronouns || '',
      major: currentUser.major || '',
      year: currentUser.year || '',
      utdEmail: currentUser.utdEmail || currentUser.email || ''
    })) {
      console.log('No changes detected');
      return;
    }

    console.log('Form submission started');
    setError(null);

    try {
      //update profile data
      console.log('Updating profile data:', formData);
      const response = await fetch(
        `http://localhost:4000/user/${user._id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(formData)
        }
      );

      if (!response.ok) {
        const errorMsg = `Profile update failed with status ${response.status}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      const updatedUser = await response.json();
      console.log('Profile update successful:', updatedUser);
      navigate('/profile', { state: { user: updatedUser } });
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.message);
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
      console.log('Form submission completed');
    }
  };

  if (!user) {
    console.log('User data not loaded yet, showing loading state');
    return <div>Loading...</div>;
  }
  
  return (
    <div className="information-form">
    {error && <div className="error">{error}</div>}
      <div className="information-container">
      <div className="information-card">

        <form onSubmit={handleSubmit}>
          <h2>Update Your Profile!</h2>

          <div className="form-group">
            <label>Pronouns</label>
            <input
              type='text'
              name="pronouns"
              value={formData.pronouns}
              onChange={handleChange}
              placeholder="e.g., they/them"
            />
          </div>

          <div className="form-group">
            <label>Major</label>
            <input
              type='text'
              name="major"
              value={formData.major}
              onChange={handleChange}
              placeholder="Your major"
            />
          </div>

          <div className="form-group">
            <label>Year</label>
            <input
              type='text'
              name="year"
              value={formData.year}
              onChange={handleChange}
              placeholder="e.g., Freshman, Sophomore"
            />
          </div>

          <div className="form-group">
            <label>UTD Email</label>
            <input
              type='email'
              name="utdEmail"
              value={formData.utdEmail}
              onChange={handleChange}
              placeholder="abc123456@utdallas.edu"
            />
          </div>

          <button
            className="information-button"
            type='submit'
            disabled={loading.profile || loading.resume}
          >
            Save
          </button>

          <div>
            <button
              className="information-button"
              onClick={() => navigate('/profile', { state: { user } })}
            >
              Back to Profile
            </button>
          </div>

        </form>
      </div>
    </div>
    </div>
  );
}

export default Information;
