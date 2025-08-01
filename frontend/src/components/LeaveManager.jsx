import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/calendar';

const initialFormState = {
  date: '',
  title: '',
  description: '',
  type: 'custom'
};

const CalendarManager = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [entries, setEntries] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await axios.get(API_URL);
      setEntries(res.data);
    } catch (err) {
      console.error('Error fetching entries:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, formData);
      } else {
        await axios.post(API_URL, formData);
      }
      setFormData(initialFormState);
      setEditingId(null);
      fetchEntries();
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  const handleEdit = (entry) => {
    setFormData({
      date: entry.date.split('T')[0],
      title: entry.title,
      description: entry.description,
      type: entry.type
    });
    setEditingId(entry._id);
  };

  return (
    <div className="container my-5">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">{editingId ? 'Update Calendar Entry' : 'Add New Calendar Entry'}</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Date</label>
              <input type="date" name="date" className="form-control" value={formData.date} onChange={handleChange} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">Title</label>
              <input type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">Type</label>
              <select name="type" className="form-select" value={formData.type} onChange={handleChange}>
                <option value="holiday">Holiday</option>
                <option value="event">Event</option>
                <option value="reminder">Reminder</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea name="description" className="form-control" rows="2" value={formData.description} onChange={handleChange} />
            </div>
            <div className="col-12 d-flex justify-content-end">
              <button type="submit" className="btn btn-success">{editingId ? 'Update Entry' : 'Add Entry'}</button>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-5">
        <h4>All Calendar Entries</h4>
        <div className="table-responsive">
          <table className="table table-bordered table-striped mt-3">
            <thead className="table-dark">
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Type</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => (
                <tr key={entry._id}>
                  <td>{entry.date.split('T')[0]}</td>
                  <td>{entry.title}</td>
                  <td><span className="badge bg-secondary text-capitalize">{entry.type}</span></td>
                  <td>{entry.description}</td>
                  <td>
                    <button className="btn btn-sm btn-primary" onClick={() => handleEdit(entry)}>Edit</button>
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center">No entries found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CalendarManager;
