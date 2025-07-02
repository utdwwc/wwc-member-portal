import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import '../../css/components-css/EventTable.css';

const EventTable = ({ events: initialEvents, onRefresh }) => {
  const [events, setEvents] = useState([]);
  const [expandedRsvp, setExpandedRsvp] = useState(null);
  const [expandedAttendance, setExpandedAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(5);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  //const [editedEvent, setEditedEvent] = useState(null);
  const [editedEvent, setEditedEvent] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    appReq: false,
    points: 0,
    imageUrl: null  // Important initial value
  });

  useEffect(() => {
    if (initialEvents) {
      setEvents(initialEvents);
      setLoading(false);
    } else {
      fetchCombinedEventData();
    }
  }, [initialEvents]);

  /* PURPOSE: Retrieves and combines all event data */
  const fetchCombinedEventData = async () => {
    try {
      setLoading(true);
      // Fetch all data in parallel
      const [eventsRes, rsvpsRes, attendancesRes] = await Promise.all([
        fetch('http://localhost:4000/regularevents'),
        fetch('http://localhost:4000/rsvps'),
        fetch('http://localhost:4000/events/attendance')
      ]);

      const [events, rsvps, attendances] = await Promise.all([
        eventsRes.json(),
        rsvpsRes.json(),
        attendancesRes.ok ? attendancesRes.json() : []
      ]);

      // Combine the data
      const combinedEvents = events.map(event => {
        const eventRsvpData = rsvps.find(rsvp => rsvp._id === event._id);
        const eventAttendanceData = attendances.find(att => att._id === event._id);
    
        return {
          ...event,
          rsvps: eventRsvpData?.rsvps || [],
          rsvpCount: eventRsvpData?.rsvpCount || 0,
          attendees: eventAttendanceData?.attendees || [],
          attendanceCount: eventAttendanceData?.attendanceCount || 0
        };
      });

      setEvents(combinedEvents);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching combined event data:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const toggleRsvpDetails = (id) => {
    setExpandedRsvp(expandedRsvp === id ? null : id);
    setExpandedAttendance(null); // Close attendance if open
  };

  const toggleAttendanceDetails = (id) => {
    setExpandedAttendance(expandedAttendance === id ? null : id);
    setExpandedRsvp(null); // Close RSVP if open
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getUTCMonth() + 1).padStart(2, '0')}/${String(date.getUTCDate()).padStart(2, '0')}/${date.getUTCFullYear()}`;
  };

  // Sort events by date in descending order (newest first)
  const sortedEvents = [...events].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Get current events for pagination
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = sortedEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(sortedEvents.length / eventsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <div>Loading events...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleDeleteClick = (event) => {
    setEventToDelete(event);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`http://localhost:4000/regularevents/${eventToDelete._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      // Refresh the data
      if (onRefresh) {
        onRefresh();
      } else {
        fetchCombinedEventData();
      }
      
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting event:', error);
      setError(error.message);
    }
  };

  const handleEditClick = (event) => {
    setEditedEvent({ ...event });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedEvent(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setEditedEvent(prev => ({
        ...prev,
        imageUrl: file // Store the File object directly
    }));
  };

  const saveEditedEvent = async () => {
  try {
    const formData = new FormData();
    formData.append('title', editedEvent.title);
    formData.append('description', editedEvent.description);
    formData.append('date', editedEvent.date);
    formData.append('location', editedEvent.location);
    formData.append('appReq', editedEvent.appReq.toString());
    formData.append('points', editedEvent.points.toString());

    // Handle image updates
    if (editedEvent.imageUrl === null) {
      formData.append('removeImage', 'true');
    } else if (editedEvent.imageUrl instanceof File) {
      formData.append('poster', editedEvent.imageUrl);
    }
    // (No else case means keep existing image)

    const response = await fetch(`http://localhost:4000/regularevents/${editedEvent._id}`, {
      method: 'PATCH',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update event');
    }

    // Refresh data
    if (onRefresh) onRefresh();
    setShowEditModal(false);
  } catch (error) {
    console.error('Error updating event:', error);
    setError(error.message);
  }
};

  return (
    <div className="event-table-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Event Information</h2>
        <Button variant="primary" onClick={onRefresh || fetchCombinedEventData}>
          Refresh Data
        </Button>
      </div>
      
      {sortedEvents.length > 0 ? (
        <>
          <Table striped bordered hover className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Event</th>
                <th>Description</th>
                <th>Location</th>
                <th>Points</th>
                <th>Application Required</th>
                <th>RSVPs</th>
                <th>Attendance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentEvents.map(event => (
                <React.Fragment key={event._id}>
                  <tr>
                    <td>{formatDate(event.date)}</td>
                    <td>{event.title || '—'}</td>
                    <td style={{ whiteSpace: 'pre-wrap' }}>{event.description || '—'}</td>
                    <td>{event.location || '—'}</td>
                    <td>{event.points || 0}</td>
                    <td>{event.appReq ? '✅' : '❌'}</td>
                    <td>{event.rsvpCount || 0}</td>
                    <td>{event.attendanceCount || 0}</td>
                    <td>
                        <Button
                            variant="primary"
                            className="me-2"
                            onClick={() => toggleRsvpDetails(event._id)}
                        >
                            {expandedRsvp === event._id ? 'Hide RSVPs' : 'Show RSVPs'}
                        </Button>

                        <Button
                            variant="success"
                            className="me-2"
                            onClick={() => toggleAttendanceDetails(event._id)}
                        >
                            {expandedAttendance === event._id ? 'Hide Attendance' : 'Show Attendance'}
                        </Button>
    
                        <Button
                            variant="warning"
                            className="me-2"
                            onClick={() => handleEditClick(event)}
                        >
                            Edit
                        </Button>
                        
                        <Button
                            variant="danger"
                            onClick={() => handleDeleteClick(event)}
                        >
                            Delete
                        </Button>
                    </td>
                  </tr>

                  {expandedRsvp === event._id && (
                    <tr>
                      <td colSpan="9">
                        <h5>RSVP List</h5>
                        <Table className="admin-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>UTD Email</th>
                              <th>Status</th>
                              <th>RSVP Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {event.rsvps.map(rsvp => (
                              <tr key={rsvp._id}>
                                <td>{rsvp.userName}</td>
                                <td>{rsvp.utdEmail}</td>
                                <td>{rsvp.status}</td>
                                <td>{new Date(rsvp.createdAt).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </td>
                    </tr>
                  )}

                  {expandedAttendance === event._id && (
                    <tr>
                      <td colSpan="9">
                        <h5>Attendance List</h5>
                        <Table className="admin-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>UTD Email</th>
                              <th>Check-In Time</th>
                              <th>Points Awarded</th>
                            </tr>
                          </thead>
                          <tbody>
                            {event.attendees.map(att => (
                              <tr key={att._id}>
                                <td>{att.userName}</td>
                                <td>{att.utdEmail}</td>
                                <td>{new Date(att.checkInTime).toLocaleString()}</td>
                                <td>{att.pointsAwarded}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </Table>

          {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the event "{eventToDelete?.title}"?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Event Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Event</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editedEvent && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Event Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={editedEvent.title}
                  onChange={handleEditChange}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  value={editedEvent.description}
                  onChange={handleEditChange}
                  rows={3}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={editedEvent.date}
                  onChange={handleEditChange}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={editedEvent.location}
                  onChange={handleEditChange}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Points</Form.Label>
                <Form.Control
                  type="number"
                  name="points"
                  value={editedEvent.points}
                  onChange={handleEditChange}
                  min="0"
                />
              </Form.Group>
              
              <Form.Check
                type="checkbox"
                label="Speed Mentoring Event"
                name="appReq"
                checked={editedEvent.appReq}
                onChange={handleEditChange}
                className="mb-3"
              />
              
              <Form.Group className="mb-3">

  <Form.Label>Event Poster</Form.Label>
  <Form.Control
    type="file"
    name="imageUrl"
    onChange={handleImageChange}  // Connect the handler
    accept="image/*"
  />
  {editedEvent.imageUrl && (
    <div className="mt-2">
      {editedEvent.imageUrl instanceof File ? (
        <>
          <p>New image: {editedEvent.imageUrl.name}</p>
          <img 
            src={URL.createObjectURL(editedEvent.imageUrl)} 
            alt="Preview" 
            style={{ maxWidth: '200px' }} 
          />
        </>
      ) : (
        <>
          <p>Current image</p>
          <img 
            src={`http://localhost:4000/${editedEvent.imageUrl}`} 
            alt="Preview" 
            style={{ maxWidth: '200px' }} 
          />
          <Button
            variant="danger"
            size="sm"
            onClick={() => setEditedEvent(prev => ({ ...prev, imageUrl: null }))}
            className="mt-2"
          >
            Remove Image
          </Button>
        </>
      )}
    </div>
  )}
</Form.Group>

            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={saveEditedEvent}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

          {/* Pagination Controls */}
          <div className="d-flex justify-content-center mt-3">
            <nav>
              <ul className="pagination">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <Button 
                    variant="outline-primary" 
                    className="page-link"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    &laquo; Previous
                  </Button>
                </li>
                
                {/* Page numbers - shows up to 5 pages around current page */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  return (
                    <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                      <Button 
                        variant={currentPage === pageNumber ? 'primary' : 'outline-primary'}
                        className="page-link"
                        onClick={() => paginate(pageNumber)}
                      >
                        {pageNumber}
                      </Button>
                    </li>
                  );
                })}

                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <Button 
                    variant="outline-primary" 
                    className="page-link"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next &raquo;
                  </Button>
                </li>
              </ul>
            </nav>
          </div>

          <div className="text-center text-muted mt-2">
            Showing {indexOfFirstEvent + 1}-{Math.min(indexOfLastEvent, sortedEvents.length)} of {sortedEvents.length} events
          </div>
        </>
      ) : (
        <p>No events found.</p>
      )}
    </div>
  );
};

export default EventTable;