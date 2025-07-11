import React, { useState, useEffect } from 'react';
import { Table, Button, Spinner, Modal } from 'react-bootstrap';
import '../../css/components-css/AppsTable.css';

const SpeedMentoringTable = () => {
  const [appEvents, setAppEvents] = useState([]);
  const [expandedAppEvent, setExpandedAppEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
    const [showApplicationModal, setShowApplicationModal] = useState(false);

  /* Fetch applications for speed mentoring events */
  const fetchAppEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/eventapplications/with-events');
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      const data = await response.json();
      setAppEvents(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppEvents();
  }, []);

  const toggleAppUsers = (id) => {
    setExpandedAppEvent(expandedAppEvent === id ? null : id);
  };

  const getWordCount = (text) => {
    if (!text || text.trim() === '') return 0;
    return text.trim().split(/\s+/).length;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getUTCMonth() + 1).padStart(2, '0')}/${String(date.getUTCDate()).padStart(2, '0')}/${date.getUTCFullYear()}`;
  };

  // Sort events by date in descending order (newest first)
  const sortedAppEvents = [...appEvents].sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));

  if (loading) return (
    <div className="text-center my-5">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading applications...</span>
      </Spinner>
      <p>Loading speed mentoring applications...</p>
    </div>
  );

  if (error) return <div className="alert alert-danger">Error: {error}</div>;

  return (
    <div className="speed-mentoring-container">
      <h2 className="mb-4">Speed Mentoring Applications</h2>
      
      <Table striped bordered hover className="admin-table">
        <thead>
          <tr>
            <th>Event Date</th>
            <th>Event Name</th>
            <th>Application Count</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedAppEvents.map(event => (
            <React.Fragment key={event._id}>
              <tr>
                <td>{formatDate(event.eventDate)}</td>
                <td>{event.eventName}</td>
                <td>{event.applicationCount}</td>
                <td>
                  <Button 
                    variant="info"
                    onClick={() => toggleAppUsers(event._id)}
                    aria-expanded={expandedAppEvent === event._id}
                    aria-controls={`applicants-${event._id}`}
                  >
                    {expandedAppEvent === event._id ? 'Hide Applicants' : 'Show Applicants'}
                  </Button>
                </td>
              </tr>
              
              {expandedAppEvent === event._id && (
                <tr>
                  <td colSpan="4">
                    <div id={`applicants-${event._id}`} className="applicant-details">
                      <h5 className="my-3">Applications ({event.applications.length})</h5>
                      {event.applications.length > 0 ? (
                        <div className="table-responsive">
                          <Table className="applicant-table">
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>Pronouns</th>
                                <th>School Email</th>
                                <th>Year</th>
                                <th>Expected Grad</th>
                                <th>History</th>
                                <th>Reason</th>
                              </tr>
                            </thead>
                            <tbody>
                              {event.applications.map(application => (
                                <tr key={application._id}>
                                  <td>{application.name}</td>
                                  <td>{application.pronouns || '—'}</td>
                                  <td>
                                    <a href={`mailto:${application.email}`}>
                                      {application.email}
                                    </a>
                                  </td>
                                  <td>{application.year || '—'}</td>
                                  <td>{application.grad || '—'}</td>
                                  <td>
                                    <div className="d-flex flex-column">
                                        <span className="text-muted small mb-1">
                                            {getWordCount(application.history)} words
                                        </span>
                                        <Button 
                                            variant="link" 
                                            onClick={() => {
                                                setSelectedApplication({...application, eventName: event.eventName});
                                                setShowApplicationModal(true);
                                            }}
                                            className="p-0 text-primary align-self-start"
                                        >
                                            View History
                                        </Button>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="d-flex flex-column">
                                        <span className="text-muted small mb-1">
                                            {getWordCount(application.reason)} words
                                        </span>
                                        <Button 
                                            variant="link" 
                                            onClick={() => {
                                                setSelectedApplication({...application, eventName: event.eventName});
                                                setShowApplicationModal(true);
                                            }}
                                            className="p-0 text-primary align-self-start"
                                        >
                                            View Reason
                                        </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      ) : (
                        <p className="text-muted">No applications found for this event.</p>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </Table>

      {/* Application Details Modal */}
      <Modal 
        show={showApplicationModal} 
        onHide={() => setShowApplicationModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedApplication?.name}'s Application for {selectedApplication?.eventName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="mb-4">
            <h5>Application History</h5>
            <div className="bg-light p-3 rounded long-text-content">
              {selectedApplication?.history || 'No history provided'}
            </div>
          </div>
          <div className="mb-4">
            <h5>Application Reason</h5>
            <div className="bg-light p-3 rounded long-text-content">
              {selectedApplication?.reason || 'No reason provided'}
            </div>
          </div>
          <div className="mt-4">
            <h5>Contact Information</h5>
            <Table bordered>
              <tbody>
                <tr>
                  <td><strong>Email</strong></td>
                  <td>
                    <a href={`mailto:${selectedApplication?.email}`}>
                      {selectedApplication?.email}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td><strong>Year</strong></td>
                  <td>{selectedApplication?.year || '—'}</td>
                </tr>
                <tr>
                  <td><strong>Expected Graduation</strong></td>
                  <td>{selectedApplication?.grad || '—'}</td>
                </tr>
                <tr>
                  <td><strong>Pronouns</strong></td>
                  <td>{selectedApplication?.pronouns || '—'}</td>
                </tr>
              </tbody>
            </Table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowApplicationModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SpeedMentoringTable;