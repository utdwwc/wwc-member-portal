import React, { useState } from 'react';
import { Form, Button, Alert, Table } from 'react-bootstrap';
import '../../css/components-css/OfficerForm.css';


const OfficerForm = ({ onOfficerAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    email: '',
    github: '',
    linkedin: '',
    imageFile: null,
    imagePreview: null
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  setSuccessMessage('');
  setErrorMessage('');

  const data = new FormData();
  data.append('name', formData.name);
  data.append('position', formData.position);
  data.append('email', formData.email);
  data.append('github', formData.github);
  data.append('linkedin', formData.linkedin);
  if (formData.imageFile) {
    data.append('image', formData.imageFile);
  }

  try {
    const response = await fetch('/api/officers', {
      method: 'POST',
      body: data,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add officer');
    }

    const responseData = await response.json();

    setSuccessMessage('Officer added successfully!');
    setFormData({
      name: '',
      position: '',
      email: '',
      github: '',
      linkedin: '',
      imageFile: null,
      imagePreview: null
    });

    if (onOfficerAdded) {
      onOfficerAdded(responseData);
    }
  } catch (error) {
    setErrorMessage(error.message || 'Failed to add officer');
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="admin-form-container">
      <h2>Add New Officer</h2>
      
      {successMessage && (
        <Alert variant="success" className="admin-alert">
          {successMessage}
        </Alert>
      )}
      
      {errorMessage && (
        <Alert variant="danger" className="admin-alert">
          {errorMessage}
        </Alert>
      )}

      <Form onSubmit={handleSubmit} className="admin-form">
        <Table striped bordered hover className="admin-table">
          <tbody>
            <tr>
              <td>
                <Form.Group controlId="name" className="mb-3">
                  <Form.Label className="admin-label">Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="admin-input"
                  />
                </Form.Group>
              </td>
              <td>
                <Form.Group controlId="position" className="mb-3">
                  <Form.Label className="admin-label">Position</Form.Label>
                  <Form.Control
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    required
                    className="admin-input"
                  />
                </Form.Group>
              </td>
            </tr>
            <tr>
              <td>
                <Form.Group controlId="email" className="mb-3">
                  <Form.Label className="admin-label">Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="admin-input"
                  />
                </Form.Group>
              </td>
              <td>
                <Form.Group controlId="github" className="mb-3">
                  <Form.Label className="admin-label">GitHub</Form.Label>
                  <Form.Control
                    type="text"
                    name="github"
                    value={formData.github}
                    onChange={handleChange}
                    className="admin-input"
                  />
                </Form.Group>
              </td>
            </tr>
            <tr>
              <td colSpan="2">
                <Form.Group controlId="linkedin" className="mb-3">
                  <Form.Label className="admin-label">LinkedIn</Form.Label>
                  <Form.Control
                    type="text"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    className="admin-input"
                  />
                </Form.Group>
              </td>
            </tr>
            <tr>
              <td colSpan="2">
                <div style={{ margin: '10px 0' }}>
                  <label 
                    htmlFor="officer-image-upload" 
                    className="admin-label"
                    style={{ display: 'block', marginBottom: '5px' }}
                  >
                    Officer Picture:
                  </label>
                  <input
                    type="file"
                    id="officer-image-upload"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="admin-file-input"
                    style={{ width: '100%' }}
                  />
                  {formData.imagePreview && (
                    <div style={{ marginTop: '10px' }}>
                      <img 
                        src={formData.imagePreview} 
                        alt="Officer preview" 
                        className="admin-image-preview"
                        style={{ 
                          maxWidth: '200px', 
                          maxHeight: '200px',
                          borderRadius: '50%',
                          objectFit: 'cover'
                        }} 
                      />
                    </div>
                  )}
                </div>
              </td>
            </tr>
          </tbody>
        </Table>

        <div className="form-actions">
          <Button 
            variant="primary" 
            type="submit" 
            disabled={isSubmitting}
            className="details-button"
          >
            {isSubmitting ? 'Adding Officer...' : 'Add Officer'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default OfficerForm;