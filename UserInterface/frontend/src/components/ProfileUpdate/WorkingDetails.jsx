import React, { useEffect, useState } from 'react';
import axios from 'axios';

const WorkingDetails = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const formId = user?.formId;
  const API_URL = `http://localhost:5000/api/forms/${formId}`;

  const [pfNumber, setPfNumber] = useState('');
  const [esiNumber, setEsiNumber] = useState('');
  const [experiences, setExperiences] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const [newExp, setNewExp] = useState({
    company: '',
    designation: '',
    from: '',
    to: '',
    experienceLetter: null,
    relievingLetter: null,
    payslip: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(API_URL);
        const working = res.data?.data?.workingDetails || {};
        setPfNumber(working.pfNumber || '');
        setEsiNumber(working.esiNumber || '');
        setExperiences(working.experiences || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, [formId]);

  const handlePfEsiUpdate = async () => {
    try {
      await axios.patch(`${API_URL}/working`, { pfNumber, esiNumber });
      alert('PF/ESI Numbers updated!');
    } catch (err) {
      console.error(err);
      alert('Error updating PF/ESI');
    }
  };

  const handleExperienceChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setNewExp({ ...newExp, [name]: files[0] });
    } else {
      setNewExp({ ...newExp, [name]: value });
    }
  };

  const handleAddExperience = async () => {
    if (!pfNumber.trim() || !esiNumber.trim()) {
      alert('Please update PF and ESI numbers before adding experience.');
      return;
    }

    const formData = new FormData();
    Object.entries(newExp).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    try {
      await axios.post(`${API_URL}/working/experiences`, formData);
      alert('Experience added!');
      setNewExp({ company: '', designation: '', from: '', to: '', experienceLetter: null, relievingLetter: null, payslip: null });
      const res = await axios.get(API_URL);
      setExperiences(res.data?.data?.workingDetails?.experiences || []);
    } catch (err) {
      console.error('Error adding experience:', err);
      alert('Failed to add experience.');
    }
  };

  const handleEditExperienceChange = (index, field, value) => {
    const updated = [...experiences];
    updated[index][field] = value;
    setExperiences(updated);
  };

  const handleEditFileChange = (index, field, file) => {
    const updated = [...experiences];
    updated[index][field] = file;
    setExperiences(updated);
  };

  const handleUpdateExperience = async (index) => {
    const exp = experiences[index];
    const formData = new FormData();
    for (const key in exp) {
      if (exp[key]) formData.append(key, exp[key]);
    }

    try {
      await axios.put(`${API_URL}/working/experiences/${exp._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Experience updated!');
      setEditIndex(null);
    } catch (err) {
      console.error(err);
      alert('Failed to update experience');
    }
  };

  const getFilePreview = (filePath) => {
    if (!filePath) return null;
    const url = `http://localhost:5000/uploads/${filePath.replace(/\\/g, '/')}`;
    const isPDF = url.endsWith('.pdf');
    return isPDF ? (
      <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-dark">View PDF</a>
    ) : (
      <img src={url} alt="preview" className="img-preview border" />
    );
  };

  return (
    <div className="container py-4">
      <style>{`
        .img-preview {
          max-width: 100px;
          max-height: 100px;
          border-radius: 0.5rem;
          object-fit: contain;
        }
      `}</style>

      <h3 className="mb-4">💼 Working Details</h3>

      <div className="accordion" id="workingAccordion">

        {/* PF/ESI Section */}
        <div className="accordion-item">
          <h2 className="accordion-header" id="pfEsiHeader">
            <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#pfEsiCollapse" aria-expanded="true">
              PF / ESI Details
            </button>
          </h2>
          <div id="pfEsiCollapse" className="accordion-collapse collapse show" data-bs-parent="#workingAccordion">
            <div className="accordion-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">PF Number</label>
                  <input type="text" value={pfNumber} onChange={(e) => setPfNumber(e.target.value)} className="form-control" />
                </div>
                <div className="col-md-4">
                  <label className="form-label">ESI Number</label>
                  <input type="text" value={esiNumber} onChange={(e) => setEsiNumber(e.target.value)} className="form-control" />
                </div>
                <div className="col-md-4 d-flex align-items-end">
                  <button className="btn btn-primary w-100" onClick={handlePfEsiUpdate}>Update</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Experience */}
        <div className="accordion-item">
          <h2 className="accordion-header" id="addExpHeader">
            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#addExpCollapse">
              Add Experience
            </button>
          </h2>
          <div id="addExpCollapse" className="accordion-collapse collapse" data-bs-parent="#workingAccordion">
            <div className="accordion-body">
              {(!pfNumber.trim() || !esiNumber.trim()) && (
                <div className="alert alert-warning">
                  ⚠️ Please update both PF and ESI numbers to enable experience submission.
                </div>
              )}
              <fieldset disabled={!pfNumber.trim() || !esiNumber.trim()}>
                <div className="row g-3">
                  <div className="col-md-4">
                    <input type="text" name="company" value={newExp.company} onChange={handleExperienceChange} className="form-control" placeholder="Company" />
                  </div>
                  <div className="col-md-4">
                    <input type="text" name="designation" value={newExp.designation} onChange={handleExperienceChange} className="form-control" placeholder="Designation" />
                  </div>
                  <div className="col-md-2">
                    <input type="date" name="from" value={newExp.from} onChange={handleExperienceChange} className="form-control" />
                  </div>
                  <div className="col-md-2">
                    <input type="date" name="to" value={newExp.to} onChange={handleExperienceChange} className="form-control" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Experience Letter</label>
                    <input type="file" name="experienceLetter" onChange={handleExperienceChange} className="form-control" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Relieving Letter</label>
                    <input type="file" name="relievingLetter" onChange={handleExperienceChange} className="form-control" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Payslip</label>
                    <input type="file" name="payslip" onChange={handleExperienceChange} className="form-control" />
                  </div>
                  <div className="col-12">
                    <button className="btn btn-success w-100" onClick={handleAddExperience}>Add Experience</button>
                  </div>
                </div>
              </fieldset>
            </div>
          </div>
        </div>

        {/* View/Edit Experience */}
        <div className="accordion-item">
          <h2 className="accordion-header" id="viewExpHeader">
            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#viewExpCollapse">
              View/Edit Experience
            </button>
          </h2>
          <div id="viewExpCollapse" className="accordion-collapse collapse" data-bs-parent="#workingAccordion">
            <div className="accordion-body">
              {experiences.length === 0 ? (
                <div className="alert alert-warning">No experience records found.</div>
              ) : (
                experiences.map((exp, i) => (
                  <div key={exp._id} className="card p-3 mb-3 shadow-sm">
                    {editIndex === i ? (
                      <>
                        <div className="row g-3 mb-2">
                          <div className="col-md-4">
                            <label className="form-label">Company</label>
                            <input value={exp.company} className="form-control" onChange={(e) => handleEditExperienceChange(i, 'company', e.target.value)} />
                          </div>
                          <div className="col-md-4">
                            <label className="form-label">Designation</label>
                            <input value={exp.designation} className="form-control" onChange={(e) => handleEditExperienceChange(i, 'designation', e.target.value)} />
                          </div>
                          <div className="col-md-2">
                            <label className="form-label">From</label>
                            <input type="date" value={exp.from?.slice(0, 10)} className="form-control" onChange={(e) => handleEditExperienceChange(i, 'from', e.target.value)} />
                          </div>
                          <div className="col-md-2">
                            <label className="form-label">To</label>
                            <input type="date" value={exp.to?.slice(0, 10)} className="form-control" onChange={(e) => handleEditExperienceChange(i, 'to', e.target.value)} />
                          </div>
                          <div className="col-md-4">
                            <label className="form-label">Replace Experience Letter</label>
                            <input type="file" className="form-control" onChange={(e) => handleEditFileChange(i, 'experienceLetter', e.target.files[0])} />
                          </div>
                          <div className="col-md-4">
                            <label className="form-label">Replace Relieving Letter</label>
                            <input type="file" className="form-control" onChange={(e) => handleEditFileChange(i, 'relievingLetter', e.target.files[0])} />
                          </div>
                          <div className="col-md-4">
                            <label className="form-label">Replace Payslip</label>
                            <input type="file" className="form-control" onChange={(e) => handleEditFileChange(i, 'payslip', e.target.files[0])} />
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          <button className="btn btn-success btn-sm" onClick={() => handleUpdateExperience(i)}>Save</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => setEditIndex(null)}>Cancel</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <h6>{exp.company} - {exp.designation}</h6>
                        <p><strong>From:</strong> {new Date(exp.from).toLocaleDateString()} <strong>To:</strong> {new Date(exp.to).toLocaleDateString()}</p>
                        <div className="d-flex flex-wrap gap-2 mb-2">
                          {getFilePreview(exp.experienceLetter)}
                          {getFilePreview(exp.relievingLetter)}
                          {getFilePreview(exp.payslip)}
                        </div>
                        <button className="btn btn-outline-primary btn-sm" onClick={() => setEditIndex(i)}>Edit</button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkingDetails;
