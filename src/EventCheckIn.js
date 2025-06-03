import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Alert, Card, Spinner, Badge } from 'react-bootstrap';
import './css/EventCheckIn.css';

const EventCheckIn = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);

  // DEBUGGING: State Passing
  console.log('Raw location.state:', location.state);
  const [event, setEvent] = useState(
    location.state?.event || {
      _id: location.state?.eventId,
      title: location.state?.eventTitle,
      date: location.state?.eventDate,
      location: location.state?.location
    }
  );
  const [currentUser, setCurrentUser] = useState(
    location.state?.user || {
      uid: location.state?.userId,
      displayName: location.state?.name,
      email: location.state?.email
    }
  );
  console.log('Processed event:', event);
  console.log('Processed user:', currentUser);


useEffect(() => {
    console.log('Initial state:', {
      locationState: location.state,
      processedEvent: event,
      processedUser: currentUser
    });

    if (!event?.eventId || !currentUser?.uid) {
      setError('Missing required event or user data');
      setLoading(false);
      return;
    }

    const checkAttendance = async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/attendance/check?eventId=${event.eventId}&userId=${currentUser.uid}`
        );
        
        if (res.ok) {
          const data = await res.json();
          setAlreadyCheckedIn(data.exists);
        } else {
          throw new Error('Failed to check attendance');
        }
      } catch (err) {
        console.error('Attendance check error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAttendance();
  }, [event, currentUser]);


  const handleCheckIn = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await fetch(`/api/events/${event.eventId}/check-in`, {
      method: 'POST',
      credentials: 'include', // Required if using cookies/sessions
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentUser.token}`
      },
      body: JSON.stringify({
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email,
        userEmail: currentUser.email,
        // These will be available in req.body on backend
      })
    });

    const responseData = await res.json();

    if (!res.ok) {
      throw new Error(responseData.error || 'Check-in failed');
    }

    setSuccess('Successfully checked in!');
    setAlreadyCheckedIn(true);
    
    // Optional: Update local state if needed
    setTimeout(() => navigate('/regularevents'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="loading-container">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Verifying your check-in status...</p>
      </div>
    );
  }


  return (
    <div className="event-checkin-container">
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
                  onClick={() => navigate('/homepage', { state: { from: location.pathname } })}
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
                <h3 className="event-title">{event.eventTitle}</h3>

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
                    disabled={loading || success || alreadyCheckedIn}
                  >
                    {loading ? (
                      <>
                        <Spinner as="span" size="sm" animation="border" /> Processing...
                      </>
                    ) : alreadyCheckedIn ? (
                      "Already Checked In!"
                    ) : (
                      "Confirm Check-In"
                    )}
                  </Button>
                ) : (
                  <Button
                    className="checkin-button"
                    variant="warning"
                    size="lg"
                    onClick={() => navigate('/homepage', { state: { from: location.pathname } })}
                  >
                    Sign In to Check In
                  </Button>
                )}

                <Button
                  className="checkin-button"
                  variant="outline-secondary"
                  onClick={() => navigate(-1)}
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