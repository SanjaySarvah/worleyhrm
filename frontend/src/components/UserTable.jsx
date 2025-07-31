import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RegisteredUsers = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    phoneNumber: '',
    officialMailId: '',
    role: '',
    designation: ''
  });

  // Fetch all registered users
  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/users');
      setUsers(res.data.data); // ✅ access array inside `data`
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // Load user data into form for editing
  const handleEditClick = (user) => {
    setEditingUser(user._id);
    setFormData({ ...user });
  };

  // Update form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Submit updated data
  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:5000/api/auth/update/${editingUser}`, formData);
      alert('User updated successfully');
      setEditingUser(null);
      fetchUsers(); // refresh data
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update user');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="container mt-4">
      <h2>Registered Users</h2>

      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>Employee ID</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Role</th>
            <th>Designation</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(users) && users.map(user => (
            <tr key={user._id}>
              <td>{user.employeeId}</td>
              <td>{user.name}</td>
              <td>{user.phoneNumber}</td>
              <td>{user.officialMailId}</td>
              <td>{user.role}</td>
              <td>{user.designation}</td>
              <td>
                <button className="btn btn-sm btn-primary" onClick={() => handleEditClick(user)}>
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingUser && (
        <div className="card p-3 mt-4">
          <h5>Edit User</h5>
          <div className="row">
            {['employeeId', 'name', 'phoneNumber', 'officialMailId', 'role', 'designation'].map((field) => (
              <div className="col-md-4 mb-3" key={field}>
                <input
                  name={field}
                  className="form-control"
                  value={formData[field] || ''}
                  onChange={handleInputChange}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                />
              </div>
            ))}
          </div>
          <button className="btn btn-success" onClick={handleUpdate}>Update</button>
          <button className="btn btn-secondary ms-2" onClick={() => setEditingUser(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default RegisteredUsers;
