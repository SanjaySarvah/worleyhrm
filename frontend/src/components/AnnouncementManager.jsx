import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Button, Form, Table, Modal } from 'react-bootstrap';

const socket = io('http://localhost:5000');

const AnnouncementManager = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState({
    title: '',
    message: '',
    createdBy: '',
    isActive: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchAnnouncements = async () => {
    const res = await axios.get('http://localhost:5000/api/announcements');
    setAnnouncements(res.data);
  };

  useEffect(() => {
    fetchAnnouncements();

    socket.on('announcement:new', (data) => {
      setAnnouncements((prev) => [data, ...prev]);
    });

    socket.on('announcement:update', (data) => {
      setAnnouncements((prev) =>
        prev.map((a) => (a._id === data._id ? data : a))
      );
    });

    socket.on('announcement:delete', (id) => {
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
    });

    return () => {
      socket.off('announcement:new');
      socket.off('announcement:update');
      socket.off('announcement:delete');
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await axios.put(
        `http://localhost:5000/api/announcements/${editingId}`,
        form
      );
    } else {
      await axios.post('http://localhost:5000/api/announcements', form);
    }
    setForm({ title: '', message: '', createdBy: '', isActive: true });
    setEditingId(null);
    setShowModal(false);
  };

  const handleEdit = (announcement) => {
    setForm({
      title: announcement.title,
      message: announcement.message,
      createdBy: announcement.createdBy,
      isActive: announcement.isActive,
    });
    setEditingId(announcement._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/announcements/${id}`);
  };

  return (
    <div className="container mt-4">
      <h2>Announcement Manager</h2>
      <Button className="mb-3" onClick={() => setShowModal(true)}>
        + Add Announcement
      </Button>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Title</th>
            <th>Message</th>
            <th>Created By</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {announcements.map((a) => (
            <tr key={a._id}>
              <td>{a.title}</td>
              <td>{a.message}</td>
              <td>{a.createdBy}</td>
              <td>{a.isActive ? 'Active' : 'Inactive'}</td>
              <td>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => handleEdit(a)}
                >
                  Edit
                </Button>{' '}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(a._id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingId ? 'Edit Announcement' : 'Add Announcement'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formTitle" className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formMessage" className="mb-3">
              <Form.Label>Message</Form.Label>
              <Form.Control
                as="textarea"
                name="message"
                value={form.message}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formCreatedBy" className="mb-3">
              <Form.Label>Created By</Form.Label>
              <Form.Control
                type="text"
                name="createdBy"
                value={form.createdBy}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Check
              type="checkbox"
              label="Is Active"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
            />

            <div className="mt-3 d-flex justify-content-end">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>{' '}
              <Button type="submit" variant="primary">
                {editingId ? 'Update' : 'Create'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AnnouncementManager;
