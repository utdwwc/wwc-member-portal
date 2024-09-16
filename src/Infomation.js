import React, { useState } from 'react';

function Information() {
  const [resume, setFile] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pronouns, setPronouns] = useState(""); 
  const [major, setMajor] = useState(""); 
  const [year, setYear] = useState(""); 
  const [password, setPassword] = useState("");
  const [resumeUrl, setResumeUrl] = useState(""); // State to store the resume URL
  const [greeting, setGreeting] = useState(""); // State to store the greeting message
  const [userInfo, setUserInfo] = useState({}); // State to store user information

  const collectData = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('pronouns', pronouns); 
    formData.append('major', major); 
    formData.append('year', year); 
    if (resume) formData.append('resume', resume);
  
    try {
      let result = await fetch('http://localhost:4000/', {
        method: 'POST',
        body: formData,
      });
  
      if (!result.ok) {
        // Handle non-200 responses
        throw new Error(`HTTP error! status: ${result.status}`);
      }
  
      const contentType = result.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Handle non-JSON responses
        throw new TypeError("Received non-JSON response");
      }
  
      result = await result.json();
      localStorage.setItem("user", JSON.stringify(result));
  
      // Fetch the resume using the user ID
      const resumeResponse = await fetch(`http://localhost:4000/user/${result._id}/resume`);
      if (!resumeResponse.ok) {
        throw new Error(`HTTP error! status: ${resumeResponse.status}`);
      }
  
      const resumeBlob = await resumeResponse.blob();
      const resumeUrl = URL.createObjectURL(resumeBlob);
      console.log('Resume URL:', resumeUrl); // Debug: Check the URL
      setResumeUrl(resumeUrl); // Set the URL for the resume
  
      // Fetch user information
      const userResponse = await fetch(`http://localhost:4000/user/${result._id}`);
      if (!userResponse.ok) {
        throw new Error(`HTTP error! status: ${userResponse.status}`);
      }
  
      const userData = await userResponse.json();
      setUserInfo(userData); // Set the user information
      setGreeting(`Hello ${name} (${email})`);
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
        
        </form>
        
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
