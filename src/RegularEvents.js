import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './css/RegularEvents.css';
import EventsGrid from './components/grid/EventsGrid';
import './css/components-css/EventCard.css';


const RegularEventsPage = () => {
    const navigate = useNavigate(); //helps move between pages dynamically
    
    const [user, setUser] = useState({
        id: null,
        email: null,
        name: '',
        _id: null, //mongoDB ID
        points: null
    });
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [events, setEvents] = useState([]);
    const [rsvpStatus, setRsvpStatus] = useState({});
    const [currentEvent, setCurrentEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    /* PURPOSE: Retrieves List of Existing Events from Backend */
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

            //sort events by date (newest first)
            const sortedEvents = data.sort((a, b) => new Date(b.date) - new Date(a.date));
                
            setEvents(sortedEvents);
            
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
        
              //fetch COMPLETE user data from backend
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

    /* PURPOSE: Shows Events if User is Authenticated */
    useEffect(() => {
        if (user._id) {
          fetchEvents(user); //pass the current user
        }
    }, [user._id]);

    /* PURPOSE: Only Allows WWC Email into Admin Page */
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
        <div className="regular-events">
            <h1 className="page-title">Women Who Compute Events</h1>
            
            {/* Navigation buttons (moved outside event mapping) */}
            <div className="event-container">
                <button
                    className="event-button event-button--primary"
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
                        
                        navigate('/profile', { state: { user } });
                    }}
                >
                    Your Profile
                </button>

                <button
                    className="event-button event-button--primary"
                    onClick={handleClick}
                >
                    Admin Dashboard
                </button>

                <button
                    className="event-button event-button--primary"
                    onClick={() => navigate('/')}
                >
                    Back to Homepage
                </button>
            </div>
            
            <div className="events-grid-container">
                <EventsGrid
                    title="Events"
                    events={events}
                    user={user}
                    navigate={navigate}
                    rsvpStatus={rsvpStatus}
                    setRsvpStatus={setRsvpStatus}
                    setCurrentEvent={setCurrentEvent}
                    setIsModalOpen={setIsModalOpen}
                    showButtons={true}
            
                    showViewAll={false}
                    onViewAllClick={() => navigate('/login')}
                />
            </div>
        </div>
    );
};

export default RegularEventsPage;
