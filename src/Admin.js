import React, { useEffect, useState } from 'react';

const Admin = () => {
    const [events, setEvents] = useState([]);
    const [users, setUsers] = useState([]);
    const [eventData, setEventData] = useState({
        title: '',
        description: '',
        date: '',
        location: ''
    });
    const [errorMessage, setErrorMessage] = useState('');

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:4000/admin/users', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                setErrorMessage(errorData.message);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleEventChange = (e) => {
        setEventData({ ...eventData, [e.target.name]: e.target.value });
    };

    const createEvent = async (eventData) => {
        try {
            const response = await fetch('http://localhost:4000/admin/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(eventData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                setErrorMessage(errorData.message);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Event created:', data);
        } catch (error) {
            console.error('Error creating event:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div>
            <h1>Admin Dashboard</h1>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            <h2>Create Event</h2>
            <form onSubmit={createEvent}>
                <input type="text" name="title" placeholder="Event Title" value={eventData.title} onChange={handleEventChange} required />
                <input type="text" name="description" placeholder="Event Description" value={eventData.description} onChange={handleEventChange} required />
                <input type="date" name="date" value={eventData.date} onChange={handleEventChange} required />
                <input type="text" name="location" placeholder="Event Location" value={eventData.location} onChange={handleEventChange} required />
                <button type="submit">Create Event</button>
            </form>
            <h2>Registered Users</h2>
            <ul>
                {users.map(user => (
                    <li key={user._id}>{user.name} - {user.email}</li>
                ))}
            </ul>
        </div>
    );
};

export default Admin;
