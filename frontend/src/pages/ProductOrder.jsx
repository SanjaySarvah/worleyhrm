import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Card, Row, Col, Spinner } from 'react-bootstrap';
import AttendancePage from '../components/AttendancePunch';

const ProductOrder = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [dailyHistory, setDailyHistory] = useState([]);
  const [selectedDayData, setSelectedDayData] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMonthlyHistory();
  }, [year, month]);

  const fetchMonthlyHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/attendance/monthly-daily-history?year=${year}&month=${month}`);
      setDailyHistory(res.data.dailyHistory);
    } catch (err) {
      console.error('Fetch error:', err);
    }
    setLoading(false);
  };

  const handleEdit = (dayData) => {
    setSelectedDayData(dayData);
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const updates = [...selectedDayData.presentList, ...selectedDayData.absentList];

      for (let emp of updates) {
        const payload = {
          userId: emp._id,
          date: selectedDayData.date,
          status: emp.status,
          permissionHours: emp.permissionHours || [],
          extraHours: emp.extraHours || [],
        };
        await axios.put("http://localhost:5000/api/attendance/update-single", payload);
      }

      fetchMonthlyHistory();
      setEditDialogOpen(false);
    } catch (err) {
      console.error("Failed to update:", err);
    }
  };

  const handleInputChange = (list, index, field, value, isPresent) => {
    const updated = [...selectedDayData[isPresent ? 'presentList' : 'absentList']];
    updated[index][field] = value;
    setSelectedDayData({
      ...selectedDayData,
      [isPresent ? 'presentList' : 'absentList']: updated
    });
  };

  return (
    <div className="container mt-4">
      <h4 className="mb-3">Attendance Monthly Daily History</h4>
      <Form className="mb-3 d-flex gap-2">
        <Form.Control
          type="number"
          min="1"
          max="12"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          placeholder="Month"
        />
        <Form.Control
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="Year"
        />
        <Button onClick={fetchMonthlyHistory}>Refresh</Button>
      </Form>

      {loading ? (
        <Spinner animation="border" />
      ) : (
        dailyHistory.map((day, idx) => (
          <Card key={idx} className="mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <Card.Title>{day.date}</Card.Title>
                  <Card.Subtitle className="text-muted">
                    Present: {day.presentCount} | Absent: {day.absentCount}
                  </Card.Subtitle>
                </div>
                <Button size="sm" onClick={() => handleEdit(day)}>Edit</Button>
              </div>
              <Row className="mt-2">
                {[...day.presentList, ...day.absentList].map(emp => (
                  <Col md={4} key={emp._id} className="mb-1">
                    <span className={day.presentList.includes(emp) ? 'text-success' : 'text-danger'}>
                      {day.presentList.includes(emp) ? '✔️' : '❌'} {emp.name} ({emp.employeeId})
                    </span>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        ))
      )}

      <Modal show={editDialogOpen} onHide={() => setEditDialogOpen(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Attendance - {selectedDayData?.date}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Present</h5>
          {selectedDayData?.presentList.map((emp, index) => (
            <div className="d-flex justify-content-between mb-2" key={emp._id}>
              <span>{emp.name} ({emp.employeeId})</span>
              <Form.Control
                type="text"
                placeholder="Extra Hours (e.g. 17:00-18:00)"
                value={emp.extraInput || ''}
                onChange={(e) => handleInputChange('presentList', index, 'extraInput', e.target.value, true)}
              />
            </div>
          ))}

          <h5 className="mt-4">Absent</h5>
          {selectedDayData?.absentList.map((emp, index) => (
            <div className="d-flex justify-content-between mb-2" key={emp._id}>
              <span>{emp.name} ({emp.employeeId})</span>
              <Form.Control
                type="text"
                placeholder="Permission Hours (e.g. 10:00-11:00)"
                value={emp.permissionInput || ''}
                onChange={(e) => handleInputChange('absentList', index, 'permissionInput', e.target.value, false)}
              />
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleUpdate}>Update</Button>
        </Modal.Footer>
      </Modal>
      <AttendancePage/>
    </div>
  );
};

export default ProductOrder;
