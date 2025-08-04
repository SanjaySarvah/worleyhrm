// AttendanceManager.jsx with Bootstrap UI Enhancements
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import 'bootstrap/dist/css/bootstrap.min.css';

const AttendanceManager = () => {
  const [date, setDate] = useState(new Date());
  const [users, setUsers] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [designationFilter, setDesignationFilter] = useState('');
  const [activeTab, setActiveTab] = useState('daily');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  useEffect(() => {
    fetchAttendanceByDate(date);
  }, [date]);

  const formatTime12Hr = (time) => {
    if (!time) return '';
    const [hour, minute] = time.split(':');
    const h = +hour;
    const suffix = h >= 12 ? 'PM' : 'AM';
    const formattedHour = h % 12 || 12;
    return `${formattedHour}:${minute} ${suffix}`;
  };

  const fetchAttendanceByDate = async (selectedDate) => {
    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const res = await axios.get(`http://localhost:5000/api/attendance/daily?date=${formattedDate}`);
      const attendanceMap = {};
      res.data.forEach(({ user, status, permissionHours, extraHours }) => {
        attendanceMap[user._id] = {
          user,
          status,
          permissionHours: permissionHours || [],
          extraHours: extraHours || [],
        };
      });
      setAttendanceData(attendanceMap);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    }
  };

  const handleInputChange = (userId, field, index, subField, value) => {
    setAttendanceData(prev => {
      const updated = { ...prev };
      updated[userId] = { ...updated[userId] };
      if (field === 'status') {
        updated[userId].status = value;
      } else {
        updated[userId][field][index][subField] = value;
      }
      return updated;
    });
  };

  const addTimeSlot = (userId, field) => {
    setAttendanceData(prev => {
      const updated = { ...prev };
      updated[userId][field].push({ from: '', to: '' });
      return updated;
    });
  };

  const submitAttendance = async () => {
    try {
      const records = Object.entries(attendanceData).map(([userId, data]) => ({
        userId,
        date: date.toISOString(),
        status: data.status || 'Absent',
        permissionHours: data.permissionHours?.filter(t => t.from && t.to) || [],
        extraHours: data.extraHours?.filter(t => t.from && t.to) || [],
      }));
      await axios.post('http://localhost:5000/api/attendance/bulk', { records });
      alert('Attendance submitted!');
      fetchAttendanceByDate(date);
    } catch (err) {
      console.error(err);
      alert('Submission failed');
    }
  };

  const filteredUsers = Object.values(attendanceData).filter(u => {
    const nameMatch = u.user.name.toLowerCase().includes(search.toLowerCase());
    const roleMatch = !roleFilter || u.user.role === roleFilter;
    const desigMatch = !designationFilter || u.user.designation === designationFilter;
    return nameMatch && roleMatch && desigMatch;
  });

  const paginatedUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

  const exportToExcel = () => {
    const data = Object.values(attendanceData).map(u => ({
      Name: u.user.name,
      Role: u.user.role,
      Designation: u.user.designation,
      Status: u.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf]), 'attendance.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Attendance Report', 10, 10);
    let y = 20;
    Object.values(attendanceData).forEach(u => {
      doc.text(`${u.user.name} - ${u.status}`, 10, y);
      y += 10;
    });
    doc.save('attendance.pdf');
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Attendance Manager</h2>

      <div className="row mb-3">
        <div className="col-md-3">
          <DatePicker selected={date} onChange={setDate} className="form-control" />
        </div>
        <div className="col-md-3">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name" className="form-control" />
        </div>
        <div className="col-md-3">
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="form-select">
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="hr">HR</option>
            <option value="staff">Staff</option>
            <option value="employee">Employee</option>
          </select>
        </div>
        <div className="col-md-3">
          <select value={designationFilter} onChange={e => setDesignationFilter(e.target.value)} className="form-select">
            <option value="">All Designations</option>
            {[...new Set(Object.values(attendanceData).map(u => u.user.designation))].map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className="mb-3">
        <button onClick={submitAttendance} className="btn btn-success me-2">Submit Attendance</button>
        <button onClick={exportToExcel} className="btn btn-warning me-2">Export Excel</button>
        <button onClick={exportToPDF} className="btn btn-danger">Export PDF</button>
      </div>

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'daily' ? 'active' : ''}`} onClick={() => setActiveTab('daily')}>Daily</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'monthly' ? 'active' : ''}`} onClick={() => setActiveTab('monthly')}>Monthly</button>
        </li>
      </ul>

      {activeTab === 'daily' && (
        <div className="row">
          {paginatedUsers.map(({ user, status, permissionHours, extraHours }) => (
            <div key={user._id} className="col-md-6 mb-4">
              <div className="card">
                <div className="card-header d-flex align-items-center">
                  {user.profileImage && <img src={user.profileImage} alt="profile" className="rounded-circle me-2" width={40} height={40} />}
                  <strong>{user.name} ({user.designation})</strong>
                </div>
                <div className="card-body">
                  <select value={status} onChange={e => handleInputChange(user._id, 'status', null, null, e.target.value)} className="form-select mb-2">
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                  </select>
                  <div className="mb-2">
                    <label className="form-label">Permission Hours</label>
                    {permissionHours.map((slot, index) => (
                      <div key={index} className="input-group mb-1">
                        <input type="time" className="form-control" value={slot.from} onChange={e => handleInputChange(user._id, 'permissionHours', index, 'from', e.target.value)} />
                        <input type="time" className="form-control" value={slot.to} onChange={e => handleInputChange(user._id, 'permissionHours', index, 'to', e.target.value)} />
                      </div>
                    ))}
                    <button className="btn btn-link" onClick={() => addTimeSlot(user._id, 'permissionHours')}>+ Add</button>
                  </div>

                  <div>
                    <label className="form-label">Extra Hours</label>
                    {extraHours.map((slot, index) => (
                      <div key={index} className="input-group mb-1">
                        <input type="time" className="form-control" value={slot.from} onChange={e => handleInputChange(user._id, 'extraHours', index, 'from', e.target.value)} />
                        <input type="time" className="form-control" value={slot.to} onChange={e => handleInputChange(user._id, 'extraHours', index, 'to', e.target.value)} />
                      </div>
                    ))}
                    <button className="btn btn-link" onClick={() => addTimeSlot(user._id, 'extraHours')}>+ Add</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'monthly' && <div className="alert alert-info">Monthly summary coming soon...</div>}
    </div>
  );
};

export default AttendanceManager;