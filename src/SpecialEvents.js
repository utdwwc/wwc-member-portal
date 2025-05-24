import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './App.css';

const EventApplicationForm = () => {
    const navigate = useNavigate(); // Helps move between pages dynamically
    const location = useLocation(); // Extracts user data (userId, eventId) passed from previous page (aka: RegularEvents.js)
    const userId = location.state?.userId;
    const eventID = location.state?.eventId;
    const [submissionMessage, setSubmissionMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    /* PURPOSE: Displays Empty Application Form */
    const [formData, setFormData] = useState({
        name: '',
        pronouns: '',
        email: '',
        year: '',
        grad: '',
        history: '',
        reason: '',
    });
    const [errors, setErrors] = useState({});
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    /* PURPOSE: Updates Data Form with User Input */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    /* PURPOSE: Ensures Form is Not Left Blank */
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.pronouns) newErrors.pronouns = 'Pronouns are required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.year) newErrors.year = 'Year is required';
        if (!formData.grad) newErrors.grad = 'Expected Grad is required';
        if (!formData.history) newErrors.history = 'Name is required';
        if (!formData.reason) newErrors.reason = 'Reason is required';
        return newErrors;
    };

    /* PURPOSE: Sends Form Data to Backend */
    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        
        setIsSubmitting(true);
        try {
            const payload = {
                userId: userId,
                eventId: eventID,
                name: formData.name,
                pronouns: formData.pronouns,
                email: formData.email,
                year: formData.year,
                grad: formData.grad,
                history: formData.history,
                reason: formData.reason,
            };
            
            console.log('Submitting application:', payload);
            
            const response = await fetch('http://localhost:4000/eventapplications/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add authorization header if needed
                    // 'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server error:', errorData);
                throw new Error(errorData.message || 'Failed to submit application');
            }
    
            const data = await response.json();
            console.log('Server response:', data);
            
            setShowSuccessMessage(true);
            setSubmissionMessage('Application submitted successfully!');
            
            // Reset form (optional - you might want to keep the data)
            setFormData(prev => ({
                ...prev,
                year: '',
                reason: ''
            }));
            setErrors({});
    
        } catch (error) {
            console.error('Submission error:', error);
            setSubmissionMessage(`Error: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2>Speed Mentoring Application</h2>
            {showSuccessMessage && (
                <div style={styles.successMessage}>{submissionMessage}</div>
            )}
            <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                    <label>Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        style={styles.input}
                        placeholder="Jane Doe"
                    />
                    {errors.name && <p style={styles.error}>{errors.name}</p>}
                </div>

                <div style={styles.formGroup}>
                    <label>Pronouns:</label>
                    <input
                        type="text"
                        name="pronouns"
                        value={formData.pronouns}
                        onChange={handleChange}
                        style={styles.input}
                        placeholder="e.g., she/her, they/them"
                    />
                    {errors.pronouns && <p style={styles.error}>{errors.pronouns}</p>}
                </div>

                <div style={styles.formGroup}>
                    <label>School Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        style={styles.input}
                        placeholder="e.g., xxx123456@utdallas.edu"
                    />
                    {errors.email && <p style={styles.error}>{errors.email}</p>}
                </div>

                <div style={styles.formGroup}>
                    <label>Year:</label>
                    <input
                        type="text"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        style={styles.input}
                        placeholder="e.g., Freshman, Sophomore"
                    />
                    {errors.year && <p style={styles.error}>{errors.year}</p>}
                </div>

                <div style={styles.formGroup}>
                    <label>Expected Graduation:</label>
                    <input
                        type="text"
                        name="grad"
                        value={formData.grad}
                        onChange={handleChange}
                        style={styles.input}
                        placeholder="e.g., Spring 2026, Fall 2027"
                    />
                    {errors.grad && <p style={styles.error}>{errors.grad}</p>}
                </div>

                <div style={styles.formGroup}>
                    <label>Have you attended WWC Events before? Which was your favorite and why? If you have not attended any, put "N/A":</label>
                    <textarea
                        name="history"
                        value={formData.history}
                        onChange={handleChange}
                        style={styles.textarea}
                        placeholder="I have attended xyz and I liked..."
                    />
                    {errors.history && <p style={styles.error}>{errors.history}</p>}
                </div>

                <div style={styles.formGroup}>
                    <label>What do you hope to gain from Speed Mentoring?</label>
                    <textarea
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        style={styles.textarea}
                        placeholder="I hope to gain xyz..."
                    />
                    {errors.reason && <p style={styles.error}>{errors.reason}</p>}
                </div>

                <button
                    type="submit"
                    style={styles.button}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>

                <button
                    style={styles.button}
                    onClick={() => navigate('/regularEvents', {
                        state: {
                            UserID: userId,
                            gmail: formData.email,
                            name: formData.name
                        }
                    })}
                >
                    Back to Events
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
        margin: '0 10px',
    },
    successMessage: {
        backgroundColor: '#d4edda',
        color: '#155724',
        padding: '10px',
        margin: '10px 0',
        border: '1px solid #c3e6cb',
        borderRadius: '4px',
        textAlign: 'center',
    },
    error: {
        color: 'red',
        fontSize: '12px',
    },
};

export default EventApplicationForm;
