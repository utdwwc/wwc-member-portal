import React from 'react';
import PropTypes from 'prop-types';
import EventCard from './EventCard';
import '../css/modules/EventCard.css';
import '../css/Homepage.css';

const EventsGrid = ({ events, title, showViewAll = false, onViewAllClick }) => {
  return (
    <section className="events-section">
      {title && <h2 className="section-title">{title}</h2>}
      <div className="events-grid">
        {events.map((event) => (
          <EventCard 
            key={event._id} 
            event={event}
            showButton={false}
          />
        ))}
      </div>
      {showViewAll && (
        <div className="view-all-container">
          <button 
            className="view-all-events-button"
            onClick={onViewAllClick}
          >
            View All Events
          </button>
        </div>
      )}
    </section>
  );
};

EventsGrid.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      location: PropTypes.string.isRequired,
      imageUrl: PropTypes.string,
    })
  ).isRequired,
  title: PropTypes.string,
  showViewAll: PropTypes.bool,
  onViewAllClick: PropTypes.func,
};

export default EventsGrid;