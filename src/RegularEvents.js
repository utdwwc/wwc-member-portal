import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Modal from './Modal'; //adjust the path to your modal component
import './App.css';
import { jwtDecode } from 'jwt-decode';

const RegularEventsPage = () => {
    const navigate = useNavigate(); //helps move between pages dynamically
    const location = useLocation(); //extracts user data (ID, GMail, Name) passed from previous page
    
    const [user, setUser] = useState({
        id: null,
        email: null,
        name: '',
        _id: null //mongoDB ID
    });
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [events, setEvents] = useState([]);
    const [rsvpStatus, setRsvpStatus] = useState({});
    const [currentEvent, setCurrentEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    
    /* PURPOSE: Retrieves list of existing events from backend */
    const fetchEvents = async (targetUser) => {
        try {
            console.log("fetching events for user: ", targetUser);
            const response = await fetch('http://localhost:4000/regularevents', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            console.log("events response: ", data);
            setEvents(data);
            
            //initialize RSVP status
            const initialRsvpStatus = {};
            data.forEach(event => {
                initialRsvpStatus[event._id] = event.actualAttendees?.includes(targetUser._id) || false;
            });
            setRsvpStatus(initialRsvpStatus);
          } catch (error) {
            console.error("Fetch error:", {
                message: error.message,
                userState: user,
                timestamp: new Date().toISOString()
            });
          } finally {
            setLoading(false);
          }
    };


    /* PURPOSE: Get User Data from location OR localStorage */
    useEffect(() => {
        const loadUserData = async () => {
            try {
              const storedUser = JSON.parse(localStorage.getItem('user'));
              if (!storedUser?._id) {
                navigate('/');
                return;
              }
        
              // Fetch COMPLETE user data from backend
              const response = await fetch(`http://localhost:4000/user/${storedUser._id}`, {
                headers: {
                  'Authorization': `Bearer ${storedUser.token}`
                }
              });
        
              if (!response.ok) throw new Error('Failed to fetch user data');
              
              const completeUser = await response.json();
              console.log('Complete user data:', completeUser); // Verify ALL fields exist
              setUser(completeUser);
              localStorage.setItem('user', JSON.stringify(completeUser)); // Update storage
        
            } catch (error) {
              console.error('Error loading user:', error);
              navigate('/');
            }
          };
        
          loadUserData();
    }, [navigate]);

    useEffect(() => {
        if (user._id) {
          fetchEvents(user); //pass the current user
        }
      }, [user._id]);
    
    /* PURPOSE: RSVP handler with user verification */
    const handleCheckboxChange = async (eventId) => {
        console.group(`RSVP update for event ${eventId}`);
        console.log("Current user state:", user);

        if (!user._id) {
            console.error("Missing user ID - cannot RSVP");
            alert("Please login again");
            navigate('/');
            return;
        }

        const currentStatus = rsvpStatus[eventId] || false;
        const newStatus = !currentStatus;
    
        try {
            console.log("Sending RSVP request with:", {
                eventId,
                userId: user._id,
                newStatus
            });
            
            const response = await fetch(`http://localhost:4000/regularevents/${eventId}/rsvp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Added auth
                },
                body: JSON.stringify({
                    userId: user._id, //mongoDB ID
                    googleId: user.id, //google ID
                    userName: user.name,
                    userEmail: user.email,  
                    isChecked: newStatus 
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Backend error response:", errorData);
                throw new Error(errorData.message || "RSVP update failed");
            }

            const result = await response.json();
            console.log("RSVP successful, server response:", result);

            //update local state
            setRsvpStatus(prev => ({
                ...prev,
                [eventId]: newStatus
            }));
            
            //only show modal if RSVPing
            if (newStatus) {
                const event = events.find(e => e._id === eventId);
                if (!event) {
                    console.warn("Event not found for modal:", eventId);
                    return;
                }
                setCurrentEvent(event);
                setIsModalOpen(true);
            }
        } catch (error) {
            console.error('RSVP error:', {
                message: error.message,
                stack: error.stack,
                eventId,
                userId: user._id,
                statusAttempted: newStatus
            });

            //revert UI state on error
            setRsvpStatus(prev => ({
                ...prev,
                [eventId]: currentStatus //revert to previous status
            }));

            alert(`RSVP failed: ${error.message}`);
        } finally {
            console.groupEnd();
        }
    };

    /* PURPOSE: Generates a Google Calendar Event link */
    const handleAddToCalendar = () => {
        if (!currentEvent) return;
        
        const formatDate = (dateString, hours, minutes) => { //formats date in googcal's required format
            const date = new Date(dateString);
            date.setHours(hours, minutes, 0, 0);
            return date.toISOString().replace(/-|:|\.\d+/g, '').slice(0, 15) + 'Z';
        };

        const eventStartDate = formatDate(currentEvent.date, 19, 0); //automatically is 7:00 PM
        const eventEndDate = formatDate(currentEvent.date, 20, 0);   //automatically is 8:00 PM
    
        const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${currentEvent.title}&details=${currentEvent.description}&location=${currentEvent.location}&dates=${eventStartDate}/${eventEndDate}`;
        
        window.open(calendarUrl, '_blank');
        setIsModalOpen(false);
    };

    const handleClick = () => {
        if (user?.email === "utdwwc@gmail.com" ||
            user?.utdEmail === "utdwwc@gmail.com") {
                navigate('/admin', {
                    state: {
                        user: user
                    }
                });
        } else {
            alert("boohoo u aren't admin");
        }
    };

    return (
        <div>
            <h1 style={styles.pageTitle}>Regular Events Page</h1>
            
            {/* Navigation buttons (moved outside event mapping) */}
            <div style={styles.container}>
                <button
                    style={styles.button}
                    onClick={handleClick}
                >
                    Go to Admin
                </button>
                
                <button
                    style={styles.button}
                    onClick={() => {
                        //ensure we have complete object
                        if (!user || !user._id) {
                            alert('User data not loaded yet');
                            return;
                        }

                        //verify required fields exist
                        if (!user.utdEmail) {
                            console.error('Missing email:', user);
                            alert('Profile incomplete - please update your email first');
                            return;
                        }
                        
                        navigate('/profile', {
                            state: {
                              user: {
                                _id: user._id,
                                name: user.name,
                                email: user.email,
                                utdEmail: user.utdEmail || '',  //fallback if missing
                                pronouns: user.pronouns || '',  //fallback if missing
                                major: user.major || '',        //fallback if missing
                                year: user.year || ''           //fallback if missing
                              }
                            } 
                          });
                    }}
                >
                    Go to Profile
                </button>
            </div>

            {events.map((event) => (
                <div key={event._id} style={styles.container}>
                    <h1 style={styles.title}>Event: {event.title}</h1>
                    <p><strong>Description:</strong> {event.description}</p>
                    <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                    <p><strong>Location:</strong> {event.location}</p>
                    
                    {event.appReq ? (
                        <button 
                            onClick={() => navigate('/eventapplications', { 
                                state: { 
                                    eventId: event._id,
                                    eventTitle: event.title,
                                    userId: user._id,
                                    name: user.name,
                                    email: user.email,
                                }
                            })}
                        style={styles.applyButton}
                      >
                        Apply for Event
                      </button>
                    ) : (
                        <>
                            <label style={styles.label}>
                                <input 
                                    type="checkbox" 
                                    checked={rsvpStatus[event._id] || false} 
                                    onChange={() => handleCheckboxChange(event._id)} 
                                    style={styles.checkbox} 
                                />
                                RSVP
                            </label>
                            {rsvpStatus[event._id] && <p style={styles.confirmation}>You have RSVPed!</p>}
                        </>
                    )}
                    
                    <Modal 
                        isOpen={isModalOpen} 
                        onClose={() => setIsModalOpen(false)} 
                        onAddToCalendar={handleAddToCalendar} 
                        event={currentEvent}
                    />
                </div>
            ))}
        </div>
    );
};

const styles = {
    pageTitle: {
        textAlign: 'center',
        margin: '20px 0',
        fontSize: '2rem',
    },
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
        marginBottom: '15px',
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
    },  
    button: {
        padding: '10px 15px',
        margin: '0 10px',
        //backgroundColor: '#3498db',
        //color: 'white',
        //border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginTop: '10px',
    },
    applyButton: {
        display: 'inline-block',
        padding: '10px 15px',
        //backgroundColor: '#27ae60',
        //color: 'white',
        textDecoration: 'none',
        borderRadius: '4px',
        marginTop: '10px',
        cursor: 'pointer',
    },
};

export default RegularEventsPage;
