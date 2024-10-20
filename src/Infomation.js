import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Information() {
  const navigate = useNavigate(); 
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
  const [ UserID, setUserID] = useState(null); 


  useEffect(() => {
    console.log(JPMorgan);
  }, [JPMorgan]);

 

  const collectData = async (e) => {
    e.preventDefault();
  
  
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('pronouns', pronouns); 
    formData.append('major', major); 
    formData.append('year', year); 
    formData.append('JPMorgan', JPMorgan ? 'true' : 'false'); 
    if (resume) formData.append('resume', resume);
  
    try {
      let result = await fetch('http://localhost:4000/', {
        method: 'POST',
        body: formData,
      });
  
      if (!result.ok) {
        throw new Error(`HTTP error1! status: ${result.status}`);
      }
  
      const contentType = result.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new TypeError("Received non-JSON response");
      }
  
      result = await result.json();
      localStorage.setItem("user", JSON.stringify(result));
      setUserID(result._id); // Save the user ID in the state
        console.log(UserID); 
  
      // Fetch the resume using the user ID
      const resumeResponse = await fetch(`http://localhost:4000/user/${result._id}/resume`);
      if (!resumeResponse.ok) {
        throw new Error(`HTTP error2! status: ${resumeResponse.status}`);
      }
  
      const resumeBlob = await resumeResponse.blob();
      const resumeUrl = URL.createObjectURL(resumeBlob);
      setResumeUrl(resumeUrl); // Set the URL for the resume
  
      // Fetch user information
      const userResponse = await fetch(`http://localhost:4000/user/${result._id}`);
      if (!userResponse.ok) {
        throw new Error(`HTTP error3! status: ${userResponse.status}`);
      }
  
      const userData = await userResponse.json();
      setUserInfo(userData); // Set the user information
      setGreeting(`Hello ${userData.name} (${userData.email})`); // Set greeting with name and email
    } catch (error) {
      console.error('Error:', error);
    }
  };

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
            <label className='form-label'>Username</label>
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className='form-label'>Email Address</label>
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
          <div>
            <label className='form-label'>JPMorgan</label>
            <input
  type='checkbox'
  name='jpmorgan'
  onChange={(e) => { setJPMorgan(e.target.checked) }} // This should set the value to true/false
  checked={JPMorgan}
/>
          </div>
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
          <button style={styles.button} onClick={() => navigate('/regularEvents', { state: {UserID} })}>
    Events Page
</button>
          <div>
          <p><strong>Name:</strong> {userInfo.name}</p>
          <p><strong>Email:</strong> {userInfo.email}</p> 
          </div>
        </form>

        {/* Display greeting message with user's name and email */}
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
