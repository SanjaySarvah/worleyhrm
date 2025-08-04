import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/calendar';

const CalendarManager = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [calendarData, setCalendarData] = useState(null);
  const [newEntry, setNewEntry] = useState({ title: '', description: '', type: 'custom' });

  // Fetch entries for selected date
  const fetchCalendar = async () => {
    if (!selectedDate) return;
    try {
      const res = await axios.get(`${BASE_URL}?date=${selectedDate}`);
      setCalendarData(res.data || { entries: [] });
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  // Add new entry
  const handleAddEntry = async () => {
    if (!newEntry.title || !selectedDate) return alert('Date and title are required.');
    try {
      await axios.post(BASE_URL, { date: selectedDate, ...newEntry });
      setNewEntry({ title: '', description: '', type: 'custom' });
      fetchCalendar();
    } catch (err) {
      console.error('Error adding entry:', err);
    }
  };

  // Update existing entry
  const handleUpdateEntry = async (index) => {
    const title = prompt('New title:', calendarData.entries[index].title);
    if (!title) return;

    try {
      await axios.put(`${BASE_URL}/${selectedDate}`, {
        index,
        ...calendarData.entries[index],
        title,
      });
      fetchCalendar();
    } catch (err) {
      console.error('Error updating entry:', err);
    }
  };

  // Delete entry
  const handleDeleteEntry = async (index) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    try {
      await axios.delete(`${BASE_URL}/${selectedDate}`, {
        data: { index },
      });
      fetchCalendar();
    } catch (err) {
      console.error('Error deleting entry:', err);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchCalendar();
    }
  }, [selectedDate]);

  return (
    <div className="container mt-4">
      <h3>📅 Calendar Manager</h3>

      {/* Date Picker */}
      <div className="mb-3">
        <label>Select Date:</label>
        <input
          type="date"
          className="form-control"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {/* Add Entry Form */}
      <div className="card p-3 mb-3">
        <h5>Add Entry</h5>
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Title"
          value={newEntry.title}
          onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
        />
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Description"
          value={newEntry.description}
          onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
        />
        <select
          className="form-select mb-2"
          value={newEntry.type}
          onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value })}
        >
          <option value="custom">Custom</option>
          <option value="event">Event</option>
          <option value="holiday">Holiday</option>
          <option value="reminder">Reminder</option>
        </select>
        <button className="btn btn-primary" onClick={handleAddEntry}>Add Entry</button>
      </div>

      {/* List of Entries */}
      {calendarData?.entries?.length > 0 ? (
        <div>
          <h5>Entries for {selectedDate}</h5>
          <ul className="list-group">
            {calendarData.entries.map((entry, index) => (
              <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>{entry.title}</strong> ({entry.type}) - {entry.description}
                </div>
                <div>
                  <button className="btn btn-sm btn-warning me-2" onClick={() => handleUpdateEntry(index)}>
                    Edit
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDeleteEntry(index)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        selectedDate && <p>No entries for this date.</p>
      )}
    </div>
  );
};

export default CalendarManager;
