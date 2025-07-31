// File: FormRegister.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

const FormRegister = () => {
  const [tab, setTab] = useState('personal');
  const [formData, setFormData] = useState({
    name: '', fatherName: '', bloodGroup: '', gender: '', dob: '', maritalStatus: '', nationality: '', aadhaarNumber: '', panNumber: '', passportNumber: '',
    phoneNumber: '', email: '', emergencyName: '', emergencyPhone: '', emergencyRelation: '', presentAddress: '', permanentAddress: '', alternateContactNumber: '',
    pfNumber: '', esiNumber: '',
    bankName: '', accountHolderName: '', accountNumber: '', ifscCode: '', branchName: '',
    experiences: [{ companyName: '', employeeId: '', designation: '', joiningDate: '' }],
  });
  const [files, setFiles] = useState({});
  const [formId, setFormId] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.formId) setFormId(user.formId);
  }, []);

  useEffect(() => {
    const fetchForm = async () => {
      if (!formId) return;
      try {
        const { data } = await axios.get(`${API_URL}/forms/${formId}`);
        const form = data.form;
        setFormData({
          name: form.personalDetails.name || '',
          fatherName: form.personalDetails.fatherName || '',
          bloodGroup: form.personalDetails.bloodGroup || '',
          gender: form.personalDetails.gender || '',
          dob: form.personalDetails.dob || '',
          maritalStatus: form.personalDetails.maritalStatus || '',
          nationality: form.personalDetails.nationality || '',
          aadhaarNumber: form.personalDetails.aadhaarNumber || '',
          panNumber: form.personalDetails.panNumber || '',
          passportNumber: form.personalDetails.passportNumber || '',
          phoneNumber: form.contactDetails.phoneNumber || '',
          email: form.contactDetails.email || '',
          emergencyName: form.contactDetails.emergencyContact?.name || '',
          emergencyPhone: form.contactDetails.emergencyContact?.phone || '',
          emergencyRelation: form.contactDetails.emergencyContact?.relationship || '',
          presentAddress: form.contactDetails.presentAddress || '',
          permanentAddress: form.contactDetails.permanentAddress || '',
          alternateContactNumber: form.contactDetails.alternateContactNumber || '',
          pfNumber: form.workingDetails.pfNumber || '',
          esiNumber: form.workingDetails.esiNumber || '',
          bankName: form.bankDetails?.bankName || '',
          accountHolderName: form.bankDetails?.accountHolderName || '',
          accountNumber: form.bankDetails?.accountNumber || '',
          ifscCode: form.bankDetails?.ifscCode || '',
          branchName: form.bankDetails?.branchName || '',
          experiences: form.workingDetails.experiences || [],
        });
      } catch (err) {
        console.error('Error loading form:', err);
      }
    };
    fetchForm();
  }, [formId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFiles((prev) => ({ ...prev, [name]: files[0] }));
  };

  const handleExperienceChange = (i, e) => {
    const updated = [...formData.experiences];
    updated[i][e.target.name] = e.target.value;
    setFormData((prev) => ({ ...prev, experiences: updated }));
  };

  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experiences: [...prev.experiences, { companyName: '', employeeId: '', designation: '', joiningDate: '' }]
    }));
  };

  const removeExperience = (i) => {
    const updated = formData.experiences.filter((_, index) => index !== i);
    setFormData((prev) => ({ ...prev, experiences: updated }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number required';
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitOrUpdate = async (type = 'submit') => {
    if (!validateForm()) return;
    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      data.append(key, key === 'experiences' ? JSON.stringify(val) : val);
    });
    Object.entries(files).forEach(([key, file]) => data.append(key, file));
    try {
      const url = formId ? `${API_URL}/forms/${formId}` : `${API_URL}/forms`;
      const method = formId ? axios.put : axios.post;
      const res = await method(url, data);
      alert(res.data.msg);
      if (!formId) setFormId(res.data.formId);
    } catch (err) {
      alert('Error saving form');
    }
  };

  const renderInput = (name, label, type = 'text') => (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <input name={name} value={formData[name]} type={type} onChange={handleChange} className="form-control" />
      {errors[name] && <div className="text-danger">{errors[name]}</div>}
    </div>
  );

  return (
    <div className="container my-5">
      <h3 className="mb-4">Employee Registration Form</h3>
      <ul className="nav nav-tabs">
        {['personal', 'contact', 'work', 'bank', 'documents'].map((t) => (
          <li className="nav-item" key={t}>
            <button className={`nav-link ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)} Details
            </button>
          </li>
        ))}
      </ul>

      <div className="card p-4 mt-3">
        {tab === 'personal' && (
          <>
            <div className="row">
              <div className="col-md-6">{renderInput('name', 'Full Name')}</div>
              <div className="col-md-6">{renderInput('fatherName', "Father's Name")}</div>
              <div className="col-md-4">{renderInput('gender', 'Gender')}</div>
              <div className="col-md-4">{renderInput('dob', 'Date of Birth', 'date')}</div>
              <div className="col-md-4">{renderInput('maritalStatus', 'Marital Status')}</div>
            </div>
            <div className="row">
              <div className="col-md-6">{renderInput('bloodGroup', 'Blood Group')}</div>
              <div className="col-md-6">{renderInput('nationality', 'Nationality')}</div>
            </div>
            <div className="row">
              <div className="col-md-4">{renderInput('aadhaarNumber', 'Aadhaar Number')}</div>
              <div className="col-md-4">{renderInput('panNumber', 'PAN Number')}</div>
              <div className="col-md-4">{renderInput('passportNumber', 'Passport Number')}</div>
            </div>
          </>
        )}

        {tab === 'contact' && (
          <>
            <div className="row">
              <div className="col-md-4">{renderInput('phoneNumber', 'Phone Number')}</div>
              <div className="col-md-4">{renderInput('alternateContactNumber', 'Alternate Contact')}</div>
              <div className="col-md-4">{renderInput('email', 'Email', 'email')}</div>
            </div>
            <div className="row">
              <div className="col-md-6">{renderInput('presentAddress', 'Present Address')}</div>
              <div className="col-md-6">{renderInput('permanentAddress', 'Permanent Address')}</div>
            </div>
            <h5 className="mt-3">Emergency Contact</h5>
            <div className="row">
              <div className="col-md-4">{renderInput('emergencyName', 'Name')}</div>
              <div className="col-md-4">{renderInput('emergencyPhone', 'Phone')}</div>
              <div className="col-md-4">{renderInput('emergencyRelation', 'Relationship')}</div>
            </div>
          </>
        )}

        {tab === 'work' && (
          <>
            <div className="row">
              <div className="col-md-6">{renderInput('pfNumber', 'PF Number')}</div>
              <div className="col-md-6">{renderInput('esiNumber', 'ESI Number')}</div>
            </div>
            <h5 className="mt-4">Experience</h5>
            {formData.experiences.map((exp, i) => (
              <div key={i} className="border p-3 mb-3 rounded bg-light">
                <div className="row">
                  <div className="col-md-4">
                    <input name="companyName" value={exp.companyName} placeholder="Company Name" onChange={(e) => handleExperienceChange(i, e)} className="form-control" />
                  </div>
                  <div className="col-md-3">
                    <input name="employeeId" value={exp.employeeId} placeholder="Employee ID" onChange={(e) => handleExperienceChange(i, e)} className="form-control" />
                  </div>
                  <div className="col-md-3">
                    <input name="designation" value={exp.designation} placeholder="Designation" onChange={(e) => handleExperienceChange(i, e)} className="form-control" />
                  </div>
                  <div className="col-md-2">
                    <input type="date" name="joiningDate" value={exp.joiningDate} onChange={(e) => handleExperienceChange(i, e)} className="form-control" />
                  </div>
                </div>
                <button className="btn btn-sm btn-danger mt-2" onClick={() => removeExperience(i)}>Remove</button>
              </div>
            ))}
            <button className="btn btn-outline-primary" onClick={addExperience}>+ Add Experience</button>
          </>
        )}

        {tab === 'bank' && (
          <>
            <div className="row">
              <div className="col-md-4">{renderInput('bankName', 'Bank Name')}</div>
              <div className="col-md-4">{renderInput('accountHolderName', 'Account Holder')}</div>
              <div className="col-md-4">{renderInput('accountNumber', 'Account Number')}</div>
            </div>
            <div className="row">
              <div className="col-md-4">{renderInput('ifscCode', 'IFSC Code')}</div>
              <div className="col-md-4">{renderInput('branchName', 'Branch Name')}</div>
            </div>
          </>
        )}

        {tab === 'documents' && (
          <>
            {['profileImage', 'aadhaarCard', 'panCard', 'passport', 'bankPassbook'].map((fileKey) => (
              <div key={fileKey} className="mb-3">
                <label className="form-label text-capitalize">{fileKey.replace(/([A-Z])/g, ' $1')}</label>
                <input type="file" name={fileKey} className="form-control" onChange={handleFileChange} />
              </div>
            ))}
          </>
        )}

        <div className="mt-4 d-flex justify-content-between">
          <button className="btn btn-primary" disabled={!!formId} onClick={() => submitOrUpdate('submit')}>Submit</button>
          <button className="btn btn-warning" disabled={!formId} onClick={() => submitOrUpdate('update')}>Update</button>
        </div>
      </div>
    </div>
  );
};

export default FormRegister;
