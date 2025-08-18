import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form, Row, Col, Badge, InputGroup } from 'react-bootstrap';
import { Trash } from 'react-bootstrap-icons';

import { CSVLink } from 'react-csv';
const VITE_IMAGE_URL = import.meta.env.VITE_IMAGE_URL;
const UPLOADS_BASE = `${VITE_IMAGE_URL}/uploads`;

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [designationSearch, setDesignationSearch] = useState('');
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
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/users`);
      setUsers(res.data.data);
      setFilteredUsers(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };


  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(u => (
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.phoneNumber.includes(search) ||
      u.officialMailId.toLowerCase().includes(search.toLowerCase())
    ) && u.designation.toLowerCase().includes(designationSearch.toLowerCase()));
    setFilteredUsers(filtered);
  }, [search, designationSearch, users]);

  const handleShowModal = (user = null) => {
    if (user) {
      setIsEditing(true);
      setSelectedUser(user);
      setFormData({
        ...user,
        password: '',
        dateOfJoining: new Date(user.dateOfJoining).toISOString().split('T')[0]
      });
    } else {
      setIsEditing(false);
      setFormData({
        employeeId: '', name: '', phoneNumber: '', officialMailId: '', password: '',
        role: '', designation: '', gender: '', dateOfJoining: '', initialSalary: '',
        increments: []
      });
    }
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
    const updated = [...formData.increments];
    updated.splice(index, 1);
    setFormData(prev => ({ ...prev, increments: updated }));
  };

  const validateEmail = email => /^\S+@\S+\.\S+$/.test(email);
  const validatePhone = phone => /^\d{10}$/.test(phone);

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

    if (!validateEmail(officialMailId)) {
      alert("Invalid email format");
      return;
    }

    if (!validatePhone(phoneNumber)) {
      alert("Phone number must be 10 digits");
      return;
    }

    const payload = {
      ...formData,
      initialSalary: Number(formData.initialSalary),
      increments: formData.increments.map(inc => ({
        ...inc,
        amount: Number(inc.amount)
      }))
    };

    try {
      if (isEditing) {
        await axios.patch(`http://localhost:5000/api/auth/update/${selectedUser._id}`, payload);
      } else {
        delete payload.increments;
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
  {/* Search and Action Buttons (keep your existing code) */}
  <Row className="mb-3">
    <Col md={4}><Form.Control placeholder="Search by Name, Phone, Email" value={search} onChange={e => setSearch(e.target.value)} /></Col>
    <Col md={4}><Form.Control placeholder="Search by Designation" value={designationSearch} onChange={e => setDesignationSearch(e.target.value)} /></Col>
    <Col md={4} className="text-end">
      <CSVLink
        data={users}
        filename="employees.csv"
        className="btn btn-outline-success"
      >
        Export CSV
      </CSVLink>
      <Button className="ms-2" onClick={() => handleShowModal()}>Add Employee</Button>
    </Col>
  </Row>

  {/* 3-Column Card Layout */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {filteredUsers.map(user => (
      <div key={user._id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
        {/* Card Header */}
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <span className="font-medium text-gray-700">{user.designation}</span>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {user.employeeId}
          </span>
        </div>
        
        {/* Card Body */}
        <div className="p-4">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-shrink-0">
              <img
                src={
                  user.profileImage
                    ? `${UPLOADS_BASE}/${user.profileImage}`
                    : 'https://cdn-icons-png.flaticon.com/512/847/847969.png'
                }
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                onError={(e) => {
                  console.warn('Image failed to load:', user.profileImage);
                  e.target.src = 'https://cdn-icons-png.flaticon.com/512/847/847969.png';
                }}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.officialMailId}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Phone</span>
              <span className="text-sm font-medium text-gray-900">{user.phoneNumber}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Salary</span>
              <div className="text-right">
                <span className="text-sm font-medium text-gray-900">
                  ₹{user.currentSalary?.toLocaleString()}
                </span>
                {user.increments?.length > 0 && (
                  <div className="text-xs text-blue-600 mt-1">
                    {user.increments.length} increment(s)
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-end">
          <button
            onClick={() => handleShowModal(user)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
        </div>
      </div>
    ))}
  </div>

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
                  <div key={idx} className="d-flex justify-content-between align-items-center mb-2">
                    <div>₹{inc.amount} | {inc.type} | {inc.note}</div>
                    <Button variant="danger" size="sm" onClick={() => deleteIncrement(idx)}><Trash /></Button>
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
