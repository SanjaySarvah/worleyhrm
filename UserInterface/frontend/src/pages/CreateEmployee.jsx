// with ui

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './CreateEmployee.css'; // We'll create this for custom styles
// import '../../components/ProfilePage';

const API = import.meta.env.VITE_API_URL;

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
const [formData, setFormData] = useState({
  employeeId: '', name: '', phoneNumber: '', officeMailId: '', password: '', role: 'staff',
  workingStatus: 'active',
  designation: '',
  dateOfJoining: '',
  gender: '', // ✅ Add this
  initialSalary: { amount: '', month: '', year: '', note: '' }
});

  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [salaryIncrements, setSalaryIncrements] = useState([]);
  const [incrementData, setIncrementData] = useState({ amount: '', month: '', year: '', note: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem('token');
  const [selectedImage, setSelectedImage] = useState(null);

  // const imageUrl = `http://localhost:8000/${user.profileImage?.replace(/\\/g, '/')}`;


  // Fetch all users
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search and role
  useEffect(() => {
    let results = users;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(user =>
        user.name.toLowerCase().includes(term) ||
        user.phoneNumber.includes(term)
      );
    }

    if (roleFilter) {
      results = results.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(results);
  }, [users, searchTerm, roleFilter]);

const fetchUsers = async () => {
  setIsLoading(true);
  try {
    const res = await axios.get(`${API}/auth/all-users`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Log the entire response
    console.log("Full API response:", res);

    setUsers(res.data.users || res.data);
  } catch (err) {
    console.error("Error fetching users:", err); // Also log the full error
    toast.error("Failed to fetch users");
  } finally {
    setIsLoading(false);
  }
};



  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleChange = (e) => {
    setRoleFilter(e.target.value);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['amount', 'month', 'year', 'note'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        initialSalary: { ...prev.initialSalary, [name]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

const openModal = async (user = null) => {
  setShowModal(true);

  if (user) {
    try {
      const res = await axios.get(`${API}/auth/users/${user._id}/salary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSalaryIncrements(res.data.salaryIncrements || []);
    } catch {
      setSalaryIncrements([]);
      toast.error("Failed to fetch salary history");
    }

    setEditingUser(user);
    setFormData({
      employeeId: user.employeeId || '',
      name: user.name || '',
      phoneNumber: user.phoneNumber || '',
      officeMailId: user.officeMailId || '',
      password: '',
      role: user.role || 'staff',
      workingStatus: user.workingStatus || 'active',
      designation: user.designation || '',
      dateOfJoining: user.dateOfJoining?.slice(0, 10) || '',
      gender: user.gender || '',
      initialSalary: user.initialSalary || { amount: '', month: '', year: '', note: '' }
    });
  } else {
    setEditingUser(null);
    setFormData({
      employeeId: '',
      name: '',
      phoneNumber: '',
      officeMailId: '',
      password: '',
      role: 'staff',
      workingStatus: 'active',
      designation: '',
      dateOfJoining: '',
      gender: '',
      initialSalary: { amount: '', month: '', year: '', note: '' }
    });
    setSalaryIncrements([]);
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const { password, initialSalary, ...updateData } = formData;

        await axios.put(`${API}/auth/user/${editingUser._id}`, updateData, {
          headers: { Authorization: `Bearer ${token}` }
        });

        await axios.put(`${API}/auth/users/${editingUser._id}/salary`, {
          type: 'initial',
          ...initialSalary
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        toast.success("User updated successfully");
      } else {
        await axios.post(`${API}/auth/register`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("User registered successfully");
      }

      setShowModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Action failed");
    }
  };

  const toggleWorkingStatus = async (user) => {
    const updatedStatus = user.workingStatus === 'active' ? 'inactive' : 'active';
    try {
      await axios.put(`${API}/auth/user/${user._id}`, {
        workingStatus: updatedStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Status updated successfully");
      fetchUsers();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleAddIncrement = async () => {
    try {
      await axios.put(`${API}/auth/users/${editingUser._id}/salary`, {
        type: 'increment', ...incrementData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Increment added successfully");
      openModal(editingUser);
      setIncrementData({ amount: '', month: '', year: '', note: '' });
    } catch {
      toast.error("Failed to add increment");
    }
    
  };

  const handleDeleteIncrement = async (incrementId) => {
    if (!window.confirm("Are you sure you want to delete this increment?")) return;
    try {
      await axios.delete(`${API}/auth/users/${editingUser._id}/salary/${incrementId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Increment deleted successfully");
      openModal(editingUser);
    } catch {
      toast.error("Failed to delete increment");
    }
  };

  const getCurrentSalary = (user) => {
    const base = user.initialSalary?.amount || 0;
    const totalIncrements = (user.salaryIncrements || []).reduce((acc, inc) => acc + inc.amount, 0);
    return base + totalIncrements;
  };

  // CSV Export Functionality
  const exportToCSV = () => {
    const headers = [
      'Employee ID',
      'Name',
      'Email',
      'Phone',
      'Role',
      'Status',
      'Current Salary'
    ].join(',');

    const rows = filteredUsers.map(user => [
      `"${user.employeeId}"`,
      `"${user.name}"`,
      `"${user.officeMailId}"`,
      `"${user.phoneNumber}"`,
      `"${user.role}"`,
      `"${user.workingStatus}"`,
      getCurrentSalary(user)
    ].join(','));

    const csvContent = [headers, ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `users_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
    {/* <ProfilePage /> */}
    <div className="admin-dashboard-container">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2 className="dashboard-title">
            <i className="bi bi-people-fill me-2"></i>
            Employee Management
          </h2>
          <button
            className="btn btn-primary btn-add-user"
            onClick={() => openModal()}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Add Employee
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section card">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-5">
              <label className="form-label">Search Employees</label>
              <div className="input-group search-input">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name or phone number"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            <div className="col-md-4">
              <label className="form-label">Filter by Role</label>
              <select
                className="form-select"
                value={roleFilter}
                onChange={handleRoleChange}
              >
                <option value="">All Roles</option>
                <option value="staff">Staff</option>
                <option value="hr">HR</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="col-md-3 d-flex gap-2">
              <button
                className="btn btn-outline-secondary flex-grow-1"
                onClick={handleResetFilters}
              >
                <i className="bi bi-arrow-counterclockwise me-2"></i>
                Reset
              </button>
              <button
                className="btn btn-outline-primary flex-grow-1"
                onClick={exportToCSV}
                disabled={filteredUsers.length === 0}
              >
                <i className="bi bi-download me-2"></i>
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="mb-0">Employee Directory</h3>
            <span className="badge bg-primary">
              {filteredUsers.length} {filteredUsers.length === 1 ? 'Employee' : 'Employees'}
            </span>
          </div>
        </div>

        <div className="card-body">
          {isLoading ? (
            <div className="loading-spinner">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading employee data...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Employee</th>
                    <th>Contact</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Salary</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <tr key={user._id} className="employee-row">
                        <td className="employee-id">{user.employeeId}</td>
                       <td>
  <div className="d-flex align-items-center">
    {user.profileImage ? (
      <img
        src={`http://localhost:8000/${user.profileImage.replace(/\\/g, '/')}`}
        alt="Profile"
        className="rounded-circle me-3"
        width="45"
        height="45"
        style={{ objectFit: 'cover', border: '1px solid #ccc' }}
        onError={(e) => e.target.style.display = 'none'}
      />
    ) : (
      <div className="avatar-placeholder me-3">
        {user.name.charAt(0).toUpperCase()}
      </div>
    )}
    <div>
      <div className="employee-name">{user.name}</div>
      <div className="employee-email text-muted small">{user.officeMailId}</div>
    </div>
  </div>
</td>

                        <td>
                          <div className="employee-phone">
                            <i className="bi bi-telephone me-2"></i>
                            {user.phoneNumber}
                          </div>
                        </td>
                        <td>
                          <span className={`badge role-badge ${user.role === 'admin' ? 'bg-danger' :
                            user.role === 'hr' ? 'bg-warning' : 'bg-primary'
                            }`}>
                            {user.role.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <label className="switch-toggle" title="Toggle Status">
                              <input
                                type="checkbox"
                                checked={user.workingStatus === 'active'}
                                onChange={() => toggleWorkingStatus(user)}
                              />
                              <span className="slider"></span>
                            </label>
                            <span className={`status-label ${user.workingStatus === 'active' ? 'text-success' : 'text-danger'}`}>
                              {user.workingStatus === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>


                        <td className="employee-salary">
                          ₹{getCurrentSalary(user).toLocaleString('en-IN')}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                            onClick={() => openModal(user)}
                            title="Edit Employee"
                          >
                            <i className="bi bi-pencil"></i> Edit
                          </button>
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-5 no-results">
                        {users.length === 0 ?
                          'No employees found in the system' :
                          'No matching employees found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <div >


        {/* Employee Modal */}
        {showModal && (
          // NOTE: This is only the updated modal and form section with full added fields, validation, and image input support.
// You can copy this into your existing `AdminDashboard` component, replacing your form section.

// NOTE: This is only the updated modal and form section with full added fields, validation, and image input support.
// You can copy this into your existing `AdminDashboard` component, replacing your form section.

<div className="modal show fade d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
  <div className="modal-dialog modal-lg">
    <div className="modal-content">
      <form onSubmit={handleSubmit}>
        <div className="modal-header">
          <h5 className="modal-title">{editingUser ? "Edit User" : "Register New User"}</h5>
          <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
        </div>
        <div className="modal-body row">
          {/* Left Column */}
          <div className="col-md-6">
            <div className="mb-2">
              <label>Emp ID</label>
              <input type="text" className="form-control" name="employeeId" value={formData.employeeId} onChange={handleChange} required />
            </div>
            <div className="mb-2">
              <label>Name</label>
              <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="mb-2">
              <label>Phone</label>
              <input type="tel" pattern="[0-9]{10}" title="Enter 10 digit phone number" className="form-control" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
            </div>
            <div className="mb-2">
              <label>Email</label>
              <input type="email" className="form-control" name="officeMailId" value={formData.officeMailId} onChange={handleChange} required />
            </div>
            {!editingUser && (
              <div className="mb-2">
                <label>Password</label>
                <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} required />
              </div>
            )}
            <div className="mb-2">
              <label>Designation</label>
              <input type="text" className="form-control" name="designation" value={formData.designation} onChange={handleChange} />
            </div>
            <div className="mb-2">
              <label>Date of Joining</label>
              <input type="date" className="form-control" name="dateOfJoining" value={formData.dateOfJoining} onChange={handleChange} />
            </div>
          </div>

          {/* Right Column */}
          <div className="col-md-6">
            <div className="mb-2">
              <label>Role</label>
              <select name="role" className="form-select" value={formData.role} onChange={handleChange} required>
                <option value="staff">Staff</option>
                <option value="hr">HR</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="mb-2">
              <label>Status</label>
              <select name="workingStatus" className="form-select" value={formData.workingStatus} onChange={handleChange} required>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="mb-2">
              <label>Gender</label>
              <select name="gender" className="form-select" value={formData.gender} onChange={handleChange} required>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {editingUser && (
              <>
                <h6 className="mt-3">Initial Salary</h6>
                <input type="number" name="amount" placeholder="₹ Amount" className="form-control mb-2" value={formData.initialSalary.amount} onChange={handleChange} required />
                <input type="text" name="month" placeholder="Month" className="form-control mb-2" value={formData.initialSalary.month} onChange={handleChange} required />
                <input type="number" name="year" placeholder="Year" className="form-control mb-2" value={formData.initialSalary.year} onChange={handleChange} required />
                <input type="text" name="note" placeholder="Note" className="form-control mb-2" value={formData.initialSalary.note} onChange={handleChange} required />
                <h6>Add Increment</h6>
                <input type="number" name="amount" placeholder="₹ Increment" className="form-control mb-2" value={incrementData.amount} onChange={(e) => setIncrementData({ ...incrementData, amount: e.target.value })} />
                <input type="text" name="month" placeholder="Month" className="form-control mb-2" value={incrementData.month} onChange={(e) => setIncrementData({ ...incrementData, month: e.target.value })} />
                <input type="number" name="year" placeholder="Year" className="form-control mb-2" value={incrementData.year} onChange={(e) => setIncrementData({ ...incrementData, year: e.target.value })} />
                <input type="text" name="note" placeholder="Note" className="form-control mb-2" value={incrementData.note} onChange={(e) => setIncrementData({ ...incrementData, note: e.target.value })} />
                <button type="button" className="btn btn-sm btn-outline-primary" onClick={handleAddIncrement}>+ Add Increment</button>

                <hr />
                <h6>Increment History</h6>
                <ul className="list-group">
                  {salaryIncrements.map(inc => (
                    <li key={inc._id} className="list-group-item d-flex justify-content-between align-items-center">
                      ₹{inc.amount} ({inc.month} {inc.year}) - {inc.note}
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteIncrement(inc._id)}>X</button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button type="submit" className="btn btn-primary">{editingUser ? "Update User" : "Register"}</button>
          <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
        </div>
      </form>
    </div>
  </div>
</div>


        )}
        {/* Image Preview Modal */}
{selectedImage && (
  <div className="modal show fade d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Profile Image</h5>
          <button type="button" className="btn-close" onClick={() => setSelectedImage(null)}></button>
        </div>
        <div className="modal-body text-center">
          <img
            src={selectedImage}
            alt="Profile Full"
            className="img-fluid rounded"
            style={{ maxHeight: '400px' }}
          />
        </div>
      </div>
    </div>
  </div>
)}

      </div>
    </div>
    </>
  );
};

export default AdminDashboard;
