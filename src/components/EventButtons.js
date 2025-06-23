import React from 'react';
import { toZonedTime } from 'date-fns-tz';
import PropTypes from 'prop-types';

const EventButtons = ({ 
  event, 
  user, 
  navigate, 
  rsvpStatus, 
  setRsvpStatus,
  setCurrentEvent,
  setIsModalOpen
}) => {

  // ====== Time Calculations ======
  const now = new Date();
  const eventDate = new Date(event.date);
  eventDate.setDate(eventDate.getDate() + 1); //date adjustment
  
  const nowCST = toZonedTime(now, 'America/Chicago');
  const eventDateCST = toZonedTime(eventDate, 'America/Chicago');
  
  const checkInEnd = new Date(eventDateCST);
  checkInEnd.setHours(12, 0, 0, 0); //check-in ends at 12:00 PM CST

  const isEventPassed = nowCST > checkInEnd;
  const isEventToday = 
    eventDateCST.getDate() === nowCST.getDate() &&
    eventDateCST.getMonth() === nowCST.getMonth() &&
    eventDateCST.getFullYear() === nowCST.getFullYear();
  
  const isCheckInPeriod = isEventToday && (
    (nowCST.getHours() === 6 && nowCST.getMinutes() >= 0) || // 6:00-6:59AM
    (nowCST.getHours() >= 7 && nowCST.getHours() <= 11) ||   // 7:00-11:59AM
    (nowCST.getHours() === 12 && nowCST.getMinutes() === 0)  // 12:00PM exactly
  );

  // ====== RSVP Handler ======
  const handleCheckboxChange = async (eventId) => {
    console.group(`RSVP update for event ${eventId}`);
    console.log("Current user state:", user);

    if (!user?._id) {
      console.error("Missing user ID - cannot RSVP");
      navigate('/login');
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
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: user._id,
          googleId: user.id,
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
      console.log("RSVP successful, server response:", result.status);

      //update local state
      setRsvpStatus(prev => ({
        ...prev,
        [eventId]: newStatus
      }));
      
      //show modal only when RSVPing (not when un-RSVPing)
      if (newStatus) {
        setCurrentEvent(event);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('RSVP error:', {
        message: error.message,
        stack: error.stack,
        eventId,
        userId: user?._id,
        statusAttempted: newStatus
      });

      //revert UI state on error
      setRsvpStatus(prev => ({
        ...prev,
        [eventId]: currentStatus
      }));

      alert(`RSVP failed: ${error.message}`);
    } finally {
      console.groupEnd();
    }
  };

  // ====== Google Calendar Integration ======
  const handleAddToCalendar = () => {
    const formatDate = (dateString, hours, minutes) => {
      const date = new Date(dateString);
      date.setHours(hours, minutes, 0, 0);
      return date.toISOString().replace(/-|:|\.\d+/g, '').slice(0, 15) + 'Z';
    };

    const eventStartDate = formatDate(event.date, 19, 0); // 7:00 PM
    const eventEndDate = formatDate(event.date, 20, 0);   // 8:00 PM

    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${
      encodeURIComponent(event.title)
    }&details=${
      encodeURIComponent(event.description)
    }&location=${
      encodeURIComponent(event.location)
    }&dates=${eventStartDate}/${eventEndDate}`;
    
    window.open(calendarUrl, '_blank');
    setIsModalOpen(false);
  };

  // ====== Button Rendering Logic ======
  if (isEventPassed) {
    return <p className="event-passed-message">Event has passed</p>;
  }

  // 1. During check-in period
  if (isCheckInPeriod) {
    return (
      <button                     
        onClick={() => navigate('/eventcheckin', { 
          state: { 
            event: {
              eventId: event._id,
              eventTitle: event.title,
              date: event.date,
              location: event.location
            },
            user: {
              uid: user?._id,
              name: user?.name,
              utdEmail: user?.utdEmail,
              token: user?.token
            }
          }
        })}
        className="event-button event-button--primary"
      >
        Check-In!
      </button>
    );
  }

  // 2. Future event or event day (before check-in)
  if (event.appReq) {
  return (
    <button 
      onClick={() => {
        if (!user?._id) {
          console.error("Missing user ID - cannot RSVP");
          navigate('/login');
          return;
        }
        navigate('/eventapplications', { 
          state: { 
            eventId: event._id,
            eventTitle: event.title,
            date: event.date,
            userId: user._id, // Now we can use user._id directly since we've checked it exists
            name: user.name,
            email: user.email,
          }
        });
      }}
      className="event-button event-button--primary"
    >
      Apply!
    </button>
  );
}

  // Default RSVP case
  const isRSVPed = rsvpStatus[event._id] || false;

  return (
  <>
    <label className="event-label">
      <input 
        type="checkbox" 
        checked={isRSVPed} 
        onChange={() => handleCheckboxChange(event._id)} 
        className="event-checkbox" 
      />
      RSVP
    </label>
    {isRSVPed && (
      <>
        <p className="confirmation-message">You have RSVPed!</p>
        <button 
          onClick={handleAddToCalendar}
          className="add-to-calendar-btn"
        >
          Add to Google Calendar
        </button>
      </>
    )}
  </>
);
};

EventButtons.propTypes = {
  event: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    description: PropTypes.string,
    appReq: PropTypes.bool,
  }).isRequired,
  user: PropTypes.object,
  navigate: PropTypes.func.isRequired,
  rsvpStatus: PropTypes.object.isRequired,
  setRsvpStatus: PropTypes.func.isRequired,
  setCurrentEvent: PropTypes.func.isRequired,
  setIsModalOpen: PropTypes.func.isRequired,
};

export default EventButtons;