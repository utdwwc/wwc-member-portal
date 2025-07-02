import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/Admin.css';

import OfficersTable from './components/officers/OfficersTable';
import OfficerForm from './components/officers/OfficerForm';
import EventForm from './components/tables/EventForm';
import EventTable from './components/tables/EventTable';
import SpeedMentoringTable from './components/tables/AppsTable';
import UsersTable from './components/tables/UsersTable';

const Admin = () => {
    const navigate = useNavigate(); //helps move between pages dynamically
    const location = useLocation(); //extracts user data (ID, GMail, Name) passed from previous page
    const adminUser = location.state?.user;
    const [events, setEvents] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    /* PURPOSE: Redirects User if not the Authorized Admin */
    useEffect(() => {
        //first check if adminUser exists
        if (!adminUser) {
            navigate('/regularevents');
            alert("unauthorized access so GET OUT");
            return;
        }
        
        //then check the email condition
        if (adminUser.email === "utdwwc@gmail.com" &&
            adminUser.utdEmail === "utdwwc@gmail.com") {
            navigate('/regularevents');
            alert("unauthorized access so GOODBYE");
        }
    }, [adminUser, navigate]);

    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>
            {errorMessage && <p className="admin-error">{errorMessage}</p>}

                <button
                    className="event-button event-button--primary"
                    onClick={() => navigate('/regularEvents')}
                >
                    Back to Events
                </button>

                <button
                    className="event-button event-button--primary"
                    onClick={() => navigate('/')}
                >
                    Homepage
                </button>

            <div className="event-form-wrapper">
              <EventForm onEventCreated={(newEvent) => {
                setEvents(prevEvents => [...prevEvents, newEvent]);
              }} />
              <EventTable />
              <SpeedMentoringTable />
              <UsersTable />
            </div>
            <div className="officer-form-wrapper">
              <OfficerForm />
              <OfficersTable />
            </div>

    </div>
    );
};

export default Admin;
