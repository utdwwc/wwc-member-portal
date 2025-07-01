import React, { useState, useEffect } from 'react';
import { Table, Button } from 'react-bootstrap';
import axios from 'axios';

const OfficersTable = () => {
  const [officers, setOfficers] = useState([]);
  const [expandedOfficer, setExpandedOfficer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  };

  if (loading) return <div>Loading officers...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="officers-table-container">
      <h2>Officers Information</h2>
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
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default OfficersTable;