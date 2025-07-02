import React, { useState, useEffect } from 'react';
import { Table, Button, Spinner, Pagination } from 'react-bootstrap';
import '../../css/components-css/UsersTable.css';

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [expandedUser, setExpandedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  /* Fetch users from backend */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
      setUsers([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserDetails = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  // Get current users for pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return (
    <div className="text-center my-5">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading users...</span>
      </Spinner>
      <p>Loading user information...</p>
    </div>
  );

  if (error) return <div className="alert alert-danger">Error: {error}</div>;

  return (
    <div className="users-table-container">
      <h2 className="mb-4">User Information</h2>
      
      {users.length > 0 ? (
        <>
          <Table striped bordered hover className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Student Email</th>
                <th>Points</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map(user => (
                <React.Fragment key={user._id}>
                  <tr>
                    <td>{user.name || '—'}</td>
                    <td>
                      <a href={`mailto:${user.utdEmail || user.email}`}>
                        {user.utdEmail || user.email || '—'}
                      </a>
                    </td>
                    <td>{user.points || 0}</td>
                    <td>
                      <Button 
                        variant="info"
                        onClick={() => toggleUserDetails(user._id)}
                        aria-expanded={expandedUser === user._id}
                        aria-controls={`user-details-${user._id}`}
                      >
                        {expandedUser === user._id ? 'Hide Details' : 'Show Details'}
                      </Button>
                    </td>
                  </tr>
                  
                  {expandedUser === user._id && (
                    <tr>
                      <td colSpan="4">
                        <div id={`user-details-${user._id}`} className="user-details p-3">
                          <Table className="details-table">
                            <tbody>
                              <tr>
                                <td><strong>Events Attended:</strong></td>
                                <td>
                                  {user.attendedEvents?.length > 0 ? (
                                    <>
                                      <span>Total: {user.attendedEvents.length}</span>
                                      <ul className="mt-2 mb-0">
                                        {user.attendedEvents.map((event, index) => (
                                          <li key={index}>{event.title || 'Untitled Event'}</li>
                                        ))}
                                      </ul>
                                    </>
                                  ) : (
                                    "None"
                                  )}
                                </td>
                              </tr>
                              <tr>
                                <td><strong>User ID:</strong></td>
                                <td className="text-monospace">{user._id}</td>
                              </tr>
                              <tr>
                                <td><strong>Admin Status:</strong></td>
                                <td>
                                  {(user.email === "utdwwc@gmail.com" || user.utdEmail === "utdwwc@gmail.com") 
                                    ? '✅ Admin' : '❌ Regular User'}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev 
                  onClick={() => paginate(Math.max(1, currentPage - 1))} 
                  disabled={currentPage === 1}
                />
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Pagination.Item
                      key={pageNum}
                      active={pageNum === currentPage}
                      onClick={() => paginate(pageNum)}
                    >
                      {pageNum}
                    </Pagination.Item>
                  );
                })}

                <Pagination.Next 
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))} 
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}

          <div className="text-center text-muted mt-2">
            Showing users {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, users.length)} of {users.length}
          </div>
        </>
      ) : (
        <p className="text-muted">No users found.</p>
      )}
    </div>
  );
};

export default UsersTable;