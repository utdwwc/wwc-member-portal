import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Information() {
  const navigate = useNavigate();
  const location = useLocation(); // Add this line
  const gmail = location.state?.email; // Now this will work
  const [resume, setFile] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pronouns, setPronouns] = useState(""); 
  const [major, setMajor] = useState(""); 
  const [year, setYear] = useState(""); 
  const [JPMorgan, setJPMorgan] = useState(false);
  const [password, setPassword] = useState("");
  const [resumeUrl, setResumeUrl] = useState(""); // State to store the resume URL
  const [greeting, setGreeting] = useState(""); // State to store the greeting message
  const [userInfo, setUserInfo] = useState({}); // State to store user information
  const [userID, setUserID] = useState(null); 
  
  
  const collectData = async (e) => {
    e.preventDefault();

  // TESTING RQ: Validate required fields
  if (!name || !email || !gmail || !password) {
    alert('Please fill all required fields');
    return;
  }
  
  const formData = new FormData();
  formData.append('name', name);
  formData.append('email', email);
  formData.append('gmail', gmail); 
  formData.append('password', password);
  formData.append('pronouns', pronouns); 
  formData.append('major', major); 
  formData.append('year', year); 
  formData.append('JPMorgan', JPMorgan ? 'true' : 'false');
  if (resume) formData.append('resume', resume);
  
  try {
    console.log([...formData.entries()]);//debugging

    // FETCH (POST/): Sends user data to backend + stores user ID
    let result = await fetch('http://localhost:4000/', {
      method: 'POST',
      body: formData,
    });
  
    if (!result.ok) {
      const errorData = await result.json();
      alert(errorData.message || `Error: ${result.status}`);
      return;
    }      
  
    const contentType = result.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new TypeError("Received non-JSON response");
    }
  
    result = await result.json();
    localStorage.setItem("user", JSON.stringify(result));
    setUserID(result._id); // Updates state with user's ID
    console.log(userID); 

    navigate('/regularEvents');
  
    // FETCH (GET/): Retrieves the user's uploaded resume
    const resumeResponse = await fetch(`http://localhost:4000/user/${result._id}/resume`);
    if (!resumeResponse.ok) {
      throw new Error(`HTTP error2! status: ${resumeResponse.status}`);
    }
  
    const resumeBlob = await resumeResponse.blob();
    const resumeUrl = URL.createObjectURL(resumeBlob); // Creates downloadable URL for file
    setResumeUrl(resumeUrl); // Makes resume available for viewing
  
    // FETCH (GET/): Retrieves user details to display 
    const userResponse = await fetch(`http://localhost:4000/user/${result._id}`);
    if (!userResponse.ok) {
      throw new Error(`HTTP error3! status: ${userResponse.status}`);
    }
  
    const userData = await userResponse.json();
    setUserInfo(userData); // Updates state with user's info
    setGreeting(`Hello ${userData.name} (${userData.email})`); // Set greeting with name and email
  } catch (error) {
    console.error('Error:', error);
  }
};

useEffect(() => {
  console.log(userID);
}, [userID]); 

const viewResume = () => {
  if (resumeUrl) {
    window.open(resumeUrl, '_blank'); // Open the resume URL in a new tab/window
  } else {
    alert('No resume available to view.');
  }
};
  
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <form onSubmit={collectData}>
          <h2>Enter Your Details!</h2>
          <div>
            <label className='form-label'>Preferred Name</label>
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className='form-label'>UTD Student Email</label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className='form-label'>Password</label>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className='form-label'>Pronouns</label>
            <input
              type='text'
              value={pronouns}
              onChange={(e) => setPronouns(e.target.value)}
            />
          </div>
          <div>
            <label className='form-label'>Major</label>
            <input
              type='text'
              value={major}
              onChange={(e) => setMajor(e.target.value)}
            />
          </div>
          <div>
            <label className='form-label'>Year</label>
            <input
              type='text'
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </div>
          {/*<div>
            <label className='form-label'>JPMorgan</label>
            <input
              type='checkbox'
              name='jpmorgan'
              onChange={(e) => { setJPMorgan(e.target.checked) }} // This should set the value to true/false
              checked={JPMorgan}
            />
          </div>*/}
          <div>
            <label className='form-label'>Resume</label>
            <input
              type='file'
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
          <button type='submit'>Submit</button>
          <button
            type='button'
            onClick={viewResume}
            style={{ marginTop: '10px' }}
          >
            View Resume
          </button>
          <div>
            <button style={styles.button} onClick={() => navigate('/regularEvents', { state: {userID, name, gmail} })}>
              Events Page
            </button>
          </div>
        </form>

        {greeting && (
          <div style={styles.greeting}>
            <h3>{greeting}</h3>
          </div>
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
    background: '#f5f5f5',
  },
  card: {
    background: '#fff',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  greeting: {
    marginTop: '20px',
    color: '#333',
  },
};

export default Information;
