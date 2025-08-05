import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

const AdminLeaveManager = () => {
  const [leaves, setLeaves] = useState([]);
  const token = localStorage.getItem('token');

  // Fetch all leave requests
  const fetchAllLeaves = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/auth/leaves/all`, {
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
        `${BASE_URL}/api/auth/leaves/status/${leaveId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      alert(`Leave status updated to "${newStatus}"`);
      fetchAllLeaves(); // refresh
    } catch (err) {
      console.error('Failed to update status:', err.response?.data || err.message);
      alert(`Failed to update status: ${err.response?.data?.message || err.message}`);
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
            <tr style={{ backgroundColor: '#f1f1f1' }}>
              <th style={styles.th}>Employee</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>From</th>
              <th style={styles.th}>To</th>
              <th style={styles.th}>Reason</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((leave) => (
              <tr key={leave._id} style={{ borderBottom: '1px solid #ccc' }}>
                <td style={styles.td}>
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
                <td style={styles.td}>{leave.leaveType}</td>
                <td style={styles.td}>{new Date(leave.fromDate).toLocaleDateString()}</td>
                <td style={styles.td}>{new Date(leave.toDate).toLocaleDateString()}</td>
                <td style={styles.td}>{leave.reason}</td>
                <td style={styles.td}>
                  <select
                    value={leave.status}
                    onChange={(e) => handleStatusChange(leave._id, e.target.value)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
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

// Styling object
const styles = {
  th: {
    textAlign: 'left',
    padding: '10px',
    borderBottom: '2px solid #ccc',
  },
  td: {
    padding: '10px',
    verticalAlign: 'top',
  },
};

export default AdminLeaveManager;
