import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const RegisterModal = ({ show, handleClose }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    phoneNumber: '',
    officialMailId: '',
    password: '',
    role: 'staff',
    designation: '',
    gender: 'Male',
    dateOfJoining: '',
    initialSalary: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, formData, {
        headers: { 'Content-Type': 'application/json' }
      });
      alert('Registered successfully!');
      handleClose();
    } catch (err) {
      console.error('Register Error:', err);
      alert('Registration failed.');
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>User Registration</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group controlId="employeeId">
                <Form.Label>Employee ID</Form.Label>
                <Form.Control
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="name">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="phoneNumber">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="officialMailId">
                <Form.Label>Official Email</Form.Label>
                <Form.Control
                  type="email"
                  name="officialMailId"
                  value={formData.officialMailId}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="password">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="role">
                <Form.Label>Role</Form.Label>
                <Form.Select name="role" value={formData.role} onChange={handleChange}>
                  <option value="staff">staff</option>
                  <option value="admin">admin</option>
                  <option value="hr">hr</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="designation">
                <Form.Label>Designation</Form.Label>
                <Form.Control
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="gender">
                <Form.Label>Gender</Form.Label>
                <Form.Select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="dateOfJoining">
                <Form.Label>Date of Joining</Form.Label>
                <Form.Control
                  type="date"
                  name="dateOfJoining"
                  value={formData.dateOfJoining}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="initialSalary">
                <Form.Label>Initial Salary</Form.Label>
                <Form.Control
                  type="number"
                  name="initialSalary"
                  value={formData.initialSalary}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Register
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RegisterModal;
