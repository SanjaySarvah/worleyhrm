import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const AdminLeaveDashboard = () => {
  const [leaves, setLeaves] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const token = localStorage.getItem('token');

  const fetchLeaves = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/auth/leaves/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaves(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch leave applications. Please try again.');
      setLeaves([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleStatusChange = async (leaveId, status) => {
    try {
      setIsLoading(true);
      await axios.put(
        `${API_URL}/auth/leaves/${leaveId}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await fetchLeaves();
    } catch (error) {
      console.error(error);
      setError('Failed to update leave status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewHistory = async (userId) => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_URL}/auth/leaves/history/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedUser(res.data.user);
      setHistory(res.data.history);
      setShowHistoryModal(true);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch leave history.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLeaves = leaves.filter((leave) => {
    const name = leave.user?.name?.toLowerCase() || '';
    const phone = leave.user?.phoneNumber || '';
    const role = leave.user?.role || '';
    return (
      (name.includes(search.toLowerCase()) || phone.includes(search)) &&
      (roleFilter ? role === roleFilter : true)
    );
  });

  return (
    <div className="container-fluid py-4">
      <div className="card shadow-sm">
        <div className="card-header bg-white border-bottom">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Leave Management Dashboard</h4>
            <div className="d-flex">
              <span className="badge bg-light text-dark me-2">
                Total: {leaves.length}
              </span>
              <span className="badge bg-light text-primary">
                Pending: {leaves.filter(l => l.status === 'pending').length}
              </span>
            </div>
          </div>
        </div>

        <div className="card-body">
          <div className="row mb-4 g-3">
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-light">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  placeholder="Search by name or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-control"
                />
              </div>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
                <option value="hr">HR</option>
              </select>
            </div>
            <div className="col-md-3 text-md-end">
              <button
                className="btn btn-outline-secondary"
                onClick={fetchLeaves}
                disabled={isLoading}
              >
                {isLoading ? 'Refreshing...' : 'Refresh Data'}
              </button>
            </div>
          </div>

          {isLoading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2">Loading leave applications...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="alert alert-danger">
              {error}
              <button className="btn btn-sm btn-danger ms-3" onClick={fetchLeaves}>
                Retry
              </button>
            </div>
          )}

          {!isLoading && !error && (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Employee</th>
                    <th>Dates</th>
                    <th>Type</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaves.length > 0 ? (
                    filteredLeaves.map((leave) => (
                      <tr key={leave._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="symbol symbol-40px me-3">
                              <div className="symbol-label bg-light-primary">
                                <span className="text-primary">
                                  {leave.user?.name?.charAt(0) || 'U'}
                                </span>
                              </div>
                            </div>
                            <div>
                              <div className="fw-bold">{leave.user?.name}</div>
                              <div className="text-muted small">{leave.user?.employeeId}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            {new Date(leave.fromDate).toLocaleDateString()} -{' '}
                            {new Date(leave.toDate).toLocaleDateString()}
                          </div>
                          <div className="text-muted small">
                            {Math.ceil(
                              (new Date(leave.toDate) - new Date(leave.fromDate)) /
                                (1000 * 60 * 60 * 24)
                            ) + 1}{' '}
                            days
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark">{leave.leaveType}</span>
                        </td>
                        <td style={{ maxWidth: '200px' }} className="text-truncate">
                          {leave.reason}
                        </td>
                        <td>
                          <span
                            className={`badge rounded-pill px-3 py-2 ${
                              leave.status === 'approved'
                                ? 'bg-success'
                                : leave.status === 'rejected'
                                ? 'bg-danger'
                                : 'bg-warning text-dark'
                            }`}
                          >
                            {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          {leave.status === 'pending' ? (
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => handleViewHistory(leave.user._id)}
                              >
                                <i className="bi bi-clock-history me-1"></i> History
                              </button>
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleStatusChange(leave._id, 'approved')}
                              >
                                <i className="bi bi-check-circle me-1"></i> Approve
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleStatusChange(leave._id, 'rejected')}
                              >
                                <i className="bi bi-x-circle me-1"></i> Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-muted">Action completed</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        <i className="bi bi-folder-x text-muted" style={{ fontSize: '2rem' }}></i>
                        <p className="mt-2 mb-0">No leave applications found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card-footer bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              Last updated: {new Date().toLocaleString()}
            </small>
            <small className="text-muted">
              Showing {filteredLeaves.length} of {leaves.length} records
            </small>
          </div>
        </div>
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedUser?.name}'s Leave History
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowHistoryModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {history.length > 0 ? (
                  <table className="table table-bordered table-sm">
                    <thead className="table-light">
                      <tr>
                        <th>Date Range</th>
                        <th>Type</th>
                        <th>Reason</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h) => (
                        <tr key={h._id}>
                          <td>
                            {new Date(h.fromDate).toLocaleDateString()} -{' '}
                            {new Date(h.toDate).toLocaleDateString()}
                          </td>
                          <td>{h.leaveType}</td>
                          <td>{h.reason}</td>
                          <td>
                            <span
                              className={`badge bg-${
                                h.status === 'approved'
                                  ? 'success'
                                  : h.status === 'rejected'
                                  ? 'danger'
                                  : 'warning text-dark'
                              }`}
                            >
                              {h.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No leave history found for this user.</p>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowHistoryModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeaveDashboard;
