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
    const [expandedEvent, setExpandedEvent] = useState(null);
    const [eventsWithRsvps, setEventsWithRsvps] = useState([]);

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

    /* PURPOSE: Retrieves Events with RSVPs from Backend */
    const fetchEventsWithRsvps = async () => {
      try {
          const response = await fetch('http://localhost:4000/rsvps');
          const data = await response.json();
          setEventsWithRsvps(data);
      } catch (err) {
          setEventsWithRsvps([]);
      }
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
        fetchUsers();
        fetchEvents();
        fetchEventsWithRsvps(); // TESTING: rsvp system
    }, []);

    /* PURPOSE: Allows Admin to View Users Who RSVP'd */
    const toggleExpand = (eventId) => {
      setExpandedEvent(expandedEvent === eventId ? null : eventId);
    };

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
            }}
            style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px" }}
            >
                <input type="text" name="title" placeholder="Event Title" value={eventData.title} onChange={handleEventChange} required />
                <input type="text" name="description" placeholder="Event Description" value={eventData.description} onChange={handleEventChange} required />
                <input type="date" name="date" value={eventData.date} onChange={handleEventChange} required />
                <input type="text" name="location" placeholder="Event Location" value={eventData.location} onChange={handleEventChange} required />
                <input type="number" name="points" placeholder="Points Value" value={eventData.points || ''} onChange={handleEventChange} min="0" step="1" required />
                <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <input type="checkbox" checked={eventData.appReq} onChange={(e) => setEventData({...eventData, appReq: e.target.checked})}/>
                  App Requirement 
                </label>
                <button type="submit">Create Event</button>
            </form>

            <h2>Existing Events</h2>
            {events.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                 <thead>
                  <tr style={{ backgroundColor: '#f2f2f2' }}>
                    <th style={{ padding: '10px' }}>Date</th>
                    <th style={{ padding: '10px' }}>Event</th>
                    <th style={{ padding: '10px' }}>Description</th>
                    <th style={{ padding: '10px' }}>Location</th>
                    <th style={{ padding: '10px' }}>App Req</th>
                    <th style={{ padding: '10px' }}>Points</th>
                    <th style={{ padding: '10px' }}>Attended</th>
                  </tr>
                </thead>
                <tbody>
                 {events.map(event => (
                  <tr key={event._id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '10px' }}>{<td>{new Date(event.date).toLocaleDateString()}</td>}</td>
                    <td style={{ padding: '10px' }}>{event.title || '—'}</td>
                    <td style={{ padding: '10px' }}>{event.description || '—'}</td>
                    <td style={{ padding: '10px' }}>{event.location || '—'}</td>
                    <td style={{ padding: '10px' }}>{event.appReq ? 'Y' : 'N'}</td>
                    <td style={{ padding: '10px' }}>{event.points}</td>
                    <td>{}</td>
                  </tr>
                ))}
            </tbody>
        </table>
            ) : (
            <p>No events found.</p>
            )}

          <h2>Event RSVPs</h2>
            {eventsWithRsvps.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f2f2f2' }}>
                    <th style={{ padding: '10px' }}>Event</th>
                    <th style={{ padding: '10px' }}>Date</th>
                    <th style={{ padding: '10px' }}>Total RSVPs</th>
                    <th style={{ padding: '10px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {eventsWithRsvps.map(event => (
                    <React.Fragment key={event._id}>
                      <tr style={{ borderBottom: '1px solid #ddd' }}>
                        <td style={{ padding: '10px' }}>{event.title}</td>
                        <td style={{ padding: '10px' }}>{new Date(event.date).toLocaleDateString()}</td>
                        <td style={{ padding: '10px' }}>{event.rsvps.length}</td>
                        <td style={{ padding: '10px' }}>
                          <button 
                            onClick={() => toggleExpand(event._id)}
                            style={{
                              padding: '5px 10px',
                              backgroundColor: expandedEvent === event._id ? '#f44336' : '#4CAF50',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            {expandedEvent === event._id ? 'Hide Users' : 'Show Users'}
                          </button>
                        </td>
                      </tr>
                      {expandedEvent === event._id && (
                        <tr>
                          <td colSpan="4" style={{ padding: '10px', backgroundColor: '#f9f9f9' }}>
                            <h4 style={{ margin: '0 0 10px 0' }}>Show Users</h4>
                            {event.rsvps.length > 0 ? (
                              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                  <tr>
                                    <th style={{ padding: '8px', textAlign: 'left' }}>User ID</th>
                                    <th style={{ padding: '8px', textAlign: 'left' }}>Name</th>
                                    <th style={{ padding: '8px', textAlign: 'left' }}>+ Guests</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {event.rsvps.map(rsvp => (
                                    <tr key={rsvp.userId}>
                                      <td style={{ padding: '8px' }}>{rsvp.userId}</td>
                                      <td style={{ padding: '8px' }}>{rsvp.name}</td>
                                      <td style={{ padding: '8px' }}>{rsvp.guests}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <p>No RSVPs yet</p>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            ) : (
                <p>No RSVP data available</p>
            )}
            

            <h2>Registered Users</h2>
            {users.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                 <thead>
                  <tr style={{ backgroundColor: '#f2f2f2' }}>
                    <th style={{ padding: '10px' }}>Name</th>
                    <th style={{ padding: '10px' }}>Email</th>
                    <th style={{ padding: '10px' }}>Major</th>
                    <th style={{ padding: '10px' }}>Year</th>
                    <th style={{ padding: '10px' }}>JPMorgan</th>
                  </tr>
                </thead>
                <tbody>
                 {users.map(user => (
                  <tr key={user._id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '10px' }}>{user.name}</td>
                    <td style={{ padding: '10px' }}>{user.email}</td>
                    <td style={{ padding: '10px' }}>{user.major || '—'}</td>
                    <td style={{ padding: '10px' }}>{user.year || '—'}</td>
                    <td style={{ padding: '10px' }}>{user.JPMorgan ? 'Y' : 'N'}</td>
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
