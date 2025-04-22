import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Modal from './Modal'; //adjust the path to your modal component
import './App.css';
import SignIn from './SignIn';
import { jwtDecode } from 'jwt-decode';

const RegularEventsPage = () => {
    const navigate = useNavigate(); //helps move between pages dynamically
    const location = useLocation(); //extracts user data (ID, GMail, Name) passed from previous page
    
    const [userId, setUserId] = useState(null);
    const [gmail, setGmail] = useState(null);
    const [name, setName] = useState('');

    //const userId = location.state?.userId;
    /*
    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token); // Using 'jwt-decode'
    const userId = decoded.userId;
    */
    //const gmail = location.state?.gmail; 
    //const name = location.state?.name; 
    
    const [isModalOpen, setIsModalOpen] = useState(false); // State to control the modal
    const [events, setEvents] = useState([]); //connecting to database
    const [rsvpStatus, setRsvpStatus] = useState({}); // { eventId1: true, eventId2: false }
    const [currentEvent, setCurrentEvent] = useState(null);

    
    /* PURPOSE: Retrieves list of existing events from backend */
    const fetchEvents = async () => {
        try {
            const response = await fetch('http://localhost:4000/regularevents');
            const data = await response.json();
            setEvents(data);

            const initialRsvpStatus = {}; //initializes rsvp status if backend provides info
            data.forEach(event => {
                initialRsvpStatus[event._id] = event.userHasRsvped || false;
            });
            setRsvpStatus(initialRsvpStatus);
          } catch (error) {
            console.error("Error fetching events:", error)
          }
    };

    /* PURPOSE: Runs Once Component Mounts */
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserId(decoded.sub); //google userId
                setGmail(decoded.email || decoded.gmail); // depends on your token structure
                setName(decoded.name || decoded.fullName); // same here

                console.log("UserID fetched:", decoded.sub);
                console.log("Gmail fetched:", decoded.email || decoded.gmail);
                console.log("Name fetched:", decoded.name || decoded.fullName);
        
        /*console.log("UserID:", userId); //debugging
        console.log("Gmail:", gmail); //debugging
        console.log("Name:", name); //debugging
        console.log("EMAIL FETCHED: ", gmail);
        fetchEvents(); //loads events from backend*/
    } catch (error) {
        console.error("Invalid or expired token:", error);
      }
    } else {
      console.warn("No token found in localStorage.");
    }
        fetchEvents(); // move this here if it doesn’t depend on token info
    }, []);
    
    /* PURPOSE: Sends an RSVP Request to Backend When Checked */
    const handleCheckboxChange = async (eventId) => {
        const currentStatus = rsvpStatus[eventId] || false;
        const newStatus = !currentStatus;

        console.log("Current userId:", userId); //debugging: check if userId exists
        if (!userId) {
            console.error("Error: userId is undefined!");
            return;
        }

        try {
            const response = await fetch(`http://localhost:4000/regularevents/${eventId}/rsvp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    userName: name,   
                    isChecked: newStatus,
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const data = await response.json();
            console.log(data.message);
    
            setRsvpStatus(prev => ({ //updates local state
                ...prev,
                [eventId]: newStatus
            }));
    
            if (newStatus) {
                const event = events.find(e => e._id === eventId);
                setCurrentEvent(event);
                setIsModalOpen(true);
            }
        } catch (error) {
            console.error('Error updating RSVP:', error);
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

    return (
        <div>
            <h1 style={styles.pageTitle}>Regular Events Page</h1>
            
            {/* Navigation buttons (moved outside event mapping) */}
            <div style={styles.container}>
                <button
                    style={styles.button}
                    onClick={() => {
                        if (gmail === 'utdwwc@gmail.com') {
                            navigate('/admin', { state: {userId, name, gmail} });
                        } else {
                            console.log("STOP TRESPASSING!");
                        }
                    }}
                    >
                    Go to Admin
                </button>
                <button style={styles.button} onClick={() => {
                    console.log("Navigating to Profile with gmail:", gmail);
                    navigate('/profile', { state: { gmail } });
                }}>
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
                                    userId: userId,
                                    name: name,
                                    gmail: userId.gmail,
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
