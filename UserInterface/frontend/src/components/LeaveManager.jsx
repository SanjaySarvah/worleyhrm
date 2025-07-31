import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { PencilSquare, PlusCircle } from 'react-bootstrap-icons';

const API_BASE = 'http://localhost:5000/api/calendar';

const CalendarManager = () => {
  const currentYear = new Date().getFullYear();
  const [year] = useState(currentYear);
  const [month, setMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [calendarDays, setCalendarDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [type, setType] = useState('working-day');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);

  const fetchCalendar = async () => {
    try {
      const res = await axios.get(`${API_BASE}/${year}/${month}`);
      setCalendarDays(res.data);
    } catch (err) {
      console.error('Failed to fetch calendar:', err);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, [month]);

  const handleSubmit = async () => {
    if (!selectedDate || !type) return;
    const payload = {
      date: selectedDate,
      dayOfWeek: selectedDate.toLocaleDateString('en-US', { weekday: 'long' }),
      type,
      description,
      year
    };
    try {
      await axios.post(API_BASE, payload);
      resetForm();
      fetchCalendar();
    } catch (err) {
      console.error('Failed to submit data:', err);
    }
  };

  const handleEdit = (day) => {
    setSelectedDate(new Date(day.date));
    setType(day.type);
    setDescription(day.description);
    setEditingId(day._id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/${id}`);
      fetchCalendar();
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  };

  const resetForm = () => {
    setSelectedDate(new Date());
    setType('working-day');
    setDescription('');
    setEditingId(null);
  };

  return (
    <div className="container mt-5">
      <div className="row mb-4">
        <div className="col-md-3">
          <label className="form-label">Select Date</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            className="form-control"
            dateFormat="yyyy-MM-dd"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            maxDate={new Date(`${year}-12-31`)}
            minDate={new Date(`${year}-01-01`)}
          />
        </div>

        <div className="col-md-3">
          <label className="form-label">Type</label>
          <select
            className="form-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="working-day">Working Day</option>
            <option value="holiday">Holiday</option>
            <option value="optional-holiday">Optional Holiday</option>
            <option value="weekend">Weekend</option>
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label">Description</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. Independence Day"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="col-md-2 d-flex align-items-end">
          <button
            className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
            onClick={handleSubmit}
          >
            {editingId ? (
              <>
                <PencilSquare />
                <strong>Update</strong>
              </>
            ) : (
              <>
                <PlusCircle />
                <strong>Add</strong>
              </>
            )}
          </button>
        </div>
      </div>

      {editingId && (
        <div className="text-end mb-3">
          <button className="btn btn-secondary btn-sm" onClick={resetForm}>
            Cancel Editing
          </button>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Entries for {year}-{month}</h5>
        <select
          className="form-select w-auto"
          value={month}
          onChange={(e) => setMonth(e.target.value.padStart(2, '0'))}
        >
          {Array.from({ length: 12 }, (_, i) => {
            const m = String(i + 1).padStart(2, '0');
            return <option key={m} value={m}>{m}</option>;
          })}
        </select>
      </div>

      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>Date</th>
            <th>Day</th>
            <th>Type</th>
            <th>Description</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {calendarDays.map((day) => (
            <tr key={day._id}>
              <td>{new Date(day.date).toLocaleDateString()}</td>
              <td>{day.dayOfWeek}</td>
              <td>{day.type}</td>
              <td>{day.description}</td>
              <td>
                <button
                  className="btn btn-sm btn-primary me-2"
                  onClick={() => handleEdit(day)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(day._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {calendarDays.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center">No entries found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CalendarManager;
