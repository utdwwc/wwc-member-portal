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
      {/* Poster Container - Now with full-cover images */}
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
      
      {/* Event Details */}
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