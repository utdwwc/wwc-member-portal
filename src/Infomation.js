import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Information.css';

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
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUrl, setResumeUrl] = useState(null); // For viewing existing resume
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

      if (parsedUser._id) {
        fetchResume(parsedUser._id).finally(() => {
          setLoading(prev => ({ ...prev, initialLoad: false }));
        });
      } else {
        setLoading(prev => ({ ...prev, initialLoad: false }));
      }
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

      //load existing resume if available
      if (state.user._id) {
        console.log('Fetching resume for user:', state.user._id);
        fetchResume(state.user._id);
      }
    }
  }, [state]);

  /* PURPOSE: Fetch Resume if it Exists in the Database */
  const fetchResume = async (userId) => {
    try {
      console.log(`Fetching resume for user ${userId}`);
      const response = await fetch(`http://localhost:4000/user/${userId}/resume`);
      
      if (response.ok) {
        console.warn(`Resume fetch failed with status: ${response.status}`);
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      console.log('Resume URL created:', url);
      setResumeUrl(url);
    } catch (err) {
      console.error('Error fetching resume:', err);
    }
  };

  /* PURPOSE: If User Uploads Different Resume */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file && file.size > 5 * 1024 * 1024) { // 5MB limit
      const errorMsg = 'File size too large (max 5MB)';
      console.warn(errorMsg);
      setError(errorMsg);
      return;
    }
    console.log('Selected file:', file.name, file.size);
    setResumeFile(file);
    setError(null);
  };

  /* PURPOSE: Updates Backend with New Resume */
  const uploadResume = async () => {
    if (!resumeFile || !state?.user?._id) {
      console.warn('No resume file or user ID for upload');
      return;
    }
    
    console.log('Starting resume upload');
    setLoading(prev => ({ ...prev, resume: true }));

    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);

      const response = await fetch(
        `http://localhost:4000/user/${state.user._id}/resume`,
        { method: 'POST', body: formData }
      );

      if (!response.ok) {
        const errorMsg = `Upload failed with status ${response.status}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      const result = await response.json();
      console.log('Resume upload successful:', result);
      await fetchResume(state.user._id); //refresh resume view
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, resume: false }));
      console.log('Resume upload completed');
    }
  };

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
    }) && !resumeFile) {
      console.log('No changes detected');
      return;
    }

    console.log('Form submission started');
    setLoading(prev => ({ ...prev, profile: true }));
    setError(null);

    try {
      //upload resume first if new file was selected
      if (resumeFile) {
        console.log('New resume detected, uploading first');
        await uploadResume();
      }

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

  if (loading.initialLoad) return <div>Loading user data...</div>;
  if (!user) {
    console.log('User data not loaded yet, showing loading state');
    return <div>Loading...</div>;
  }
  
  return (
    <div className="information-form">
    {error && <div className="error">{error}</div>}
      <div style={styles.container}>
      <div style={styles.card}>

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

          <div className="form-group">
          <label>Resume</label>
          {resumeUrl && (
            <div className="resume-actions">
              <a 
                href={resumeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="resume-link"
              >
                View Current Resume
              </a>
              <span> or replace it </span>
            </div>
          )}
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            disabled={loading.resume}
          />
          {loading.resume && <small>Uploading resume...</small>}
          <small>Upload new PDF or Word document</small>
        </div>

          <button
            type='submit'
            disabled={loading.profile || loading.resume}
          >
            Save Profile
          </button>

          <div>
            <button
              style={styles.button}
              onClick={() => navigate('/regularEvents', { state: { user } })}>
              Events Page
            </button>
          </div>

        </form>
      </div>
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
    background: '#f5f5f5',
  },
  card: {
    background: '#fff',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    width: '400px',
    maxWidth: '90%'
  },
  button: {
    marginTop: '10px',
    width: '100%'
  }
};

export default Information;
