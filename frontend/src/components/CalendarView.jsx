import React, { useEffect, useState } from 'react';
import './CalendarView.css';

const CalendarView = () => {
  const [calendarData, setCalendarData] = useState([]);
  const [selectedDateData, setSelectedDateData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:5000/api/calendar')
      .then(res => res.json())
      .then(data => {
        setCalendarData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching calendar:', err);
        setLoading(false);
      });
  }, []);

  const getDaysInMonth = (year, month) => {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const days = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = days[0].getDay();

  const isSameDay = (d1, d2) => {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  const getEntriesByDate = (date) => {
    return calendarData.find(entry => {
      return isSameDay(new Date(entry.date), date);
    });
  };

  const openModal = (data) => {
    setSelectedDateData(data);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedDateData(null);
  };

  const changeMonth = (increment) => {
    let newMonth = currentMonth + increment;
    let newYear = currentYear;
    
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day.getDate() === today.getDate() &&
      day.getMonth() === today.getMonth() &&
      day.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="calendar-container">
      {loading ? (
        <div className="calendar-loading">Loading calendar...</div>
      ) : (
        <>
          <div className="calendar-header">
            <button 
              className="calendar-nav-button"
              onClick={() => changeMonth(-1)}
            >
              &lt;
            </button>
            <h2 className="calendar-title">
              {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} {currentYear}
            </h2>
            <button 
              className="calendar-nav-button"
              onClick={() => changeMonth(1)}
            >
              &gt;
            </button>
          </div>

          <div className="calendar-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="calendar-day-name">{day}</div>
            ))}

            {Array(firstDayOfMonth).fill(null).map((_, idx) => (
              <div key={`empty-${idx}`} className="calendar-day empty"></div>
            ))}

            {days.map((day, idx) => {
              const entry = getEntriesByDate(day);
              const dayHasEntries = !!entry;
              const todayClass = isToday(day) ? 'today' : '';
              
              return (
                <div
                  key={idx}
                  className={`calendar-day ${todayClass} ${dayHasEntries ? 'has-entry' : ''}`}
                  onClick={() => dayHasEntries && openModal(entry)}
                >
                  <span className="day-number">{day.getDate()}</span>
                  {dayHasEntries && (
                    <div className="day-indicators">
                      {[...new Set(entry.entries.map(e => e.type.toLowerCase()))].map((type, i) => (
                        <div 
                          key={i} 
                          className={`indicator ${type}`}
                          title={`${type.charAt(0).toUpperCase() + type.slice(1)}`}
                        ></div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {modalOpen && selectedDateData && (
            <div className="calendar-modal-overlay" onClick={closeModal}>
              <div className="calendar-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={closeModal}>&times;</button>
                <h3>{new Date(selectedDateData.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</h3>
                
                <div className="entries-container">
                  {selectedDateData.entries.map((entry, idx) => (
                    <div key={idx} className={`calendar-entry ${entry.type.toLowerCase()}`}>
                      <div className="entry-header">
                        <strong>{entry.title}</strong>
                        <span className="entry-type">{entry.type}</span>
                      </div>
                      {entry.description && <p className="entry-description">{entry.description}</p>}
                      {entry.time && <div className="entry-time">⏱ {entry.time}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CalendarView;