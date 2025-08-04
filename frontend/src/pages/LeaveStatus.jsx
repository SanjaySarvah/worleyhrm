import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminLeaveManager = () => {
  const [leaves, setLeaves] = useState([]);
  const token = localStorage.getItem('token');

  // Fetch all leave requests
  const fetchAllLeaves = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/leaves/all', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLeaves(res.data);
    } catch (err) {
      console.error('Failed to fetch leave requests:', err);
      alert('Error fetching leave data');
    }
  };

  // Update leave status
  const handleStatusChange = async (leaveId, newStatus) => {
    try {
      if (!newStatus) {
        alert("Please select a status.");
        return;
      }

      console.log('Updating leave:', leaveId, 'to status:', newStatus);

      const res = await axios.patch(
        `http://localhost:5000/api/auth/leaves/status/${leaveId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      alert(`Leave status updated to "${newStatus}"`);
      fetchAllLeaves();
    } catch (err) {
      console.error('Failed to update status:', err.response?.data || err.message);
      alert('Failed to update status. Check console for more info.');
    }
  };

  useEffect(() => {
    fetchAllLeaves();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>All Leave Requests</h2>

      {leaves.length === 0 ? (
        <p>No leave requests found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Type</th>
              <th>From</th>
              <th>To</th>
              <th>Reason</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((leave) => (
              <tr key={leave._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={leave.user?.profileImage || 'https://via.placeholder.com/40'}
                      alt="profile"
                      width="40"
                      height="40"
                      style={{ borderRadius: '50%' }}
                    />
                    <div>
                      <strong>{leave.user?.name}</strong>
                      <br />
                      <small>{leave.user?.officeMailId}</small>
                    </div>
                  </div>
                </td>
                <td>{leave.leaveType}</td>
                <td>{new Date(leave.fromDate).toLocaleDateString()}</td>
                <td>{new Date(leave.toDate).toLocaleDateString()}</td>
                <td>{leave.reason}</td>
                <td>
                  <select
                    value={leave.status}
                    onChange={(e) => handleStatusChange(leave._id, e.target.value)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '4px',
                      backgroundColor:
                        leave.status === 'approved'
                          ? '#d4edda'
                          : leave.status === 'rejected'
                          ? '#f8d7da'
                          : '#fff3cd',
                      color:
                        leave.status === 'approved'
                          ? 'green'
                          : leave.status === 'rejected'
                          ? 'red'
                          : 'orange',
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminLeaveManager;
