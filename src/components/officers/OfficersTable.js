import React, { useState, useEffect } from 'react';
import { Table, Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import '../../css/components-css/OfficersTable.css';

const OfficersTable = () => {
  const [officers, setOfficers] = useState([]);
  const [expandedOfficer, setExpandedOfficer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [officerToDelete, setOfficerToDelete] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedOfficer, setEditedOfficer] = useState({});

  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        const response = await axios.get('/api/officers');
        setOfficers(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchOfficers();
  }, []);

  const toggleOfficerDetails = (id) => {
    setExpandedOfficer(expandedOfficer === id ? null : id);
    setEditMode(false);
  };

  const handleDeleteClick = (officer) => {
    setOfficerToDelete(officer);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/officers/${officerToDelete._id}`);
      setOfficers(officers.filter(officer => officer._id !== officerToDelete._id));
      setShowDeleteModal(false);
      setExpandedOfficer(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditClick = (officer) => {
    setEditedOfficer({ ...officer });
    setEditMode(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedOfficer(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveEditedOfficer = async () => {
    try {
      const response = await axios.put(`/api/officers/${editedOfficer._id}`, editedOfficer);
      setOfficers(officers.map(officer => 
        officer._id === editedOfficer._id ? response.data : officer
      ));
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading officers...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="officers-table-container">
      <h2>Current Officers</h2>
      <Table striped bordered hover className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Position</th>
            <th>Personal Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {officers.map(officer => (
            <React.Fragment key={officer._id}>
              <tr>
                <td>{officer.name}</td>
                <td>{officer.position}</td>
                <td>{officer.email}</td>
                <td>
                  <Button 
                    className="details-button"
                    variant="info"
                    onClick={() => toggleOfficerDetails(officer._id)}
                  >
                    {expandedOfficer === officer._id ? 'Hide Details' : 'Show Details'}
                  </Button>
                </td>
              </tr>
              {expandedOfficer === officer._id && (
                <tr>
                  <td colSpan="4">
                    <div className="officer-details">
                      {editMode ? (
                        <div className="edit-form">
                          <Table className="admin-table">
                            <tbody>
                              <tr>
                                <th>Name</th>
                                <td>
                                  <input
                                    type="text"
                                    name="name"
                                    value={editedOfficer.name || ''}
                                    onChange={handleInputChange}
                                  />
                                </td>
                              </tr>
                              <tr>
                                <th>Position</th>
                                <td>
                                  <input
                                    type="text"
                                    name="position"
                                    value={editedOfficer.position || ''}
                                    onChange={handleInputChange}
                                  />
                                </td>
                              </tr>
                              <tr>
                                <th>Email</th>
                                <td>
                                  <input
                                    type="email"
                                    name="email"
                                    value={editedOfficer.email || ''}
                                    onChange={handleInputChange}
                                  />
                                </td>
                              </tr>
                              <tr>
                                <th>GitHub</th>
                                <td>
                                  <input
                                    type="text"
                                    name="github"
                                    value={editedOfficer.github || ''}
                                    onChange={handleInputChange}
                                  />
                                </td>
                              </tr>
                              <tr>
                                <th>LinkedIn</th>
                                <td>
                                  <input
                                    type="text"
                                    name="linkedin"
                                    value={editedOfficer.linkedin || ''}
                                    onChange={handleInputChange}
                                  />
                                </td>
                              </tr>
                            </tbody>
                          </Table>
                          <div className="edit-actions">
                            <Button variant="success" onClick={saveEditedOfficer}>
                              Save
                            </Button>
                            <Button variant="secondary" onClick={() => setEditMode(false)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Table className="admin-table">
                            <tbody>
                              <tr>
                                <th>Image</th>
                                <td>
                                  {officer.imageUrl ? (
                                    <img 
                                      src={officer.imageUrl} 
                                      alt={officer.name} 
                                      style={{ maxWidth: '100px', maxHeight: '100px' }}
                                    />
                                  ) : 'No image available'}
                                </td>
                              </tr>
                              <tr>
                                <th>GitHub</th>
                                <td>
                                  {officer.github ? (
                                    <a 
                                      href={`${officer.github}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                    >
                                      {officer.github}
                                    </a>
                                  ) : 'Not provided'}
                                </td>
                              </tr>
                              <tr>
                                <th>LinkedIn</th>
                                <td>
                                  {officer.linkedin ? (
                                    <a 
                                      href={`${officer.linkedin}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                    >
                                      {officer.linkedin}
                                    </a>
                                  ) : 'Not provided'}
                                </td>
                              </tr>
                            </tbody>
                          </Table>
                          <div className="detail-actions">
                            <Button 
                              variant="warning" 
                              onClick={() => handleEditClick(officer)}
                              style={{ marginRight: '10px' }}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="danger" 
                              onClick={() => handleDeleteClick(officer)}
                            >
                              Delete
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
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
          Are you sure you want to delete {officerToDelete?.name}?
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
    </div>
  );
};

export default OfficersTable;