import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Alert, Card, Spinner } from 'react-bootstrap';

const EventCheckIn = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check auth status with fetch
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        if (!res.ok) throw new Error('Not authenticated');
        setCurrentUser(await res.json());
      } catch {
        setCurrentUser(null);
      }
    };
    checkAuth();
  }, []);

  // Load event data with fetch
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}/check-in-page`);
        
        console.log('Full response:', response); //debugging
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Event not found');
        }
  
        const data = await response.json();
        setEvent(data);
        
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchEvent();
  }, [eventId]);

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/events/${eventId}/check-in`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Check-in failed');
      }

      setSuccess('Successfully checked in!');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.message);
      if (err.message.includes('authenticated')) {
        navigate('/login', { state: { from: `/events/${eventId}/check-in` } });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div className="container mt-5">
      <Card className="text-center">
        <Card.Header as="h2">Event Check-In</Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          {event ? (
            <>
              <Card.Title>{event.title}</Card.Title>
              <Card.Text>
                {new Date(event.date).toLocaleString()}<br />
                {event.location}
              </Card.Text>
              
              {currentUser ? (
                <Button 
                  variant="primary" 
                  onClick={handleCheckIn}
                  disabled={loading || success}
                >
                  {loading ? 'Processing...' : 'Check In Now'}
                </Button>
              ) : (
                <Button 
                  variant="warning"
                  onClick={() => navigate('/login', { 
                    state: { from: `/events/${eventId}/check-in` } 
                  })}
                >
                  Sign In to Check In
                </Button>
              )}
            </>
          ) : (
            <Alert variant="warning">No event data available</Alert>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default EventCheckIn;