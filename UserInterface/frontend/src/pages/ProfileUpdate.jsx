import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const SITE_URL = import.meta.env.SITE_URL || 'http://localhost:8000/';

const FormRegister = () => {
  const [tab, setTab] = useState('personal');
  const [formData, setFormData] = useState({
    personalDetails: {
      name: '',
      fatherName: '',
      bloodGroup: '',
      gender: '',
      dob: '',
      maritalStatus: '',
      nationality: '',
      aadhaarNumber: '',
      panNumber: '',
      passportNumber: '',
      profileImage: '',
      aadhaarCard: '',
      panCard: '',
      passport: ''
    },
    contactDetails: {
      phoneNumber: '',
      email: '',
      emergencyContact: {
        name: '',
        phone: '',
        relationship: ''
      },
      presentAddress: '',
      permanentAddress: '',
      alternateContactNumber: ''
    },
    workingDetails: {
      pfNumber: '',
      esiNumber: '',
      experiences: []
    },
    bankDetails: {
      bankName: '',
      accountHolderName: '',
      accountNumber: '',
      ifscCode: '',
      branchName: '',
      bankPassbook: ''
    }
  });
  const [files, setFiles] = useState({});
  const [formId, setFormId] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Dropdown options
  const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];
  const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const maritalStatusOptions = ['Single', 'Married', 'Divorced', 'Widowed'];
  const relationshipOptions = ['Father', 'Mother', 'Spouse', 'Sibling', 'Friend', 'Other'];
  const nationalityOptions = ['Indian', 'Other'];

  // Load formId from localStorage on initial render
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.formId) {
      setFormId(user.formId);
    }
  }, []);

  useEffect(() => {
    const fetchForm = async () => {
      if (!formId) return;

      const cleanNulls = (obj) => {
        if (Array.isArray(obj)) {
          return obj.map(cleanNulls);
        } else if (obj && typeof obj === 'object') {
          return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [key, cleanNulls(value)])
          );
        } else {
          return (obj === null || obj === 'null') ? '' : obj;
        }
      };

      try {
        setLoading(true);
        const { data } = await axios.get(`${API_URL}/forms/${formId}`);

        const experiencesWithFiles = data.form.workingDetails?.experiences?.map(exp => ({
          ...cleanNulls(exp),
          experienceLetterFile: exp.experienceLetter || '',
          relievingLetterFile: exp.relievingLetter || '',
          payslipFile: exp.payslip || '',
          existingExperienceLetter: exp.experienceLetter || '',
          existingRelievingLetter: exp.relievingLetter || '',
          existingPayslip: exp.payslip || ''
        })) || [];

        setFormData({
          personalDetails: cleanNulls(data.form.personalDetails || {}),
          contactDetails: cleanNulls(data.form.contactDetails || {}),
          workingDetails: {
            ...cleanNulls(data.form.workingDetails || {}),
            experiences: experiencesWithFiles
          },
          bankDetails: cleanNulls(data.form.bankDetails || {})
        });

      } catch (err) {
        console.error('Error loading form:', err);
        alert('Failed to load form data');
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [formId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const [parent, child, subChild] = name.split('.');
    
    setFormData(prev => {
      if (subChild) {
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [subChild]: value
            }
          }
        };
      } else if (child) {
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        };
      } else {
        return {
          ...prev,
          [parent]: value
        };
      }
    });
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    setFiles(prev => ({ ...prev, [name]: selectedFiles[0] }));
  };

  const handleExperienceFileChange = (index, field, e) => {
    const file = e.target.files[0];
    setFormData(prev => {
      const updatedExperiences = [...prev.workingDetails.experiences];
      updatedExperiences[index] = {
        ...updatedExperiences[index],
        [field]: file
      };
      return {
        ...prev,
        workingDetails: {
          ...prev.workingDetails,
          experiences: updatedExperiences
        }
      };
    });
  };

  const handleExperienceChange = (index, e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updatedExperiences = [...prev.workingDetails.experiences];
      updatedExperiences[index] = { 
        ...updatedExperiences[index], 
        [name]: value 
      };
      return {
        ...prev,
        workingDetails: {
          ...prev.workingDetails,
          experiences: updatedExperiences
        }
      };
    });
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      workingDetails: {
        ...prev.workingDetails,
        experiences: [
          ...prev.workingDetails.experiences,
          { 
            company: '', 
            designation: '', 
            from: '', 
            to: '',
            experienceLetterFile: null,
            relievingLetterFile: null,
            payslipFile: null,
            existingExperienceLetter: '',
            existingRelievingLetter: '',
            existingPayslip: ''
          }
        ]
      }
    }));
  };

  const removeExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      workingDetails: {
        ...prev.workingDetails,
        experiences: prev.workingDetails.experiences.filter((_, i) => i !== index)
      }
    }));
  };

 const validateForm = () => {
  const newErrors = {};

  // Personal Details Validation
  if (!(formData.personalDetails?.name || '').trim()) {
    newErrors.name = 'Name is required';
  }

  if (!formData.personalDetails?.gender) {
    newErrors.gender = 'Gender is required';
  }

  if (!formData.personalDetails?.dob) {
    newErrors.dob = 'Date of Birth is required';
  } else {
    const dobDate = new Date(formData.personalDetails.dob);
    const today = new Date();
    if (dobDate >= today) {
      newErrors.dob = 'Date of Birth must be in the past';
    }
  }

  if ((formData.personalDetails?.aadhaarNumber || '') && !/^\d{12}$/.test(formData.personalDetails.aadhaarNumber)) {
    newErrors.aadhaarNumber = 'Aadhaar must be 12 digits';
  }

  if ((formData.personalDetails?.panNumber || '') && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.personalDetails.panNumber)) {
    newErrors.panNumber = 'Invalid PAN format';
  }

  // Contact Details Validation
  if (!(formData.contactDetails?.phoneNumber || '').trim()) {
    newErrors.phoneNumber = 'Phone number is required';
  } else if (!/^[0-9]{10}$/.test(formData.contactDetails.phoneNumber)) {
    newErrors.phoneNumber = 'Phone number must be 10 digits';
  }

  if ((formData.contactDetails?.alternateContactNumber || '') && !/^[0-9]{10}$/.test(formData.contactDetails.alternateContactNumber)) {
    newErrors.alternateContactNumber = 'Alternate contact must be 10 digits';
  }

  if (!formData.contactDetails?.email) {
    newErrors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(formData.contactDetails.email)) {
    newErrors.email = 'Email is invalid';
  }

  if (!(formData.contactDetails?.presentAddress || '').trim()) {
    newErrors.presentAddress = 'Present address is required';
  }

  // Emergency Contact Validation
  if (!(formData.contactDetails?.emergencyContact?.name || '').trim()) {
    newErrors.emergencyName = 'Emergency contact name is required';
  }

  if (!(formData.contactDetails?.emergencyContact?.phone || '').trim()) {
    newErrors.emergencyPhone = 'Emergency phone is required';
  } else if (!/^[0-9]{10}$/.test(formData.contactDetails.emergencyContact.phone)) {
    newErrors.emergencyPhone = 'Emergency phone must be 10 digits';
  }

  if (!(formData.contactDetails?.emergencyContact?.relationship || '').trim()) {
    newErrors.emergencyRelation = 'Relationship is required';
  }

  // Bank Details Validation
  if ((formData.bankDetails?.accountNumber || '') && !/^\d{9,18}$/.test(formData.bankDetails.accountNumber)) {
    newErrors.accountNumber = 'Invalid account number';
  }

  if ((formData.bankDetails?.ifscCode || '') && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.bankDetails.ifscCode)) {
    newErrors.ifscCode = 'Invalid IFSC code';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};


 const submitOrUpdate = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const data = new FormData();

      const formPayload = {
        name: formData.personalDetails.name || null,
        fatherName: formData.personalDetails.fatherName || null,
        bloodGroup: formData.personalDetails.bloodGroup || null,
        gender: formData.personalDetails.gender || null,
        dob: formData.personalDetails.dob || null,
        maritalStatus: formData.personalDetails.maritalStatus || null,
        nationality: formData.personalDetails.nationality || null,
        aadhaarNumber: formData.personalDetails.aadhaarNumber || null,
        panNumber: formData.personalDetails.panNumber || null,
        passportNumber: formData.personalDetails.passportNumber || null,
        phoneNumber: formData.contactDetails.phoneNumber || null,
        email: formData.contactDetails.email || null,
        emergencyName: formData.contactDetails.emergencyContact?.name || null,
        emergencyPhone: formData.contactDetails.emergencyContact?.phone || null,
        emergencyRelation: formData.contactDetails.emergencyContact?.relationship || null,
        presentAddress: formData.contactDetails.presentAddress || null,
        permanentAddress: formData.contactDetails.permanentAddress || null,
        alternateContactNumber: formData.contactDetails.alternateContactNumber || null,
        pfNumber: formData.workingDetails.pfNumber || null,
        esiNumber: formData.workingDetails.esiNumber || null,
        bankName: formData.bankDetails.bankName || null,
        accountHolderName: formData.bankDetails.accountHolderName || null,
        accountNumber: formData.bankDetails.accountNumber || null,
        ifscCode: formData.bankDetails.ifscCode || null,
        branchName: formData.bankDetails.branchName || null,
        experiences: JSON.stringify(
          formData.workingDetails.experiences
            .map(exp => ({
              companyName: exp.company || null,
              employeeId: exp.employeeId || null,
              designation: exp.designation || null,
              joiningDate: exp.from || null,
              leavingDate: exp.to || null,
              experienceLetter: exp.existingExperienceLetter || null,
              relievingLetter: exp.existingRelievingLetter || null,
              payslip: exp.existingPayslip || null
            }))
            .filter(exp => Object.values(exp).some(val => val !== null))
        )
      };
      Object.entries(formPayload).forEach(([key, val]) => {
        if (val !== undefined) {
          data.append(key, val);
        }
      });

      Object.entries(files).forEach(([key, file]) => {
        if (file instanceof File) {
          data.append(key, file);
        } else if (typeof file === 'string' && file) {
          data.append(`existing_${key}`, file);
        }
      });

      formData.workingDetails.experiences.forEach((exp, index) => {
        if (exp.experienceLetterFile instanceof File) {
          data.append(`experienceLetter${index}`, exp.experienceLetterFile);
        }
        if (exp.relievingLetterFile instanceof File) {
          data.append(`relievingLetter${index}`, exp.relievingLetterFile);
        }
        if (exp.payslipFile instanceof File) {
          data.append(`payslip${index}`, exp.payslipFile);
        }
      });

      const res = await axios.put(`${API_URL}/forms/${formId}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Form updated successfully!');
      
    } catch (err) {
      console.error('Error:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Error updating form');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (path, label, type = 'text', parent = '', required = false) => {
    const fullPath = parent ? `${parent}.${path}` : path;
    const value = fullPath.split('.').reduce((obj, key) => (obj && obj[key]) || '', formData);
    const errorKey = path.includes('.') ? path.split('.')[1] : path;
    
    return (
      <div className="mb-3">
        <label className="form-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
        <input
          name={fullPath}
          value={value}
          type={type}
          onChange={handleChange}
          className={`form-control ${errors[errorKey] ? 'is-invalid' : ''}`}
          disabled={loading}
          required={required}
        />
        {errors[errorKey] && <div className="invalid-feedback">{errors[errorKey]}</div>}
      </div>
    );
  };

  const renderSelect = (path, label, options, parent = '', required = false) => {
    const fullPath = parent ? `${parent}.${path}` : path;
    const value = fullPath.split('.').reduce((obj, key) => (obj && obj[key]) || '', formData);
    const errorKey = path.includes('.') ? path.split('.')[1] : path;
    
    return (
      <div className="mb-3">
        <label className="form-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
        <select
          name={fullPath}
          value={value}
          onChange={handleChange}
          className={`form-select ${errors[errorKey] ? 'is-invalid' : ''}`}
          disabled={loading}
          required={required}
        >
          <option value="">Select {label}</option>
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        {errors[errorKey] && <div className="invalid-feedback">{errors[errorKey]}</div>}
      </div>
    );
  };

  const renderExperienceSection = () => {
    return (
      <>
        <div className="row">
          <div className="col-md-6">
            {renderInput('pfNumber', 'PF Number', 'text', 'workingDetails')}
          </div>
          <div className="col-md-6">
            {renderInput('esiNumber', 'ESI Number', 'text', 'workingDetails')}
          </div>
        </div>
        <h5 className="mt-4">Experience</h5>
        {formData.workingDetails.experiences.map((exp, index) => (
          <div key={index} className="border p-3 mb-3 rounded bg-light">
            <div className="row">
              <div className="col-md-4">
                <input
                  name="company"
                  value={exp.company}
                  placeholder="Company Name"
                  onChange={(e) => handleExperienceChange(index, e)}
                  className="form-control"
                  disabled={loading}
                />
              </div>
              <div className="col-md-3">
                <input
                  name="designation"
                  value={exp.designation}
                  placeholder="Designation"
                  onChange={(e) => handleExperienceChange(index, e)}
                  className="form-control"
                  disabled={loading}
                />
              </div>
              <div className="col-md-2">
                <input
                  type="date"
                  name="from"
                  value={exp.from}
                  onChange={(e) => handleExperienceChange(index, e)}
                  className="form-control"
                  disabled={loading}
                />
              </div>
              <div className="col-md-2">
                <input
                  type="date"
                  name="to"
                  value={exp.to}
                  onChange={(e) => handleExperienceChange(index, e)}
                  className="form-control"
                  disabled={loading}
                />
              </div>
              <div className="col-md-1">
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => removeExperience(index)}
                  disabled={loading}
                >
                  Remove
                </button>
              </div>
            </div>
            
            <div className="row mt-2">
              <div className="col-md-4">
                <div className="card">
                  <div className="card-body">
                    <h6 className="card-title">Experience Letter</h6>
                    {exp.existingExperienceLetter && (
                      <div className="mb-2">
                        <a
                          href={`${SITE_URL}${exp.existingExperienceLetter.replace(/^\/+/, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-success btn-sm me-2"
                        >
                          View Document
                        </a>
                      </div>
                    )}
                    <input
                      type="file"
                      className="form-control form-control-sm"
                      onChange={(e) => handleExperienceFileChange(index, 'experienceLetterFile', e)}
                      disabled={loading}
                    />
                    {exp.experienceLetterFile instanceof File && (
                      <div className="mt-2 text-muted">
                        New file selected: {exp.experienceLetterFile.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card">
                  <div className="card-body">
                    <h6 className="card-title">Relieving Letter</h6>
                    {exp.existingRelievingLetter && (
                      <div className="mb-2">
                        <a
                          href={`${SITE_URL}${exp.existingRelievingLetter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-success btn-sm me-2"
                        >
                          View Document
                        </a>
                      </div>
                    )}
                    <input
                      type="file"
                      className="form-control form-control-sm"
                      onChange={(e) => handleExperienceFileChange(index, 'relievingLetterFile', e)}
                      disabled={loading}
                    />
                    {exp.relievingLetterFile instanceof File && (
                      <div className="mt-2 text-muted">
                        New file selected: {exp.relievingLetterFile.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card">
                  <div className="card-body">
                    <h6 className="card-title">Payslip</h6>
                    {exp.existingPayslip && (
                      <div className="mb-2">
                        <a
                          href={`${SITE_URL}${exp.existingPayslip}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-success btn-sm me-2"
                        >
                          View Document
                        </a>
                      </div>
                    )}
                    <input
                      type="file"
                      className="form-control form-control-sm"
                      onChange={(e) => handleExperienceFileChange(index, 'payslipFile', e)}
                      disabled={loading}
                    />
                    {exp.payslipFile instanceof File && (
                      <div className="mt-2 text-muted">
                        New file selected: {exp.payslipFile.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        <button
          className="btn btn-outline-primary"
          onClick={addExperience}
          disabled={loading}
        >
          + Add Experience
        </button>
      </>
    );
  };

  return (
    <div className="container my-5" style={{ margin: '20px' }}>
      <h3 className="mb-4">Employee Registration Form</h3>
      
      {loading && (
        <div className="text-center my-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Processing your request...</p>
        </div>
      )}

      <ul className="nav nav-tabs">
        {['personal', 'contact', 'work', 'bank', 'documents'].map((t) => (
          <li className="nav-item" key={t}>
            <button
              className={`nav-link ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
              disabled={loading}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)} Details
            </button>
          </li>
        ))}
      </ul>

      <div className="card p-4 mt-3">
        {tab === 'personal' && (
          <div className="row">
            <div className="col-md-6">
              {renderInput('name', 'Full Name', 'text', 'personalDetails', true)}
            </div>
            <div className="col-md-6">
              {renderInput('fatherName', "Father's Name", 'text', 'personalDetails')}
            </div>
            <div className="col-md-4">
              {renderSelect('gender', 'Gender', genderOptions, 'personalDetails', true)}
            </div>
            <div className="col-md-4">
              {renderInput('dob', 'Date of Birth', 'date', 'personalDetails', true)}
            </div>
            <div className="col-md-4">
              {renderSelect('maritalStatus', 'Marital Status', maritalStatusOptions, 'personalDetails')}
            </div>
            <div className="col-md-6">
              {renderSelect('bloodGroup', 'Blood Group', bloodGroupOptions, 'personalDetails')}
            </div>
            <div className="col-md-6">
              {renderSelect('nationality', 'Nationality', nationalityOptions, 'personalDetails')}
            </div>
            <div className="col-md-4">
              {renderInput('aadhaarNumber', 'Aadhaar Number', 'text', 'personalDetails')}
            </div>
            <div className="col-md-4">
              {renderInput('panNumber', 'PAN Number', 'text', 'personalDetails')}
            </div>
            <div className="col-md-4">
              {renderInput('passportNumber', 'Passport Number', 'text', 'personalDetails')}
            </div>
          </div>
        )}

        {tab === 'contact' && (
          <>
            <div className="row">
              <div className="col-md-4">
                {renderInput('phoneNumber', 'Phone Number', 'tel', 'contactDetails', true)}
              </div>
              <div className="col-md-4">
                {renderInput('alternateContactNumber', 'Alternate Contact', 'tel', 'contactDetails')}
              </div>
              <div className="col-md-4">
                {renderInput('email', 'Email', 'email', 'contactDetails', true)}
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                {renderInput('presentAddress', 'Present Address', 'text', 'contactDetails', true)}
              </div>
              <div className="col-md-6">
                {renderInput('permanentAddress', 'Permanent Address', 'text', 'contactDetails')}
              </div>
            </div>
            <h5 className="mt-3">Emergency Contact</h5>
            <div className="row">
              <div className="col-md-4">
                {renderInput('name', 'Name', 'text', 'contactDetails.emergencyContact', true)}
              </div>
              <div className="col-md-4">
                {renderInput('phone', 'Phone', 'tel', 'contactDetails.emergencyContact', true)}
              </div>
              <div className="col-md-4">
                {renderSelect('relationship', 'Relationship', relationshipOptions, 'contactDetails.emergencyContact', true)}
              </div>
            </div>
          </>
        )}

        {tab === 'work' && renderExperienceSection()}

        {tab === 'bank' && (
          <>
            <div className="row">
              <div className="col-md-4">
                {renderInput('bankName', 'Bank Name', 'text', 'bankDetails')}
              </div>
              <div className="col-md-4">
                {renderInput('accountHolderName', 'Account Holder', 'text', 'bankDetails')}
              </div>
              <div className="col-md-4">
                {renderInput('accountNumber', 'Account Number', 'text', 'bankDetails')}
              </div>
            </div>
            <div className="row">
              <div className="col-md-4">
                {renderInput('ifscCode', 'IFSC Code', 'text', 'bankDetails')}
              </div>
              <div className="col-md-4">
                {renderInput('branchName', 'Branch Name', 'text', 'bankDetails')}
              </div>
            </div>
          </>
        )}

        {tab === 'documents' && (
          <div className="row">
            {['profileImage', 'aadhaarCard', 'panCard', 'passport', 'bankPassbook'].map((fileKey) => (
              <div key={fileKey} className="col-md-6 mb-4">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h6 className="card-title text-capitalize">
                      {fileKey.replace(/([A-Z])/g, ' $1')}
                    </h6>
                    
                    {formData.personalDetails?.[fileKey] && (
                      <div className="mb-2">
                        {fileKey === 'profileImage' ? (
                          <img
                            src={`${API_URL}/${formData.personalDetails[fileKey]}`}
                            alt={fileKey}
                            className="img-fluid rounded"
                            style={{ maxHeight: '150px' }}
                          />
                        ) : (
                          <a
                            href={`${API_URL}/${formData.personalDetails[fileKey]}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-success btn-sm me-2"
                          >
                            View Document
                          </a>
                        )}
                      </div>
                    )}

                    <input
                      type="file"
                      name={fileKey}
                      className="form-control"
                      onChange={handleFileChange}
                      disabled={loading}
                    />
                    {files[fileKey] && (
                      <div className="mt-2 text-muted">
                        New file selected: {files[fileKey].name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 d-flex justify-content-between">
          <button
            className="btn btn-primary"
            onClick={submitOrUpdate}
            disabled={loading}
          >
            {loading ? 'Processing...' : formId ? 'Update Form' : 'Submit Form'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormRegister;