import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './App.css';

const RegularEventsPage = () => {
    const location = useLocation();
    const userId = location.state?.UserID; // Use UserID instead of userId
    const [isChecked, setIsChecked] = useState(false);


    const handleCheckboxChange = async () => {
        const newCheckedStatus = !isChecked;
        setIsChecked(newCheckedStatus);

        try {
            // Send a POST request to update the RSVP status in the backend
            const response = await fetch(`http://localhost:4000/regularevents/6701cc315e02bdc39d7666ae/rsvp`, { // Replace eventID (the last numbers) with the eventID of the specific event
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,  // The current user's ID
                    isChecked: newCheckedStatus, // RSVP status (true/false)
                }),
            });
            const data = await response.json();
            console.log(data.message);
        } catch (error) {
            console.error('Error updating RSVP:', error);
        }
    };

    return (
        <div style={styles.container}>
            <h1>Regular Events Page</h1>
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
