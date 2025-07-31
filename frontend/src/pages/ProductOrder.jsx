import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

const LeaveStatusManager = () => {
  const [leaves, setLeaves] = useState([]);
  const [updatingId, setUpdatingId] = useState(null); 
  const fetchLeaves = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/leaves/all');
      setLeaves(res.data);
    } catch (err) {
      toast.error('Failed to fetch leaves');
    }
  };

  const handleStatusChange = async (leaveId, newStatus) => {
    const leave = leaves.find((l) => l._id === leaveId);
    if (!leave || leave.status === newStatus) return;

    setUpdatingId(leaveId);
    try {
      await axios.patch(`http://localhost:5000/api/auth/leaves/status/${leaveId}`, {
        status: newStatus,
      });
      toast.success('Leave status updated');
      fetchLeaves();
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  return (
    <div className="container mt-4">
      <ToastContainer />
      <h3 className="mb-4">Manage Leave Status</h3>
      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th>Employee Name</th>
            <th>Reason</th>
            <th>From</th>
            <th>To</th>
            <th>Status</th>
            <th>Change</th>
          </tr>
        </thead>
       <tbody>
  {leaves.map((leave) => (
    <tr key={leave._id}>
      <td>{leave.user?.employeeId || 'N/A'} - {leave.user?.name || 'N/A'}</td>
      <td>{leave.reason || 'N/A'}</td>
      <td>{new Date(leave.fromDate).toLocaleDateString() || 'N/A'}</td>
      <td>{new Date(leave.toDate).toLocaleDateString() || 'N/A'}</td>
      <td>
        <span
          className={`badge ${
            leave.status === 'Approved'
              ? 'bg-success'
              : leave.status === 'Rejected'
              ? 'bg-danger'
              : 'bg-warning text-dark'
          }`}
        >
          {leave.status}
        </span>
      </td>
      <td>
        <select
          className="form-select"
          value={leave.status}
          disabled={updatingId === leave._id}
          onChange={(e) =>
            handleStatusChange(leave._id, e.target.value)
          }
        >
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </td>
    </tr>
  ))}
</tbody>

      </table>
    </div>
  );
};

export default LeaveStatusManager;
