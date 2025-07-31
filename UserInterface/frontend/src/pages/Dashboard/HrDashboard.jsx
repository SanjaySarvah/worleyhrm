import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form, Row, Col, Badge } from 'react-bootstrap';

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '', name: '', phoneNumber: '', officialMailId: '', password: '',
    role: '', designation: '', gender: '', dateOfJoining: '', initialSalary: '',
    increments: []
  });
  const [increment, setIncrement] = useState({ amount: '', type: '', note: '' });

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/users');
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleShowModal = (user = null) => {
    if (user) {
      setIsEditing(true);
      setSelectedUser(user);
      setFormData({
        ...user,
        password: '',
        dateOfJoining: new Date(user.dateOfJoining).toISOString().split('T')[0],
        increments: user.increments || []
      });
    } else {
      setIsEditing(false);
      setFormData({
        employeeId: '', name: '', phoneNumber: '', officialMailId: '', password: '',
        role: '', designation: '', gender: '', dateOfJoining: '', initialSalary: '',
        increments: []
      });
    }
    setIncrement({ amount: '', type: '', note: '' });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setIncrement({ amount: '', type: '', note: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleIncrementChange = (e) => {
    const { name, value } = e.target;
    setIncrement(prev => ({ ...prev, [name]: value }));
  };

  const addIncrement = () => {
    if (!increment.amount || !increment.type || !increment.note) return;
    setFormData(prev => ({
      ...prev,
      increments: [...(prev.increments || []), {
        ...increment,
        amount: Number(increment.amount)
      }]
    }));
    setIncrement({ amount: '', type: '', note: '' });
  };

  const deleteIncrement = (index) => {
    setFormData(prev => ({
      ...prev,
      increments: prev.increments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    const {
      employeeId, name, phoneNumber, officialMailId, password,
      role, designation, gender, dateOfJoining, initialSalary
    } = formData;

    if (!employeeId || !name || !phoneNumber || !officialMailId || (!isEditing && !password) ||
        !role || !designation || !gender || !dateOfJoining || initialSalary === '') {
      alert("Please fill all required fields");
      return;
    }

    const payload = {
      employeeId, name, phoneNumber, officialMailId, password,
      role, designation, gender, dateOfJoining,
      initialSalary: Number(initialSalary)
    };

    if (isEditing && formData.increments?.length > 0) {
      payload.increments = formData.increments.map(inc => ({
        ...inc,
        amount: Number(inc.amount)
      }));
    }

    try {
      if (isEditing) {
        await axios.patch(`http://localhost:5000/api/auth/update/${selectedUser._id}`, payload);
      } else {
        await axios.post('http://localhost:5000/api/auth/register', payload);
      }
      fetchUsers();
      handleCloseModal();
    } catch (err) {
      console.error("Submit Error:", err);
      alert(err?.response?.data?.msg || "Something went wrong");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Employee Management</h2>
      <Button className="mb-3" onClick={() => handleShowModal()}>Add Employee</Button>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Avatar</th>
            <th>Employee ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Designation</th>
            <th>Salary</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>
                <div className="bg-secondary text-white rounded-circle d-flex justify-content-center align-items-center" style={{ width: 40, height: 40 }}>
                  {user.name?.[0] || 'U'}
                </div>
              </td>
              <td>{user.employeeId}</td>
              <td>{user.name}</td>
              <td>{user.officialMailId}</td>
              <td>{user.phoneNumber}</td>
              <td>{user.designation}</td>
              <td>
                ₹{user.currentSalary?.toLocaleString()} <br />
                {user.increments?.length > 0 && (
                  <Badge bg="info" className="mt-1">{user.increments.length} Increments</Badge>
                )}
              </td>
              <td>
                <Button variant="primary" size="sm" onClick={() => handleShowModal(user)}>
                  Edit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Edit' : 'Add'} Employee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}><Form.Group><Form.Label>Employee ID</Form.Label><Form.Control name="employeeId" value={formData.employeeId} onChange={handleChange} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Name</Form.Label><Form.Control name="name" value={formData.name} onChange={handleChange} /></Form.Group></Col>
            </Row>
            <Row>
              <Col md={6}><Form.Group><Form.Label>Email</Form.Label><Form.Control name="officialMailId" value={formData.officialMailId} onChange={handleChange} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Phone</Form.Label><Form.Control name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} /></Form.Group></Col>
            </Row>
            <Row>
              <Col md={6}><Form.Group><Form.Label>Role</Form.Label><Form.Control name="role" value={formData.role} onChange={handleChange} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Designation</Form.Label><Form.Control name="designation" value={formData.designation} onChange={handleChange} /></Form.Group></Col>
            </Row>
            <Row>
              <Col md={6}><Form.Group><Form.Label>Gender</Form.Label><Form.Control name="gender" value={formData.gender} onChange={handleChange} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Date of Joining</Form.Label><Form.Control type="date" name="dateOfJoining" value={formData.dateOfJoining} onChange={handleChange} /></Form.Group></Col>
            </Row>
            <Row>
              <Col md={6}><Form.Group><Form.Label>Initial Salary</Form.Label><Form.Control name="initialSalary" type="number" value={formData.initialSalary} onChange={handleChange} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label>Password</Form.Label><Form.Control name="password" type="password" value={formData.password} onChange={handleChange} /></Form.Group></Col>
            </Row>

            {isEditing && (
              <>
                <hr />
                <h5>Increments</h5>
                {formData.increments?.map((inc, idx) => (
                  <div key={idx} className="mb-2 d-flex justify-content-between align-items-center">
                    <div>₹{inc.amount} | {inc.type} | {inc.note}</div>
                    <Button variant="danger" size="sm" onClick={() => deleteIncrement(idx)}>🗑️</Button>
                  </div>
                ))}
                <Row>
                  <Col md={4}><Form.Control name="amount" type="number" value={increment.amount} placeholder="Amount" onChange={handleIncrementChange} /></Col>
                  <Col md={4}><Form.Control name="type" value={increment.type} placeholder="Type" onChange={handleIncrementChange} /></Col>
                  <Col md={4}><Form.Control name="note" value={increment.note} placeholder="Note" onChange={handleIncrementChange} /></Col>
                </Row>
                <Button className="mt-2" onClick={addIncrement}>Add Increment</Button>
              </>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
          <Button variant="success" onClick={handleSubmit}>{isEditing ? 'Update' : 'Register'}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserTable;
