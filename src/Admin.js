import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Table, Button, Badge } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';

const Admin = () => {
    /* PURPOSE: State Initialization */
    const navigate = useNavigate(); //helps move between pages dynamically
    const location = useLocation(); //extracts user data (ID, GMail, Name) passed from previous page
    const adminUser = location.state?.user;

    const [expandedEvent, setExpandedEvent] = useState(null);
    const toggleEventDetails = (eventId) => {
        setExpandedEvent(expandedEvent === eventId ? null : eventId);
    };
    const [expandedUser, setExpandedUser] = useState(null);
    const toggleUserDetails = (userId) => {
        setExpandedUser(expandedUser === userId ? null : userId);
    };
 
    const [events, setEvents] = useState([]);
    const [users, setUsers] = useState([]);
    const [eventData, setEventData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        appReq: false, //changed from isSpecial
        points: 0,
        rsvpGoal: 0,
        actualAttendees: 0,
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [rsvpEvents, setRsvpEvents] = useState([]);
    const [appEvents, setAppEvents] = useState([]);
    const [expandedRsvpEvent, setExpandedRsvpEvent] = useState(null);
    const [expandedAppEvent, setExpandedAppEvent] = useState(null);

    /* PURPOSE: Redirect User if not the Authorized Admin */
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
            if (!response.ok) throw new Error('Failed to fetch RSVPs');
            const data = await response.json();
            setRsvpEvents(data);
          } catch (err) {
            console.error('Error fetching RSVPs:', err);
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
            rsvpGoal: Number(eventData.rsvpGoal) || 0
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
                rsvpGoal: 0,
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
                <input type="number" name="rsvpGoal" placeholder="RSVP Goal" value={eventData.rsvpGoal || ''} onChange={handleEventChange} min="0" step="1" required />
                <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <input type="checkbox" checked={eventData.appReq} onChange={(e) => setEventData({...eventData, appReq: e.target.checked})}/>
                  App Requirement 
                </label>
                <button type="submit">Create Event</button>
            </form>
            
            <h2>Event Information</h2>
{events.length > 0 ? (
    <Table striped bordered hover>
        <thead>
            <tr>
                <th>Date</th>
                <th>Event</th>
                <th>Description</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {events.map(event => (
                <React.Fragment key={event._id}>
                    <tr>
                        <td>{new Date(event.date).toLocaleDateString()}</td>
                        <td>{event.title || '—'}</td>
                        <td>{event.description ? `${event.description.substring(0, 50)}${event.description.length > 50 ? '...' : ''}` : '—'}</td>
                        <td>
                            <Button 
                                variant="info"
                                onClick={() => toggleEventDetails(event._id)}
                            >
                                {expandedEvent === event._id ? 'Hide Details' : 'Show Details'}
                            </Button>
                        </td>
                    </tr>
                    {expandedEvent === event._id && (
                        <tr>
                            <td colSpan="4">
                                <div className="event-details">
                                    <Table size="sm" borderless>
                                        <tbody>
                                            <tr>
                                                <td><strong>Location:</strong></td>
                                                <td>{event.location || '—'}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Application Required:</strong></td>
                                                <td>{event.appReq ? '✅ Yes' : '❌ No'}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Points:</strong></td>
                                                <td>{event.points}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>RSVP Goal:</strong></td>
                                                <td>{event.rsvpGoal}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Attended:</strong></td>
                                                <td>{event.actualAttendees}</td>
                                            </tr>
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
) : (
    <p>No events found.</p>
)}

<h2>Event RSVPs</h2>
<Table striped bordered hover responsive>
  <thead>
    <tr>
      <th>Date</th>
      <th>Event</th>
      <th>RSVPs</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {rsvpEvents.length > 0 ? (
      rsvpEvents.map(event => (
        <React.Fragment key={event._id}>
          <tr>
            <td>{new Date(event.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}</td>
            <td>{event.title}</td>
            <td>{event.rsvpCount}</td>
            <td>
              <Button 
                variant={expandedRsvpEvent === event._id ? 'secondary' : 'info'}
                onClick={() => toggleRsvpUsers(event._id)}
                disabled={event.rsvpCount === 0}
                size="sm"
              >
                {expandedRsvpEvent === event._id ? 'Hide' : 'View'}
              </Button>
            </td>
          </tr>
          
          {expandedRsvpEvent === event._id && event.rsvpCount > 0 && (
            <tr>
              <td colSpan={4} className="p-0">
                <div className="p-3 bg-light">
                  <h6 className="mb-3">Attendees ({event.rsvpCount})</h6>
                  <Table bordered size="sm" className="mb-0">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>User ID</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {event.rsvps.map(rsvp => (
                        <tr key={`${event._id}-${rsvp.userId}`}>
                          <td>{rsvp.userName || 'Unknown'}</td>
                          <td className="text-muted small">{rsvp.userId}</td>
                          <td>
                            <Badge bg="success">Going</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </td>
            </tr>
          )}
        </React.Fragment>
      ))
    ) : (
      <tr>
        <td colSpan={4} className="text-center py-4 text-muted">
          No events with RSVPs found
        </td>
      </tr>
    )}
  </tbody>
</Table>
{/*<h2>RSVPs</h2>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Event Date</th>
                        <th>Event Name</th>
                        <th>RSVP Count</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {rsvpEvents.map(event => (
                        <React.Fragment key={event._id}>
                        <tr>
                            <td>{new Date(event.date).toLocaleDateString()}</td>
                            <td>{event.title}</td>
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
            </Table>*/}

            <h2>Applications</h2>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Event Date</th>
                        <th>Event Name</th>
                        <th>App Count</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {appEvents.map(event => (
                        <React.Fragment key={event._id}>
                            <tr>
                                <td>{new Date(event.eventDate).toLocaleDateString()}</td>
                                <td>{event.eventName}</td>
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
                                                            <th>School Email</th>
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
            
            <h2>User Information</h2>
            {users.length > 0 ? (
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Student Email</th>
                            <th>Points</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <React.Fragment key={user._id}>
                                <tr>
                                    <td>{user.name || '—'}</td>
                                    <td>{user.utdEmail || user.email || '—'}</td>
                                    <td>{user.points || 0}</td>
                                    <td>
                                        <Button 
                                            variant="info"
                                            onClick={() => toggleUserDetails(user._id)}
                                        >
                                            {expandedUser === user._id ? 'Hide Details' : 'Show Details'}
                                        </Button>
                                    </td>
                                </tr>
                                {expandedUser === user._id && (
                                <tr>
                                    <td colSpan="4">
                                        <div className="user-details">
                                            <Table size="sm" borderless>
                                                <tbody>
                                                    <tr>
                                                        <td><strong>User ID:</strong></td>
                                                        <td>{user._id}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>UTD Email:</strong></td>
                                                        <td>{user.utdEmail || '—'}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Events Attended:</strong></td>
                                                        <td>{user.eventsAttended?.length || 0}</td>
                                                    </tr>
                                                    <tr>
                                                        <td><strong>Admin Status:</strong></td>
                                                        <td>
                                                            {(user.email === "utdwwc@gmail.com" || user.utdEmail === "utdwwc@gmail.com") 
                                                            ? '✅ Admin' : '❌ Regular User'}
                                                        </td>
                                                    </tr>
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
        ) : (
            <p>No users found.</p>
        )}
    </div>
    );
};

export default Admin;
