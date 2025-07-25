import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Routing import
import { GoogleOAuthProvider } from '@react-oauth/google'; // Google OAuth
import './css/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Information from './Infomation';
import RegularEventsPage from './RegularEvents';
import EventApplicationForm from './SpecialEvents';
import EventCheckIn from './EventCheckIn';
import Admin from './Admin'; 
import Profile from './Profile'; 
import Homepage from './Homepage';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="998314684026-iq3l5tljgpk95lco3t959jc8aq4mpcu0.apps.googleusercontent.com">
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<App />} />
          <Route path="/regularEvents" element={<RegularEventsPage />} />
          <Route path="/eventapplications" element={<EventApplicationForm />} />
          <Route path="/eventCheckIn/:eventID" element = {<EventCheckIn/>} />
          <Route path="/profile" element = {<Profile/>} />
          <Route path="/information" element={<Information />} />
          <Route path="/admin" element = {<Admin/>} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
