
import React from 'react';
import { toZonedTime } from 'date-fns-tz';
import PropTypes from 'prop-types';
import '../css/modules/EventCard.css';
import '../css/Homepage.css';

const EventCard = ({ 
  event, 
  user = null, 
  navigate = () => {}, 
  rsvpStatus = {}, 
  handleCheckboxChange = () => {},
  showButtons = true 
}) => {
  const now = new Date();
  const eventDate = new Date(event.date);
  eventDate.setDate(eventDate.getDate() + 1);
  
  // Convert to CST
  const nowCST = toZonedTime(now, 'America/Chicago');
  const eventDateCST = toZonedTime(eventDate, 'America/Chicago');

  // Set check-in period end time
  const checkInEnd = new Date(eventDateCST);
  checkInEnd.setHours(12, 0, 0, 0); // 12:00PM CST

  const isEventPassed = nowCST > checkInEnd;
  
  // Check if event is today in CST
  const isEventToday = 
    eventDateCST.getDate() === nowCST.getDate() &&
    eventDateCST.getMonth() === nowCST.getMonth() &&
    eventDateCST.getFullYear() === nowCST.getFullYear();
  
  // Check if current time is during check-in period
  const isCheckInPeriod = isEventToday && (
    (nowCST.getHours() === 6 && nowCST.getMinutes() >= 0) || // 6:00-6:59AM
    (nowCST.getHours() >= 7 && nowCST.getHours() <= 11) ||  // 7:00-11:59AM
    (nowCST.getHours() === 12 && nowCST.getMinutes() === 0)  // 12:00PM exactly
  );

  const renderButtons = () => {
    if (!showButtons || !navigate || !rsvpStatus || !handleCheckboxChange) {
      return null;
    }
    
    // 1. Event has passed
    if (isEventPassed) {
      return <p className="event-passed-message">Event has passed</p>;
    }
    
    // 2. During check-in period
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
                uid: user._id,
                name: user.name,
                utdEmail: user.utdEmail,
                token: user.token
              }
            }
          })}
          className="event-button event-button--primary"
        >
          Check-In!
        </button>
      );
    }
  
    // 3. Event is in the future (not today)
    if (!isEventToday && nowCST < eventDateCST) {
      if (event.appReq) {
        return (
          <button 
            onClick={() => navigate('/eventapplications', { 
              state: { 
                eventId: event._id,
                eventTitle: event.title,
                date: event.date,
                userId: user._id,
                name: user.name,
                email: user.email,
              }
            })}
            className="event-button event-button--primary"
          >
            Apply!
          </button>
        );
      } else {
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
            {isRSVPed && <p className="confirmation-message">You have RSVPed!</p>}
          </>
        );
      }
    }
  
    // 4. Event day but not check-in period
    if (isEventToday && !isCheckInPeriod) {
      if (event.appReq) {
        return (
          <button 
            onClick={() => navigate('/eventapplications', { 
              state: { 
                eventId: event._id,
                eventTitle: event.title,
                date: event.date,
                userId: user._id,
                name: user.name,
                email: user.email,
              }
            })}
            className="event-button event-button--primary"
          >
            Apply!
          </button>
        );
      } else {
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
            {isRSVPed && <p className="confirmation-message">You have RSVPed!</p>}
          </>
        );
      }
    }
    
    return null;
  };

  return (
    <div className="event-card-container">
      {/* poster container */}
      <div className="event-poster-container">
        {event.imageUrl ? (
          <img 
            src={event.imageUrl} 
            alt={`${event.title} poster`}
            className="event-poster"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.classList.add('no-image');
            }}
          />
        ) : (
          <div className="event-poster-placeholder">
            <span>{event.title}</span>
          </div>
        )}
      </div>
      
      {/* event details */}
      <div className="event-details">
        <h3 className="event-title">{event.title}</h3>
        <div className="event-meta">
          <p className="event-date">
            <span className="icon"><strong>Date: </strong></span>
            {`${String(new Date(event.date).getUTCMonth() + 1).padStart(2, '0')}/${String(new Date(event.date).getUTCDate()).padStart(2, '0')}/${new Date(event.date).getUTCFullYear()}`}
          </p>
          <p className="event-location">
            <span className="icon"><strong>Location: </strong></span>
            {event.location}
          </p>
          <p className="event-location">
            <span className="icon"><strong>Description: </strong></span>
            {event.description}
          </p>
        </div>
        {renderButtons()}
      </div>
    </div>
  );
};

EventCard.propTypes = {
  event: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    description: PropTypes.string,
    imageUrl: PropTypes.string,
    appReq: PropTypes.bool,
  }).isRequired,
  user: PropTypes.object,
  navigate: PropTypes.func,
  rsvpStatus: PropTypes.object,
  handleCheckboxChange: PropTypes.func,
  showButtons: PropTypes.bool,
};

export default EventCard;

/*
import React from 'react';
import { toZonedTime } from 'date-fns-tz';
import PropTypes from 'prop-types';
import '../css/modules/EventCard.css';
import '../css/Homepage.css';

const EventCard = ({ event, showButton = false, onButtonClick }) => {
  const isEventPassed = (eventDate) => {
    const now = new Date();
    const date = new Date(eventDate);
    const nowCST = toZonedTime(now, 'America/Chicago');
    const eventDateCST = toZonedTime(date, 'America/Chicago');
    const checkInEnd = new Date(eventDateCST);
    checkInEnd.setHours(12, 0, 0, 0);
    return nowCST > checkInEnd;
  };

  return (
    <div className="event-card-container">

      // poster container
      <div className="event-poster-container">
        {event.imageUrl ? (
          <img 
            src={event.imageUrl} 
            alt={`${event.title} poster`}
            className="event-poster"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.classList.add('no-image');
            }}
          />
        ) : (
          <div className="event-poster-placeholder">
            <span>{event.title}</span>
          </div>
        )}
      </div>
      
      // event details
      <div className="event-details">
        <h3 className="event-title">{event.title}</h3>
        <div className="event-meta">
          <p className="event-date">
            <span className="icon"><strong>Date: </strong></span>
            {`${String(new Date(event.date).getUTCMonth() + 1).padStart(2, '0')}/${String(new Date(event.date).getUTCDate()).padStart(2, '0')}/${new Date(event.date).getUTCFullYear()}`}
          </p>
          <p className="event-location">
            <span className="icon"><strong>Location: </strong></span>
            {event.location}
          </p>
          <p className="event-location">
            <span className="icon"><strong>Description: </strong></span>
            {event.description}
          </p>
        </div>
        {isEventPassed(event.date) && (
          <p className="event-passed-message">Event has passed</p>
        )}
      </div>
      {showButton && (
        <button 
          className="event-button"
          onClick={onButtonClick}
        >
          View Details
        </button>
      )}
    </div>
  );
};

EventCard.propTypes = {
  event: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    imageUrl: PropTypes.string,
  }).isRequired,
  showButton: PropTypes.bool,
  onButtonClick: PropTypes.func,
};

export default EventCard;
*/