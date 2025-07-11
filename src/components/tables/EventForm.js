import React, { useState } from 'react';

const EventForm = ({ onEventCreated }) => {
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    appReq: false,
    points: 0,
    imageUrl: null
  });
  const [errorMessage, setErrorMessage] = useState('');

  /* PURPOSE: Updates Form with 'eventData' State */
  const handleEventChange = (e) => {
    const { name, value, type } = e.target;

    if (type === 'file') {
      setEventData(prev => ({
        ...prev,
        [name]: e.target.files[0] // Store the file object
      }));
    } else {
      setEventData(prev => ({
        ...prev,
        [name]: name === 'points' || name === 'rsvpGoal' ? parseInt(value) || 0 : value
      }));
    }
  };

  /* PURPOSE: Creates New Event in Database */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    try {
      const formData = new FormData();
      formData.append('title', eventData.title);
      formData.append('description', eventData.description);
      formData.append('date', eventData.date);
      formData.append('location', eventData.location);
      formData.append('appReq', eventData.appReq.toString());
      formData.append('points', eventData.points.toString());

      if (eventData.imageUrl) {
        formData.append('poster', eventData.imageUrl);
      }

      console.log('Image file:', eventData.imageUrl, 'Is file:', eventData.imageUrl instanceof File);

      const response = await fetch('http://localhost:4000/regularevents', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.message);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      onEventCreated(data); // Callback to parent component
      
      // Reset form
      setEventData({
        title: '',
        description: '',
        date: '',
        location: '',
        appReq: false,
        points: 0,
        imageUrl: null
      });
      
      console.log('Event created:', data);
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  return (
    <div className="event-form-container">
      <h2>Create Event</h2>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <form onSubmit={handleSubmit} className="event-form" encType="multipart/form-data">
        <input 
          type="text" 
          name="title" 
          placeholder="Event Title" 
          value={eventData.title} 
          onChange={handleEventChange} 
          required 
        />
        <input 
          type="text" 
          name="description" 
          placeholder="Event Description" 
          value={eventData.description} 
          onChange={handleEventChange} 
          required 
        />
        <input 
          type="date" 
          name="date" 
          value={eventData.date} 
          onChange={handleEventChange} 
          required 
        />
        <input 
          type="text" 
          name="location" 
          placeholder="Event Location" 
          value={eventData.location} 
          onChange={handleEventChange} 
          required 
        />
        <input 
          type="number" 
          name="points" 
          placeholder="Points Value" 
          value={eventData.points || ''} 
          onChange={handleEventChange} 
          min="0" 
          step="1" 
          required 
        />
        <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <input 
            type="checkbox" 
            checked={eventData.appReq} 
            onChange={(e) => setEventData({...eventData, appReq: e.target.checked})}
          />
          Speed Mentoring Event 
        </label>

        <div style={{ margin: '10px 0' }}>
          <label htmlFor="poster-upload" style={{ display: 'block', marginBottom: '5px' }}>
            Event Poster (required):
          </label>
          <input
            type="file"
            id="poster-upload"
            name="imageUrl"
            accept="image/*"
            onChange={handleEventChange}
            style={{ width: '100%' }}
            required
          />
          {eventData.imageUrl && (
            <div style={{ marginTop: '10px' }}>
              <p>Selected file: {eventData.imageUrl.name}</p>
              {typeof eventData.imageUrl === 'string' ? (
                <img 
                  src={eventData.imageUrl} 
                  alt="Preview" 
                  style={{ maxWidth: '200px', maxHeight: '200px' }} 
                />
              ) : (
                <img 
                  src={URL.createObjectURL(eventData.imageUrl)} 
                  alt="Preview" 
                  style={{ maxWidth: '200px', maxHeight: '200px' }} 
                />
              )}
            </div>
          )}
        </div>

        <button type="submit">Create Event</button>
      </form>
    </div>
  );
};

export default EventForm;