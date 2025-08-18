import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCalendar, FiPlus, FiX, FiCheck, FiEdit2, FiTrash2 } from 'react-icons/fi';

const BASE_URL = 'http://localhost:5000/api/calendar';

const CalendarManager = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [calendarData, setCalendarData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [tempEntry, setTempEntry] = useState(null);

  // Type colors for visual distinction
  const typeColors = {
    custom: 'bg-blue-100 text-blue-800',
    event: 'bg-green-100 text-green-800',
    holiday: 'bg-red-100 text-red-800',
    reminder: 'bg-yellow-100 text-yellow-800'
  };

  const fetchCalendar = async () => {
    if (!selectedDate) return;
    setIsLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}?date=${selectedDate}`);
      setCalendarData(res.data || { entries: [] });
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEntry = async () => {
    const newEntry = {
      date: selectedDate,
      title: 'New Event',
      description: '',
      type: 'custom'
    };
    try {
      await axios.post(BASE_URL, newEntry);
      fetchCalendar();
    } catch (err) {
      console.error('Error adding entry:', err);
    }
  };

  const startEditing = (index) => {
    setEditingIndex(index);
    setTempEntry({ ...calendarData.entries[index] });
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setTempEntry(null);
  };

  const saveChanges = async () => {
    try {
      await axios.put(`${BASE_URL}/${selectedDate}`, {
        index: editingIndex,
        ...tempEntry
      });
      setEditingIndex(null);
      setTempEntry(null);
      fetchCalendar();
    } catch (err) {
      console.error('Error updating entry:', err);
    }
  };

  const handleDeleteEntry = async (index) => {
    try {
      await axios.delete(`${BASE_URL}/${selectedDate}`, {
        data: { index },
      });
      fetchCalendar();
    } catch (err) {
      console.error('Error deleting entry:', err);
    }
  };

  const handleFieldChange = (field, value) => {
    setTempEntry(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    fetchCalendar();
  }, [selectedDate]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <FiCalendar className="mr-2" /> Calendar Manager
        </h1>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <button
            onClick={handleAddEntry}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="mr-2" /> Add Entry
          </button>
        </div>
      </div>

      {/* Calendar Entries */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : calendarData?.entries?.length > 0 ? (
          calendarData.entries.map((entry, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {editingIndex === index ? (
                <div className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <input
                      type="date"
                      className="px-3 py-1 border border-gray-300 rounded-md"
                      value={tempEntry.date}
                      onChange={(e) => handleFieldChange('date', e.target.value)}
                    />
                    <select
                      className="px-3 py-1 border border-gray-300 rounded-md"
                      value={tempEntry.type}
                      onChange={(e) => handleFieldChange('type', e.target.value)}
                    >
                      {Object.keys(typeColors).map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-medium text-lg"
                    value={tempEntry.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                  />
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[80px]"
                    value={tempEntry.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    placeholder="Add description..."
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={cancelEditing}
                      className="px-3 py-1 flex items-center text-gray-600 hover:bg-gray-100 rounded-md"
                    >
                      <FiX className="mr-1" /> Cancel
                    </button>
                    <button
                      onClick={saveChanges}
                      className="px-3 py-1 flex items-center bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <FiCheck className="mr-1" /> Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center mb-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${typeColors[entry.type]} mr-2`}>
                          {entry.type}
                        </span>
                        <span className="text-sm text-gray-500">{entry.date}</span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-800">{entry.title}</h3>
                      {entry.description && (
                        <p className="text-gray-600 mt-1">{entry.description}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEditing(index)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(index)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-gray-50 p-8 text-center rounded-xl border border-gray-200">
            <p className="text-gray-500">No entries for this date</p>
            <button
              onClick={handleAddEntry}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add your first entry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarManager;