import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Modal from './Modal'; // Adjust the path to your Modal component
import './App.css';

const EventApplicationForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const userId = location.state?.userId;
    const eventID = location.state?.eventId; 


    const [formData, setFormData] = useState({
        email: '',
        name: '',
        year: '',
        reason: '',
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.year) newErrors.year = 'Year is required';
        if (!formData.reason) newErrors.reason = 'Reason is required';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
        } else {
            try {
                const payload = {
                    userId: userId,
                    eventId: eventID,
                    name: formData.name,
                    email: formData.email,
                    year: formData.year,
                    reason: formData.reason,
                };
                console.log('Sending data to the server:', payload);
                // Send data to the server, including eventID and userId
                const response = await fetch(`http://localhost:4000/eventapplications/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: userId,
                        eventId: eventID,
                        name: formData.name,
                        email: formData.email,
                        year: formData.year,
                        reason: formData.reason,
                    }),
                });

                const data = await response.json();
                console.log(data.message); // Handle success or error messages from the server
                
                // Reset form after submission
                // setFormData({
                //     email: '',
                //     name: '',
                //     year: '',
                //     reason: '',
                // });
                // setErrors({});
            } catch (error) {
                console.error('Error submitting application:', error);
            }
        }
    };

    return (
        <div style={styles.container}>
            <h2>Event Application Form</h2>
            <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        style={styles.input}
                    />
                    {errors.email && <p style={styles.error}>{errors.email}</p>}
                </div>

                <div style={styles.formGroup}>
                    <label>Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        style={styles.input}
                    />
                    {errors.name && <p style={styles.error}>{errors.name}</p>}
                </div>

                <div style={styles.formGroup}>
                    <label>Year:</label>
                    <input
                        type="text"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        style={styles.input}
                    />
                    {errors.year && <p style={styles.error}>{errors.year}</p>}
                </div>

                <div style={styles.formGroup}>
                    <label>Why do you want to attend this event?</label>
                    <textarea
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        style={styles.textarea}
                    />
                    {errors.reason && <p style={styles.error}>{errors.reason}</p>}
                </div>

                <button type="submit" style={styles.button}>
                    Submit Application
                </button>
            </form>
        </div>
    );
};

// Inline styles for basic styling
const styles = {
    container: {
        fontFamily: 'Arial, sans-serif',
        margin: '20px auto',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        maxWidth: '500px',
    },
    formGroup: {
        marginBottom: '15px',
    },
    input: {
        width: '100%',
        padding: '10px',
        marginTop: '5px',
        border: '1px solid #ccc',
        borderRadius: '4px',
    },
    textarea: {
        width: '100%',
        padding: '10px',
        marginTop: '5px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        height: '100px',
    },
    button: {
        backgroundColor: '#28a745',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
    },
    error: {
        color: 'red',
        fontSize: '12px',
    },
};

export default EventApplicationForm;
