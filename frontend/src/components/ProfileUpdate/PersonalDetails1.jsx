import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PersonalDetails = () => {
  const [formData, setFormData] = useState({});
  const [formId, setFormId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const id = user?.formId;
    if (!id) {
      setError('Form ID not found in localStorage');
      return;
    }
    setFormId(id);

    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/forms/${id}`);
        setFormData(res.data?.data?.personalDetails || {});
      } catch (err) {
        console.error(err);
        setError('Failed to fetch personal details');
      }
    };

    fetchData();
  }, [refreshKey]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = async () => {
    if (!formId) return;

    const form = new FormData();
    for (const key in formData) {
      if (formData[key]) {
        form.append(key, formData[key]);
      }
    }

    try {
      await axios.patch(`http://localhost:5000/api/forms/${formId}/personal`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Updated successfully!');
      setIsEditing(false);
      setRefreshKey((prev) => prev + 1); // force re-fetch
    } catch (err) {
      console.error(err);
      alert('Update failed.');
    }
  };

  const openPreview = (fileName) => {
    setPreviewFile(`http://localhost:5000/uploads/${fileName}`);
  };

  const closePreview = () => setPreviewFile(null);

  const fieldGroups = [
    {
      title: 'Personal Info',
      fields: [
        { label: 'Name', name: 'name' },
        { label: "Father's Name", name: 'fatherName' },
        { label: 'Gender', name: 'gender' },
        { label: 'Date of Birth', name: 'dob', type: 'date' },
        { label: 'Blood Group', name: 'bloodGroup' },
        { label: 'Marital Status', name: 'maritalStatus' },
        { label: 'Nationality', name: 'nationality' },
      ],
    },
    {
      title: 'Document Numbers',
      fields: [
        { label: 'Aadhaar Number', name: 'aadhaarNumber' },
        { label: 'PAN Number', name: 'panNumber' },
        { label: 'Passport Number', name: 'passportNumber' },
      ],
    },
    {
      title: 'Documents Upload',
      fields: [
        { label: 'Profile Image', name: 'profileImage' },
        { label: 'Aadhaar Card', name: 'aadhaarCard' },
        { label: 'PAN Card', name: 'panCard' },
        { label: 'Passport', name: 'passport' },
      ],
    },
  ];

  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>👤 Personal Details</h4>
        {!isEditing && (
          <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
            Edit Details
          </button>
        )}
      </div>

      {fieldGroups.map((group, idx) => (
        <div className="mb-4" key={idx}>
          <h5 className="text-secondary border-bottom pb-1 mb-3">{group.title}</h5>
          <div className="row">
            {group.fields.map(({ label, name, type = 'text' }) => (
              <div className="col-md-6 mb-3" key={name}>
                <label className="form-label fw-bold">{label}</label>
                {isEditing ? (
                  name.includes('Card') || name.includes('Image') || name.includes('passport') ? (
                    <input
                      type="file"
                      name={name}
                      accept="image/*,.pdf"
                      className="form-control"
                      onChange={handleChange}
                    />
                  ) : (
                    <input
                      type={type}
                      name={name}
                      value={formData[name] || ''}
                      className="form-control"
                      onChange={handleChange}
                    />
                  )
                ) : (
                  <div>
                    {formData[name] ? (
                      name.includes('Card') || name.includes('Image') || name.includes('passport') ? (
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => openPreview(formData[name])}
                        >
                          Preview
                        </button>
                      ) : (
                        <span>{formData[name]}</span>
                      )
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {isEditing && (
        <div className="d-flex gap-2">
          <button className="btn btn-success" onClick={handleUpdate}>
            Save Changes
          </button>
          <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
            Cancel
          </button>
        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-xl" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Document Preview</h5>
                <button type="button" className="btn-close" onClick={closePreview}></button>
              </div>
              <div className="modal-body text-center">
                {previewFile.endsWith('.pdf') ? (
                  <iframe src={previewFile} width="100%" height="600px" title="Preview"></iframe>
                ) : (
                  <img src={previewFile} alt="Preview" className="img-fluid" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalDetails;
