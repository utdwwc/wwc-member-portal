import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Button, Alert, Card, Spinner, Badge, Modal } from 'react-bootstrap';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuth } from './hooks/useAuth';
import './css/EventCheckIn.css';

const EventCheckIn = () => {
  const { eventID } = useParams(); //get eventID from URL
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { 
    user: currentUser, 
    handleGoogleSuccess 
  } = useAuth();

  const [event, setEvent] = useState(
    location.state?.event || {
      _id: eventID || location.state?.eventId, //use URL param as fallback
      eventId: eventID || location.state?.eventId, //ensure eventId is set
      title: location.state?.eventTitle,
      date: location.state?.eventDate,
      location: location.state?.location
    }
  );


  /* guys i am genuinely gonna go out of my mind */
  /* lemme go fall asleep on the road already */
  /* also: section for CONSOLIDATED EFFECTS */


  /* PURPOSE: Retrieves Specific Event for Check-In */
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setError('');
      
        const res = await fetch(`/api/events/${eventID}`);
        if (!res.ok) {
          throw new Error(res.status === 404 ? 'Event not found' : 'Failed to fetch event');
        }
      
        const eventData = await res.json();
        setEvent({
          _id: eventData._id,
          eventId: eventData._id,
          title: eventData.title,
          date: eventData.date,
          location: eventData.location
        });
      } catch (err) {
        console.error('❌ Event fetch error:', err);
        setError(err.message);
      }
    };

    //only fetch if we don't have complete event data
    if (eventID && !event?.title) {
      fetchEventData();
    }
  }, [eventID]);

  /* PURPOSE: Verifies User Auth & Checks Attendance History */
  useEffect(() => {
    //handle auth state
    const shouldShowModal = !currentUser;
    setShowLoginModal(shouldShowModal);

    //check attendance if authenticated
    if (currentUser && event?.eventId) {
      const checkAttendance = async () => {
        try {
          const res = await fetch(`/api/events/users/${currentUser._id}/attendance`);
          if (res.ok) {
            const data = await res.json();
            setAlreadyCheckedIn(data.exists);
          }
        } catch (err) {
          console.error('Attendance check error:', err);
        }
      };
      
      checkAttendance();
    }
  }, [currentUser, event?.eventId]);

  /* PURPOSE: Logs User and Event Objects in Dev Mode */
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Current user:', currentUser);
      console.log('Current event:', event);
    }
  }, [currentUser, event]);


  /* hi so i am so tired of this freaking pg already */
  /* this is literally so stupid guys kmskmskms */
  /* dis the section for HANDLER FUNCTIONS */


  /* PURPOSE: Google Success Handler */
  const handleModalGoogleSuccess = async (credentialResponse) => {
    try {
      const userData = await handleGoogleSuccess(credentialResponse);
      setShowLoginModal(false);
      
      if (event?.eventId) {
        // Recheck attendance after auth
        const res = await fetch(`/api/events/users/${userData._id}/attendance`);
        if (res.ok) {
          const data = await res.json();
          setAlreadyCheckedIn(data.exists);
        }
      }
    } catch (err) {
      setError('Failed to authenticate. Please try again.');
    }
  };

  /* PURPOSE: Responsible for User Check-In */
  const handleCheckIn = async () => {
    try {
      setError('');
      setSuccess('');

      const res = await fetch(`/api/events/${event.eventId}/check-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({
          userId: currentUser._id,
          userName: currentUser.name || currentUser.email,
          userEmail: currentUser.email
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Check-in failed');
      }

      setSuccess('Successfully checked in!');
      setAlreadyCheckedIn(true);
      setTimeout(() => navigate('/regularevents'), 3000);
    } catch (err) {
      setError(err.message);
    }
  };


  return (
    <div className="event-checkin-container">
      
      <Modal
        show={showLoginModal}
        onHide={() => {
          if (currentUser) {
            setShowLoginModal(false);
          } else {
            navigate('/');
          }
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Sign In to Check In</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <GoogleOAuthProvider clientId="998314684026-iq3l5tljgpk95lco3t959jc8aq4mpcu0.apps.googleusercontent.com">
            <GoogleLogin
              onSuccess={handleModalGoogleSuccess}
              onError={() => setError('Google login failed')}
              useOneTap
              auto_select
              theme="filled_blue"
              size="large"
            />
          </GoogleOAuthProvider>
          <p className="mt-3">Or <Button variant="link" onClick={() => navigate('/login')}>use email login</Button></p>
        </Modal.Body>
      </Modal>

      <Card className="checkin-card">
        <Card.Header className="checkin-header">
          <h2>Event Check-In</h2>
          {alreadyCheckedIn && (
            <Badge bg="success" className="checked-in-badge">
              Already Checked In
            </Badge>
          )}
        </Card.Header>

        <Card.Body>
          {error && (
            <Alert variant="danger" className="alert-message">
              <Alert.Heading>Error</Alert.Heading>
              <p>{error}</p>
              {error.includes('authenticated') && (
                <Button 
                  className="checkin-button"
                  variant="primary"
                  onClick={() => navigate('/login', { state: { from: location.pathname } })}
                >
                  Go to Login
                </Button>
              )}
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="alert-message">
              <Alert.Heading>Success!</Alert.Heading>
              <p>{success}</p>
              <p>Redirecting you back to events...</p>
            </Alert>
          )}

          {event ? (
            <>
              <div className="event-details">
                <h3 className="event-title">{event.title}</h3>

                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span>{`${String(new Date(event.date).getUTCMonth() + 1).padStart(2, '0')}/${String(new Date(event.date).getUTCDate()).padStart(2, '0')}/${new Date(event.date).getUTCFullYear()}`}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Time:</span>
                  <span>{new Date(event.date).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Location:</span>
                  <span>{event.location}</span>
                </div>
              </div>

              {currentUser && (
                <div className="user-details">
                  <h4>Checking in as:</h4>
                  <p>{currentUser.name || currentUser.utdEmail}</p>
                </div>
              )}

              <div className="action-buttons">
                {currentUser ? (
                  <Button
                    className="checkin-button"
                    variant={alreadyCheckedIn ? "secondary" : "primary"}
                    size="lg"
                    onClick={handleCheckIn}
                    disabled={success || alreadyCheckedIn}
                  >
                      "Confirm Check-In"
                  </Button>
                ) : (
                  <Button
                    className="checkin-button"
                    variant="warning"
                    size="lg"
                    onClick={() => navigate('/login', { state: { from: location.pathname } })}
                  >
                    Sign In to Check In
                  </Button>
                )}

                <Button
                  className="checkin-button"
                  variant="outline-secondary"
                  onClick={() => navigate('/')}
                >
                  Back to Events
                </Button>
              </div>
            </>
          ) : (
            <Alert variant="warning">
              No event data available. Please return to the events page and try again.
            </Alert>
          )}

        </Card.Body>
      </Card>
    </div>
  );
};

export default EventCheckIn;