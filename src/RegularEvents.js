import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Modal from './Modal'; // Adjust the path to your Modal component
import './App.css';


const RegularEventsPage = () => {
    const navigate = useNavigate(); // Helps move between pages dynamically
    const location = useLocation(); // Extracts user data (ID, GMail, Name) passed from previous page
    const userId = location.state?.UserID;
    const gmail = location.state?.gmail; 
    const name = location.state?.name; 
    const [isChecked, setIsChecked] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); // State to control the modal
    const eventIDSpeedMentoring = '670949b3d99b8db6027933c7'; 
    const eventIDCodingWorkshop = '6701cc315e02bdc39d7666ae'; 
    
    // Logs user info when component loads
    // Debugging: Helps verify that user data is correctly passed into this page
    useEffect(() => {
        console.log("UserID:", userId);
        console.log("Gmail:", gmail);
        console.log("Name:", name);
    }, [userId, gmail, name]);
    
    // If checked: sends an RSVP request to the backend
    const handleCheckboxChange = async () => {
        const newCheckedStatus = !isChecked;
        setIsChecked(newCheckedStatus);

        try {
            // FETCH (POST/): Sends data (userId, userName, and isChecked) to backend
            const response = await fetch(`http://localhost:4000/regularevents/${eventIDCodingWorkshop}/rsvp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    userName: name,   
                    isChecked: newCheckedStatus,
                }),
            });
            const data = await response.json();
            console.log(data.message);
            if (newCheckedStatus) {
                setIsModalOpen(true); // If RSVP was checked, this opens a modal for adding the event to Google Calendar
            }
        } catch (error) {
            console.error('Error updating RSVP:', error);
        }
    };

    // Generates a Google Calendar event link with event details
    const handleAddToCalendar = () => {
        const eventTitle = encodeURIComponent("Coding Workshop");
        const eventDescription = encodeURIComponent("Join us for an exciting coding workshop where you will learn the basics of web development and build your first website!");
        const eventLocation = encodeURIComponent("Room 101, Main Building");
        const eventStartDate = encodeURIComponent("2024-10-15T10:00:00"); // Adjust the time
        const eventEndDate = encodeURIComponent("2024-10-15T12:00:00"); // Adjust the time

        const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&details=${eventDescription}&location=${eventLocation}&dates=${eventStartDate}/${eventEndDate}`;
        
        window.open(calendarUrl, '_blank'); // Open the link in a new tab
        setIsModalOpen(false); // Close the modal
    };

    return (
        <div>
        {/* Page title outside the container */}
        <h1 style={styles.pageTitle}>Regular Events Page</h1>
        <div style={styles.container}>
            <h1 style={styles.title}>Event: Coding Workshop</h1>
            <p><strong>Description:</strong> Join us for an exciting coding workshop where you will learn the basics of web development and build your first website!</p>
            <p><strong>Date:</strong> October 15, 2024</p>
            <p><strong>Location:</strong> Room 101, Main Building</p>
            
            <label style={styles.label}>
                <input 
                    type="checkbox" 
                    checked={isChecked} 
                    onChange={handleCheckboxChange} 
                    style={styles.checkbox} 
                />
                RSVP
            </label>
            {isChecked && <p style={styles.confirmation}>You have RSVPed!</p>}
            
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onAddToCalendar={handleAddToCalendar} 
            />
        </div>
        <div style={styles.container}>
            <h1 style={styles.title}>Event: Speed Mentoring</h1>
            <p><strong>Description:</strong> Join us for an exciting coding workshop where you will learn the basics of web development and build your first website!</p>
            <p><strong>Date:</strong> October 15, 2024</p>
            <p><strong>Location:</strong> Room 101, Main Building</p>
            <button style={styles.button} onClick={() => navigate('/specialEvents', { state: {userId, eventId : eventIDSpeedMentoring} })}>
    Go to Application
</button>
            
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onAddToCalendar={handleAddToCalendar} 
            />
           <button style={styles.button} onClick={() => navigate('/admin')}>
    Go to Admin
</button>
<button style={styles.button} onClick={() => {
    console.log("Navigating to Profile with gmail:", gmail);
    navigate('/profile', { state: {gmail} })}}>
    Go to Profile
</button>
            
        </div>
        </div> 
    );
};

// Inline styles for basic styling
const styles = {
    container: {
        fontFamily: 'Arial, sans-serif',
        margin: '20px',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        maxWidth: '600px',
    },
    title: {
        color: '#333',
    },
    label: {
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
    },
    checkbox: {
        marginRight: '10px',
    },
    confirmation: {
        color: 'green',
        marginTop: '10px',
    }
};

export default RegularEventsPage;
