import React from 'react';
import PropTypes from 'prop-types';
import EventCard from './EventCard';
import '../../css/components-css/EventCard.css';
import '../../css/Homepage.css';

const EventsGrid = ({
  events,
  title,
  showViewAll = false,
  onViewAllClick,
  user,
  navigate,
  rsvpStatus,
  setRsvpStatus,
  setCurrentEvent,
  setIsModalOpen,
  showButtons = false
}) => {
  return (
    <section className="events-section">
      {title && <h2 className="section-title">{title}</h2>}
      <div className="events-grid">
        {events.map((event) => (
          <EventCard 
            key={event._id} 
            event={event}
            user={user}
            navigate={navigate}
            rsvpStatus={rsvpStatus}
            setRsvpStatus={setRsvpStatus}
            setCurrentEvent={setCurrentEvent}
            setIsModalOpen={setIsModalOpen}
            showButtons={showButtons} //controlled per usage
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
      description: PropTypes.string,
      imageUrl: PropTypes.string,
      appReq: PropTypes.bool
    })
  ).isRequired,
  title: PropTypes.string,
  showViewAll: PropTypes.bool,
  onViewAllClick: PropTypes.func,
  user: PropTypes.object,
  navigate: PropTypes.func,
  rsvpStatus: PropTypes.object,
  setRsvpStatus: PropTypes.func,
  setCurrentEvent: PropTypes.func,
  setIsModalOpen: PropTypes.func,
  showButtons: PropTypes.bool
};

export default EventsGrid;