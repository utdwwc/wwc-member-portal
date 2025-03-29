import React, { useEffect, useState } from 'react';

const Admin = () => {
    /* PURPOSE: State Initialization */
    const [events, setEvents] = useState([]);
    const [users, setUsers] = useState([]);
    const [eventData, setEventData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        appReq: false, //changed from isSpecial
        points: 0,
    });
    const [errorMessage, setErrorMessage] = useState('');

    /* PURPOSE: Retrieves List of Registered Users from Backend */
    const fetchUsers = async () => {
        setErrorMessage('');
        
        try { //TESTING: simplified endpint without token (for now)
            const response = await fetch('http://localhost:4000/users');
            const data = await response.json();
            setUsers(data);
          } catch (err) {
            setUsers([]); //ensure state is always an array
          }

        /* TESTINGGGG RQQQQ: with tokens
        try {
          // Get the token from localStorage or user object
        let token = localStorage.getItem('token');
    
        // If no token, try to get it from the user object
        if (!token) {
            const userData = localStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                token = user.token;
                console.log('Retrieved token from user object:', token);
            }
        }
          
          const response = await fetch('http://localhost:4000/admin/users', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
      
          console.log('Response status:', response.status); // Log status (200, 403, etc.)
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Backend error:', errorData); // Detailed error
            setErrorMessage(errorData.message || 'Failed to fetch users');
            return;
          }
      
          const data = await response.json();
          console.log('Fetched users:', data); // Log actual data
          setUsers(data);

        } catch (error) {
          console.error('Network/parsing error:', error);
          setErrorMessage('Network error - check console');
        } */

      };

    /* PURPOSE: Retrieves List of Existing Events from Backend */
    const fetchEvents = async () => {
        try {
            const response = await fetch('http://localhost:4000/regularevents');
            const data = await response.json();
            setEvents(data);
          } catch (err) {
            setEvents([]); //ensure state is always an array
          }

        /* TESTINGGG RQQQQ: with tokens
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:4000/admin/events', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            setErrorMessage('');
    
            if (!response.ok) {
                const errorData = await response.json();
                setErrorMessage(errorData.message);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();
            setEvents(data);
        } catch (error) {
            console.error('Error fetching events:', error);
        }*/
    };

    /* PURPOSE: Render User and Event List when Component Mounts */
    useEffect(() => {
        fetchUsers(); //
        fetchEvents();
    }, []);

    /* PURPOSE: Updates Form with 'eventData' State */
    const handleEventChange = (e) => {
      const { name, value } = e.target;
      setEventData(prev => ({
        ...prev,
        [name]: name === 'points' ? parseInt(value) || 0 : value
      }));
    };

    /* PURPOSE: Creates New Event in Database */
    const createEvent = async (eventData) => {
        setErrorMessage('');
        
        try {
            const response = await fetch('http://localhost:4000/regularevents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    //'Authorization': `Bearer ${localStorage.getItem('token')}` //Authorization Token used again
                },
                body: JSON.stringify({
                  ...eventData,
                  appReq: eventData.appReq ?? false,
                  points: eventData.points ?? 0,
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                setErrorMessage(errorData.message);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setEvents([...events, data]); //add new event to the list
            setEventData({
                title: '',
                description: '',
                date: '',
                location: '',
                appReq: false,
                points: 0,
            }); //clear form
            console.log('Event created:', data);
        } catch (error) {
            console.error('Error creating event:', error);
        }
    };


    return (
        <div>
            <h1>Admin Dashboard</h1>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            <h2>Create Event</h2>
            <form onSubmit={(e) => {
                e.preventDefault();
                createEvent(eventData);
            }}>
                <input type="text" name="title" placeholder="Event Title" value={eventData.title} onChange={handleEventChange} required />
                <input type="text" name="description" placeholder="Event Description" value={eventData.description} onChange={handleEventChange} required />
                <input type="date" name="date" value={eventData.date} onChange={handleEventChange} required />
                <input type="text" name="location" placeholder="Event Location" value={eventData.location} onChange={handleEventChange} required />
                <input type="number" name="points" placeholder="Points Value" value={eventData.points || ''} onChange={handleEventChange} min="0" step="1" required />
                <label>
                  <input type="checkbox" checked={eventData.appReq} onChange={(e) => setEventData({...eventData, appReq: e.target.checked})}/>
                  App Requirement 
                </label>
                <button type="submit">Create Event</button>
            </form>

            <h2>Existing Events</h2>
            {events.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                 <thead>
                  <tr>
                    <th>Date</th>
                    <th>Event</th>
                    <th>Description</th>
                    <th>Location</th>
                    <th>App Req</th>
                    <th>Points</th>
                    <th>RSVPs</th>
                    <th>Attended</th>
                  </tr>
                </thead>
                <tbody>
                 {events.map(event => (
                  <tr key={event._id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td>{<td>{new Date(event.date).toLocaleDateString()}</td>}</td>
                    <td>{event.title || '—'}</td>
                    <td>{event.description || '—'}</td>
                    <td>{event.location || '—'}</td>
                    <td>{event.appReq ? 'Y' : 'N'}</td>
                    <td>{event.points}</td>
                    <td>{}</td>
                    <td>{}</td>
                  </tr>
                ))}
            </tbody>
        </table>
            ) : (
            <p>No events found.</p>
            )}
            

            <h2>Registered Users</h2>
            {users.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                 <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Major</th>
                    <th>Year</th>
                    <th>JPMorgan</th>
                  </tr>
                </thead>
                <tbody>
                 {users.map(user => (
                  <tr key={user._id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.major || '—'}</td>
                    <td>{user.year || '—'}</td>
                    <td>{user.JPMorgan ? 'Y' : 'N'}</td>
                  </tr>
                ))}
            </tbody>
        </table>
    ) : (
      <p>No users found</p>
    )}

        </div>
    );
};

export default Admin;
