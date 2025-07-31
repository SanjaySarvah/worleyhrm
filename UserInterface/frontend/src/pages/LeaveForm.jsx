import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const API_URL = 'http://localhost:8000/api';
const StaffLeaveDashboard = () => {
  const token = localStorage.getItem('token');
  const [form, setForm] = useState({
    leaveType: '',
    fromDate: '',
    toDate: '',
    reason: ''
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const fetchLeaveHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/leaves/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const sorted = res.data.sort(
        (a, b) => new Date(b.fromDate) - new Date(a.fromDate)
      );

      setHistory(sorted || []);
    } catch (err) {
      toast.error('Error fetching leave history');
    }
  };
  useEffect(() => {
    fetchLeaveHistory();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { leaveType, fromDate, toDate, reason } = form;

    if (!leaveType || !fromDate || !toDate || !reason) {
      toast.warning('Please fill in all fields');
      return;
    }

    const hasPending = history.some((h) => h.status === 'pending');
    if (hasPending) {
      toast.warn('You have a pending leave request. Please wait for approval.');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API_URL}/auth/leaves/apply`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('✅ Leave applied successfully!');
      setForm({ leaveType: '', fromDate: '', toDate: '', reason: '' });
      fetchLeaveHistory();
    } catch (err) {
      toast.error(err.response?.data?.msg || '❌ Error applying leave');
    } finally {
      setLoading(false);
    }
  };

    const filteredHistory = history.filter((leave) => {
    const leaveMonth = new Date(leave.fromDate).toISOString().slice(0, 7);
    const leaveDate = new Date(leave.fromDate);
    const fromDateFilter = filterFrom ? new Date(filterFrom) : null;
    const toDateFilter = filterTo ? new Date(filterTo) : null;

    return (
      (!filterMonth || leaveMonth === filterMonth) &&
      (!fromDateFilter || leaveDate >= fromDateFilter) &&
      (!toDateFilter || leaveDate <= toDateFilter)
    );
  });
  return (
    <div className="container mt-4">
      <ToastContainer />

      <h3 className="mb-4">📝 Staff Leave Application</h3>

      {/* Leave Form */}
      <form onSubmit={handleSubmit} className="border p-4 rounded shadow-sm bg-light mb-4">
        <div className="row mb-3">
          <div className="col-md-3">
            <label className="form-label">Leave Type</label>
            <select
              name="leaveType"
              value={form.leaveType}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Select</option>
              <option value="casual">Casual</option>
              <option value="sick">Sick</option>
              <option value="earned">Earned</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">From</label>
            <input
              type="date"
              name="fromDate"
              value={form.fromDate}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">To</label>
            <input
              type="date"
              name="toDate"
              value={form.toDate}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Reason</label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              className="form-control"
              placeholder="Reason for leave"
              rows="2"
              maxLength={200}
              required
            />
            <small className="text-muted">Max 200 characters</small>
          </div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Submitting...' : 'Apply Leave'}
        </button>
      </form>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-4">
          <label className="form-label">📆 Filter by Month</label>
          <input
            type="month"
            className="form-control"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">From Date</label>
          <input
            type="date"
            className="form-control"
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">To Date</label>
          <input
            type="date"
            className="form-control"
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
          />
        </div>
      </div>

      {/* History Table */}
      <h5 className="mb-3">📋 My Leave History</h5>
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>Leave Type</th>
              <th>From</th>
              <th>To</th>
              <th>Reason</th>
              <th>Status</th>
              {/* <th>Applied On</th> */}
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length > 0 ? (
              filteredHistory.map((leave) => (
                <tr key={leave._id}>
                  <td>{leave.leaveType}</td>
                  <td>{new Date(leave.fromDate).toLocaleDateString()}</td>
                  <td>{new Date(leave.toDate).toLocaleDateString()}</td>
                  <td>{leave.reason}</td>
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
                      {leave.status.toUpperCase()}
                    </span>
                  </td>
                  {/* <td>{new Date(leave.appliedAt).toLocaleString()}</td> */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-muted">
                  No leave history found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffLeaveDashboard;
