import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AttendancePage = () => {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);
  const [editMode, setEditMode] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/attendance/daily?date=${date}`);
      setRecords(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setLoading(false);
    }
  };

  const handleStatusChange = (index, value) => {
    const updated = [...records];
    updated[index].status = value;
    setRecords(updated);
  };

  const handleUpdate = async (record) => {
    try {
      await axios.put('http://localhost:5000/api/attendance/update-single', {
        userId: record.user._id,
        date,
        status: record.status,
        permissionHours: [], // or pass existing if editing them
        extraHours: [] // same
      });
      alert('Updated successfully');
      fetchAttendance();
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  const handleMarkToday = async () => {
    try {
      const presentIds = records.map(r => ({
        userId: r.user._id,
        date,
        status: r.status || 'Absent'
      }));

      await axios.post('http://localhost:5000/api/attendance/bulk', { records: presentIds });
      alert('Attendance submitted');
      fetchAttendance();
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [date]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Attendance for {date}</h2>

      <label>Select Date: </label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        style={{ marginBottom: 20 }}
      />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', marginTop: 20 }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Employee ID</th>
              <th>Status</th>
              <th>Total Hours</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec, idx) => (
              <tr key={rec.user._id}>
                <td>{rec.user.name}</td>
                <td>{rec.user.employeeId}</td>
                <td>
                  {editMode[rec.user._id] ? (
                    <select
                      value={rec.status}
                      onChange={(e) => handleStatusChange(idx, e.target.value)}
                    >
                      <option>Present</option>
                      <option>Absent</option>
                    </select>
                  ) : (
                    rec.status
                  )}
                </td>
                <td>{rec.totalHours}</td>
                <td>
                  {editMode[rec.user._id] ? (
                    <>
                      <button onClick={() => handleUpdate(rec)}>Save</button>
                      <button onClick={() => setEditMode({ ...editMode, [rec.user._id]: false })}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setEditMode({ ...editMode, [rec.user._id]: true })}>
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button
        onClick={handleMarkToday}
        style={{
          marginTop: 20,
          padding: '10px 20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        Save All Attendance for {date}
      </button>
    </div>
  );
};

export default AttendancePage;
