import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CalenderReport = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCalendarEntries = async (date) => {
    if (!date) return;
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/calendar?date=${date}`);
      setEntries(res.data?.entries || []);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) fetchCalendarEntries(selectedDate);
  }, [selectedDate]);

  return (
    <div className="container mt-4">
      <h4>📅 Calendar Report</h4>

      {/* Date Filter */}
      <div className="mb-3">
        <label htmlFor="calendarDate" className="form-label">Select Date:</label>
        <input
          type="date"
          id="calendarDate"
          className="form-control"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {/* Report View */}
      {loading ? (
        <p>Loading...</p>
      ) : entries.length > 0 ? (
        <div className="card p-3">
          <h5 className="mb-3">Entries for {selectedDate}</h5>
          <ul className="list-group">
            {entries.map((entry, idx) => (
              <li key={idx} className="list-group-item">
                <strong>{entry.title}</strong> <span className="badge bg-secondary ms-2">{entry.type}</span>
                <br />
                <small className="text-muted">{entry.description || 'No description'}</small>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        selectedDate && <p className="text-muted">No entries found for this date.</p>
      )}
    </div>
  );
};

export default CalenderReport;
