import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StaffLeave = () => {
  const [showForm, setShowForm] = useState(false);
  const [leaveType, setLeaveType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [leaves, setLeaves] = useState([]);

  const token = localStorage.getItem('token');
  const leaveTypes = ['Sick Leave', 'Casual Leave', 'Paid Leave', 'Half Day', 'Work From Home'];

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/leaves/myleaves', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLeaves(response.data);
    } catch (err) {
      console.error('Error fetching leaves:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!leaveType || !fromDate || !toDate || !reason) {
      alert('Please fill all fields');
      return;
    }

    try {
      await axios.post(
        'http://localhost:5000/api/auth/leaves/apply',
        { leaveType, fromDate, toDate, reason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('Leave request submitted!');
      setShowForm(false);
      setLeaveType('');
      setFromDate('');
      setToDate('');
      setReason('');
      fetchMyLeaves();
    } catch (err) {
      console.error('Error applying leave:', err);
      alert('Error applying leave');
    }
  };

  const groupedLeaves = leaves.reduce((acc, leave) => {
    const date = new Date(leave.fromDate);
    const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(leave);
    return acc;
  }, {});

  return (
    <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ marginBottom: '20px' }}>📅 Leave Management</h2>

      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '6px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        {showForm ? 'Cancel' : 'Ask Leave Permission'}
      </button>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: '#f9f9f9',
            padding: '25px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '30px'
          }}
        >
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Leave Type</label>
            <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} required style={{ width: '100%', padding: '8px' }}>
              <option value="">Select Type</option>
              {leaveTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>From Date</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>To Date</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Reason</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
          </div>

          <button
            type="submit"
            style={{
              backgroundColor: '#28a745',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Submit Leave
          </button>
        </form>
      )}

      <h3 style={{ marginBottom: '15px' }}>📋 My Leave History</h3>
      {Object.keys(groupedLeaves).length === 0 ? (
        <p>No leaves applied yet.</p>
      ) : (
        Object.entries(groupedLeaves).map(([monthYear, entries]) => (
          <div key={monthYear} style={{ marginBottom: '25px' }}>
            <h4 style={{ color: '#555', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>{monthYear}</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0' }}>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>From</th>
                  <th style={thStyle}>To</th>
                  <th style={thStyle}>Reason</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((leave) => (
                  <tr key={leave._id} style={{ textAlign: 'center' }}>
                    <td style={tdStyle}>{leave.leaveType}</td>
                    <td style={tdStyle}>{new Date(leave.fromDate).toLocaleDateString()}</td>
                    <td style={tdStyle}>{new Date(leave.toDate).toLocaleDateString()}</td>
                    <td style={tdStyle}>{leave.reason}</td>
                    <td style={{ ...tdStyle }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '15px',
                          backgroundColor:
                            leave.status === 'approved'
                              ? '#d4edda'
                              : leave.status === 'rejected'
                              ? '#f8d7da'
                              : '#fff3cd',
                          color:
                            leave.status === 'approved'
                              ? '#155724'
                              : leave.status === 'rejected'
                              ? '#721c24'
                              : '#856404',
                          fontWeight: 600
                        }}
                      >
                        {leave.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
};

const thStyle = {
  padding: '10px',
  border: '1px solid #ddd',
  backgroundColor: '#f8f9fa',
  textAlign: 'center'
};

const tdStyle = {
  padding: '10px',
  border: '1px solid #ddd'
};

export default StaffLeave;
