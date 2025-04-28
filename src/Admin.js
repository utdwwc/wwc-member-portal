import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Table, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';

const Admin = () => {
    /* PURPOSE: State Initialization */
    const navigate = useNavigate(); //helps move between pages dynamically
    const location = useLocation(); //extracts user data (ID, GMail, Name) passed from previous page
    const userId = location.state?.UserID;
    const gmail = location.state?.gmail; 
    const name = location.state?.name; 
    const [events, setEvents] = useState([]);
    const [users, setUsers] = useState([]);
    const [eventData, setEventData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        appReq: false, //changed from isSpecial
        points: 0,
        rsvpLimit: 0,
        actualAttendees: 0,
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [rsvpEvents, setRsvpEvents] = useState([]);
    const [appEvents, setAppEvents] = useState([]);
    const [expandedRsvpEvent, setExpandedRsvpEvent] = useState(null);
    const [expandedAppEvent, setExpandedAppEvent] = useState(null);

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
    };

    /* PURPOSE: Retrieves Events with RSVPs from Backend */
    const fetchRsvpEvents = async () => {
      try {
          const response = await fetch('http://localhost:4000/rsvps');
          const data = await response.json();
          setRsvpEvents(data);
      } catch (err) {
          setRsvpEvents([]);
      }
    };

    const fetchAppEvents = async () => {
      try {
          const response = await fetch('http://localhost:4000/eventapplications/with-events');
          const data = await response.json();
          setAppEvents(data);
      } catch (error) {
          console.error('Error fetching applications:', error);
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
    };

    /* PURPOSE: Render User and Event List when Component Mounts */
    useEffect(() => {
        fetchUsers();
        fetchEvents();
        fetchRsvpEvents();
        fetchAppEvents();
    }, []);

    const toggleRsvpUsers = (eventId) => {
      setExpandedRsvpEvent(expandedRsvpEvent === eventId ? null : eventId);
    };

    const toggleAppUsers = (eventId) => {
      setExpandedAppEvent(expandedAppEvent === eventId ? null : eventId);
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
          const payload = {
            title: eventData.title,
            description: eventData.description,
            date: eventData.date,
            location: eventData.location,
            appReq: Boolean(eventData.appReq),
            points: Number(eventData.points) || 0,
            rsvpLimit: Number(eventData.rsvpLimit) || 0
          };

          console.log('Sending:', payload); //debugging

          const response = await fetch('http://localhost:4000/regularevents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
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
                rsvpLimit: 0,
            }); //clear form
            console.log('Event created:', data);
        } catch (error) {
            console.error('Error creating event:', error);
        }
    };
    
    if (gmail === "utdwwc@gmail.com") {
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
                <input type="number" name="rsvpLimit" placeholder="RSVP Limit" value={eventData.rsvpLimit || ''} onChange={handleEventChange} min="0" step="1" required />
                <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <input type="checkbox" checked={eventData.appReq} onChange={(e) => setEventData({...eventData, appReq: e.target.checked})}/>
                  App Requirement 
                </label>
                <button type="submit">Create Event</button>
            </form>

            <h2>Event Information</h2>
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
                    <th style={{ padding: '10px' }}>RSVP Limit</th>
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
                    <td style={{ padding: '10px' }}>{event.rsvpLimit}</td>
                    <td style={{ padding: '10px' }}>{event.points}</td>
                    <td style={{ padding: '10px' }}>{event.actualAttendees}</td>
                    <td>{}</td>
                  </tr>
                 ))}
                 </tbody>
                </table>
            ) : (
            <p>No events found.</p>
            )}

            <h2>RSVPs</h2>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Event Name</th>
                        <th>Date</th>
                        <th>RSVP Count</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {rsvpEvents.map(event => (
                        <React.Fragment key={event._id}>
                        <tr>
                            <td>{event.title}</td>
                            <td>{new Date(event.date).toLocaleDateString()}</td>
                            <td>{event.rsvpCount}</td>
                            <td>
                                <Button 
                                    variant="info"
                                    onClick={() => toggleRsvpUsers(event._id)}
                                    disabled={event.rsvpCount === 0}
                                >
                                    {expandedRsvpEvent === event._id ? 'Hide RSVPs' : 'Show RSVPs'}
                                </Button>
                            </td>
                        </tr>
                {expandedRsvpEvent === event._id && event.rsvpCount > 0 && (
                    <tr>
                        <td colSpan="5">
                            <div className="attendee-details">
                                <h5>Users ({event.rsvpCount})</h5>
                                <Table size="sm">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>User ID</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {event.rsvps.map(rsvp => (
                                            <tr key={rsvp.userId}>
                                                <td>{rsvp.userName}</td>
                                                <td>{rsvp.userId}</td>
                                                <td>Going!</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </td>
                    </tr>
                )}
            </React.Fragment>
        ))}
    </tbody>
</Table>

            <h2>Applications</h2>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Event Name</th>
                        <th>Date</th>
                        <th>App Count</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {appEvents.map(event => (
                        <React.Fragment key={event._id}>
                            <tr>
                                <td>{event.eventName}</td>
                                <td>{new Date(event.eventDate).toLocaleDateString()}</td>
                                <td>{event.applicationCount}</td>
                                <td>
                                    <Button 
                                        variant="info"
                                        onClick={() => toggleAppUsers(event._id)}
                                    >
                                        {expandedAppEvent === event._id ? 'Hide Applicants' : 'Show Applicants'}
                                    </Button>
                                </td>
                            </tr>
                            {expandedAppEvent === event._id && event.applications.length > 0 && (
                                <tr>
                                    <td colSpan="5">
                                        <div className="applicant-details">
                                            <h5>Applications ({event.applications.length})</h5>
                                                <Table size="sm">
                                                    <thead>
                                                        <tr>
                                                            <th>Name</th>
                                                            <th>Email</th>
                                                            <th>Year</th>
                                                            <th>Reason</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {event.applications.map(application => (
                                                            <tr key={application._id}>
                                                                <td>{application.name}</td>
                                                                <td>{application.email}</td>
                                                                <td>{application.year}</td>
                                                                <td>{application.reason}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </Table>
            
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

    } else {
        <p>STOP TRESPASSING!</p>
    }
};

export default Admin;
