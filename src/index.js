import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Routing import
import { GoogleOAuthProvider } from '@react-oauth/google'; // Google OAuth
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Information from './Infomation';
import RegularEventsPage from './RegularEvents';
import SpecialEvents from './SpecialEvents';
import SignIn from './SignIn';
import Admin from './Admin'; 
import Profile from './Profile'; 


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="998314684026-iq3l5tljgpk95lco3t959jc8aq4mpcu0.apps.googleusercontent.com">
      <Router> {/* Wrapping App in Router */}
      <Routes>
          <Route path="/" element={<App />} />
          <Route path="/information" element={<Information />} />
          <Route path="/regularEvents" element={<RegularEventsPage />} />
          <Route path="/specialEvents" element={<SpecialEvents />} />
          <Route path="/signIn" element = {<SignIn/>} />
          <Route path="/admin" element = {<Admin/>} />
          <Route path="/profile" element = {<Profile/>} />
        </Routes>
        <App />
      </Router>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
