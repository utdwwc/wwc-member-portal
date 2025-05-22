import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Table, Button, Badge, ButtonGroup } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';

const Admin = () => {
    const navigate = useNavigate(); //helps move between pages dynamically
    const location = useLocation(); //extracts user data (ID, GMail, Name) passed from previous page
    const adminUser = location.state?.user;
    const [events, setEvents] = useState([]);
    const [users, setUsers] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [appEvents, setAppEvents] = useState([]);
    const [expandedAppEvent, setExpandedAppEvent] = useState(null);
    const [expandedEvent, setExpandedEvent] = useState(null);
    const [expandedUser, setExpandedUser] = useState(null);
    const [expandedView, setExpandedView] = useState(null);
    const [expandedRsvp, setExpandedRsvp] = useState(null);
    const [expandedAttendance, setExpandedAttendance] = useState(null);
    const [eventData, setEventData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        appReq: false,
        points: 0,
        rsvpGoal: 0,
        actualAttendees: 0,
    });

    const toggleEventDetails = (eventId) => {
      setExpandedEvent(expandedEvent === eventId ? null : eventId);
    };

    const toggleUserDetails = (userId) => {
      setExpandedUser(expandedUser === userId ? null : userId);
    };

    const toggleExpandedView = (view) => {
      setExpandedView(expandedView === view ? null : view);
    };

    const toggleAppUsers = (eventId) => {
      setExpandedAppEvent(expandedAppEvent === eventId ? null : eventId);
    };

    const toggleRsvpDetails = (eventId) => {
      setExpandedRsvp(prev => (prev === eventId ? null : eventId));
    };
    
    const toggleAttendanceDetails = (eventId) => {
      setExpandedAttendance(prev => (prev === eventId ? null : eventId));
    };


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

    /* PURPOSE: Retrieves Applications for Speed Mentoring */
    const fetchAppEvents = async () => {
      try {
          const response = await fetch('http://localhost:4000/eventapplications/with-events');
          const data = await response.json();
          setAppEvents(data);
      } catch (error) {
          console.error('Error fetching applications:', error);
      }
    };

    /* PURPOSE: Retrieves and combines all event data */
    const fetchCombinedEventData = async () => {
      try {
        // Fetch all data in parallel
        const [eventsRes, rsvpsRes, attendancesRes] = await Promise.all([
          fetch('http://localhost:4000/regularevents'),
          fetch('http://localhost:4000/rsvps'),
          fetch('/api/events/attendance')
        ]);

        const [events, rsvps, attendances] = await Promise.all([
          eventsRes.json(),
          rsvpsRes.json(),
          attendancesRes.ok ? attendancesRes.json() : []
        ]);

        // Combine the data
        const combinedEvents = events.map(event => {
          const eventRsvpData = rsvps.find(rsvp => rsvp._id === event._id);
          const eventAttendanceData = attendances.find(att => att._id === event._id);
      
          return {
            ...event,
            rsvps: eventRsvpData?.rsvps || [],
            rsvpCount: eventRsvpData?.rsvpCount || 0,
            attendees: eventAttendanceData?.attendees || [],
            attendanceCount: eventAttendanceData?.attendanceCount || 0
          };
        });

        setEvents(combinedEvents);
      } catch (error) {
        console.error('Error fetching combined event data:', error);
      }
    };

    /* PURPOSE: Render User and Event List when Component Mounts */
    useEffect(() => {
        fetchUsers();
        fetchAppEvents();
        fetchCombinedEventData();
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

    // Sort events by date in descending order (newest first)
    const sortedEvents = [...events].sort((a, b) => new Date(b.date) - new Date(a.date));
    const sortedAppEvents = [...appEvents].sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));


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
                {/*<input type="number" name="rsvpGoal" placeholder="RSVP Goal" value={eventData.rsvpGoal || ''} onChange={handleEventChange} min="0" step="1" required />*/}
                <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <input type="checkbox" checked={eventData.appReq} onChange={(e) => setEventData({...eventData, appReq: e.target.checked})}/>
                  Speed Mentoring Event 
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
                            <th>Location</th>
                            <th>Points</th>
                            <th>Application Required</th>
                            <th>RSVPs</th>
                            <th>Attendance</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedEvents.map(event => (
                            <React.Fragment key={event._id}>
                                <tr>
                                    <td>{new Date(event.date).toLocaleDateString()}</td>
                                    <td>{event.title || '—'}</td>
                                    <td style={{ whiteSpace: 'pre-wrap' }}>{event.description || '—'}</td>
                                    <td>{event.location || '—'}</td>
                                    <td>{event.points || 0}</td>
                                    <td>{event.appReq ? '✅' : '❌'}</td>
                                    <td>{event.rsvpCount || 0}</td>
                                    <td>{event.attendanceCount || 0}</td>
                                    <td>
                                      <Button
                                        variant="primary"
                                        className="me-2"
                                        onClick={() => toggleRsvpDetails(event._id)}
                                      >
                                        {expandedRsvp === event._id ? 'Hide RSVPs' : 'Show RSVPs'}
                                      </Button>
                                      <Button
                                        variant="success"
                                        onClick={() => toggleAttendanceDetails(event._id)}
                                      >
                                        {expandedAttendance === event._id ? 'Hide Attendance' : 'Show Attendance'}
                                      </Button>
                                    </td>
                                </tr>

                                {expandedRsvp === event._id && (
                                  <tr>
                                    <td colSpan="9">
                                      <h5>RSVP List</h5>
                                      <Table size="sm" bordered>
                                        <thead>
                                          <tr>
                                            <th>Name</th>
                                            <th>UTD Email</th>
                                            <th>Status</th>
                                            <th>RSVP Time</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {event.rsvps.map(rsvp => (
                                            <tr key={rsvp._id}>
                                              <td>{rsvp.userName}</td>
                                              <td>{rsvp.utdEmail}</td>
                                              <td>{rsvp.status}</td>
                                              <td>{new Date(rsvp.createdAt).toLocaleString()}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </Table>
                                    </td>
                                  </tr>
                                )}

                                {expandedAttendance === event._id && (
                                  <tr>
                                    <td colSpan="9">
                                      <h5>Attendance List</h5>
                                      <Table size="sm" bordered>
                                        <thead>
                                          <tr>
                                            <th>Name</th>
                                            <th>UTD Email</th>
                                            <th>Check-In Time</th>
                                            <th>Points Awarded</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {event.attendees.map(att => (
                                            <tr key={att._id}>
                                              <td>{att.userName}</td>
                                              <td>{att.utdEmail}</td>
                                              <td>{new Date(att.checkInTime).toLocaleString()}</td>
                                              <td>{att.pointsAwarded}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </Table>
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

            <h2>Speed Mentoring Applications</h2>
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
                    {sortedAppEvents.map(event => (
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
                                                            <th>History</th>
                                                            <th>Reason</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {event.applications.map(application => (
                                                            <tr key={application._id}>
                                                                <td>{application.name}</td>
                                                                <td>{application.email}</td>
                                                                <td>{application.history}</td>
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
