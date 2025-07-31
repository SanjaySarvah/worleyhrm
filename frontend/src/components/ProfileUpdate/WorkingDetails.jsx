import React, { useEffect, useState } from "react";
import axios from "axios";

const WorkingDetails = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const formId = user?.formId;
  const API_URL = `http://localhost:5000/api/forms/${formId}`;

  const [pfNumber, setPfNumber] = useState("");
  const [esiNumber, setEsiNumber] = useState("");
  const [experiences, setExperiences] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const [newExp, setNewExp] = useState({
    company: "",
    designation: "",
    from: "",
    to: "",
    experienceLetter: null,
    relievingLetter: null,
    payslip: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(API_URL);
        const working = res.data?.data?.workingDetails || {};
        setPfNumber(working.pfNumber || "");
        setEsiNumber(working.esiNumber || "");
        setExperiences(working.experiences || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [formId]);

  const handlePfEsiUpdate = async () => {
    try {
      await axios.patch(`${API_URL}/working`, { pfNumber, esiNumber });
      alert("PF/ESI Numbers updated!");
    } catch (err) {
      console.error(err);
      alert("Error updating PF/ESI");
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
      alert("Please update PF and ESI numbers before adding experience.");
      return;
    }

    const formData = new FormData();
    Object.entries(newExp).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    try {
      await axios.post(`${API_URL}/working/experiences`, formData);
      alert("Experience added!");
      setNewExp({
        company: "",
        designation: "",
        from: "",
        to: "",
        experienceLetter: null,
        relievingLetter: null,
        payslip: null,
      });
      document.getElementById("closeAddExpModal").click();
      const res = await axios.get(API_URL);
      setExperiences(res.data?.data?.workingDetails?.experiences || []);
    } catch (err) {
      console.error("Error adding experience:", err);
      alert("Failed to add experience.");
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
      await axios.put(`${API_URL}/working/experiences/${exp._id}`, formData);
      alert("Experience updated!");
      setEditIndex(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update experience");
    }
  };

  const getFilePreview = (filePath) => {
    if (!filePath) return null;
    const url = `http://localhost:5000/uploads/${filePath.replace(/\\/g, "/")}`;
    const filename = filePath.split(/[\\/]/).pop();
    const isPDF = url.endsWith(".pdf");
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="d-flex align-items-center gap-2 text-decoration-none text-dark"
      >
        📄{" "}
        <span className="text-truncate" style={{ maxWidth: "120px" }}>
          {filename}
        </span>
      </a>
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

      {/* PF/ESI Section */}
      <div className="card p-3 mb-4">
        <h5>PF / ESI Details</h5>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">PF Number</label>
            <input
              type="text"
              value={pfNumber}
              onChange={(e) => setPfNumber(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">ESI Number</label>
            <input
              type="text"
              value={esiNumber}
              onChange={(e) => setEsiNumber(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="col-md-4 d-flex align-items-end">
            <button
              className="btn btn-primary w-100"
              onClick={handlePfEsiUpdate}
            >
              Update
            </button>
          </div>
        </div>
      </div>

      {/* Experience Header */}
      {/* <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Previous Experiences</h5>
        <button className="btn btn-success" data-bs-toggle="modal" data-bs-target="#addExperienceModal">
          ➕ Add Experience
        </button>
      </div> */}

      <div className="d-flex justify-content-between align-items-center mb-3 tab-head">
        <h4 className="modal-title mb-0">
          <i
            className="bi bi-telephone-forward me-2"
            style={{ fontSize: "1.2rem", color: "#ffffff" }}
          ></i>
          Previous Experiences
        </h4>

        <button
          className="btn btn-success d-flex align-items-center"
          data-bs-toggle="modal"
          data-bs-target="#addExperienceModal"
        >
          <i
            className="bi bi-plus-circle me-2"
            style={{ fontSize: "1.2rem", color: "#ffffff" }}
          ></i>
          Add Experience
        </button>
      </div>

      {/* <div className="d-flex justify-content-end">
      <button className="btn btn-success pull-right" data-bs-toggle="modal" data-bs-target="#addExperienceModal">
      <i className="bi bi-plus-circle me-2" style={{ fontSize: '1.2rem', color: '#ffffff' }}></i> Add Experience
        </button>
        </div> */}

      {/* Experience List */}
      {experiences.length === 0 ? (
        <div className="alert alert-warning">No experience records found.</div>
      ) : (
        experiences.map((exp, i) => (
          <div
            key={exp._id}
            className="card p-3 mb-3 shadow-sm position-relative"
          >
            {editIndex === i ? (
              <>
                <div className="row g-3 mb-2">
                  <div className="col-md-4">
                    <input
                      value={exp.company}
                      className="form-control"
                      onChange={(e) =>
                        handleEditExperienceChange(i, "company", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      value={exp.designation}
                      className="form-control"
                      onChange={(e) =>
                        handleEditExperienceChange(
                          i,
                          "designation",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="col-md-2">
                    <input
                      type="date"
                      value={exp.from?.slice(0, 10)}
                      className="form-control"
                      onChange={(e) =>
                        handleEditExperienceChange(i, "from", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-md-2">
                    <input
                      type="date"
                      value={exp.to?.slice(0, 10)}
                      className="form-control"
                      onChange={(e) =>
                        handleEditExperienceChange(i, "to", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) =>
                        handleEditFileChange(
                          i,
                          "experienceLetter",
                          e.target.files[0]
                        )
                      }
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) =>
                        handleEditFileChange(
                          i,
                          "relievingLetter",
                          e.target.files[0]
                        )
                      }
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) =>
                        handleEditFileChange(i, "payslip", e.target.files[0])
                      }
                    />
                  </div>
                </div>
                <div className="d-flex justify-content-end gap-2">
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleUpdateExperience(i)}
                  >
                    <i className="bi bi-save me-1"></i>  Save
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => setEditIndex(null)}
                  >
                     <i className="bi bi-x-circle me-1"></i> Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h4>
                  {exp.company} - {exp.designation}
                </h4>
                <p>
                  <strong>From:</strong>{" "}
                  {new Date(exp.from).toLocaleDateString()} <strong>To:</strong>{" "}
                  {new Date(exp.to).toLocaleDateString()}
                </p>
                {/* <div className="d-flex flex-column gap-1 mb-2">
                  {getFilePreview(exp.experienceLetter)}
                  {getFilePreview(exp.relievingLetter)}
                  {getFilePreview(exp.payslip)}
                </div> */}
                <div className="d-flex flex-wrap gap-1 mb-2">
                  {/* {exp.experienceLetter && (
                    <a
                    href={`http://localhost:5000/uploads/${exp.experienceLetter.replace(/\\/g, "/")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                    >
                      <i className="fa fa-file-pdf fa-xs text-danger"></i>View
                      Experience Letter
                    </a>
                  )} */}
                  {typeof exp.experienceLetter === "string" && (
                    <a
                      href={`http://localhost:5000/uploads/${exp.experienceLetter.replace(
                        /\\/g,
                        "/"
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                    >
                   <i className="bi bi-file-earmark-text-fill"></i> View
                      Experience Letter
                    </a>
                  )}
                  {typeof exp.relievingLetter === "string" && (
                    <a
                      href={`http://localhost:5000/uploads/${exp.relievingLetter.replace(
                        /\\/g,
                        "/"
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                    >
                    <i className="bi bi-file-earmark-text-fill"></i> View
                      Relieving Letter
                    </a>
                  )}

                  {typeof exp.payslip === "string" && (
                    <a
                      href={`http://localhost:5000/uploads/${exp.payslip.replace(
                        /\\/g,
                        "/"
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                    >
                   <i className="bi bi-file-earmark-text-fill"></i> View
                      Payslip
                    </a>
                  )}
                </div>

                <div className="d-flex justify-content-end">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setEditIndex(i)}
                  >
                    ✏️ Edit
                  </button>
                </div>
              </>
            )}
          </div>
        ))
      )}

      {/* Add Experience Modal */}
      <div className="modal fade" id="addExperienceModal" tabIndex="-1">
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Experience</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                id="closeAddExpModal"
              ></button>
            </div>

            {/* Mandatory Note */}
            {/* <div className="px-4 pt-2 text-danger small fw-semibold">
        * All fields are mandatory
      </div> */}

            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">
                    Company <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={newExp.company}
                    onChange={handleExperienceChange}
                    className="form-control"
                    placeholder="Company"
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">
                    Designation <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="designation"
                    value={newExp.designation}
                    onChange={handleExperienceChange}
                    className="form-control"
                    placeholder="Designation"
                    required
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">
                    From <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    name="from"
                    value={newExp.from}
                    onChange={handleExperienceChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">
                    To <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    name="to"
                    value={newExp.to}
                    onChange={handleExperienceChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">
                    Experience Letter <span className="text-danger">*</span>
                  </label>
                  <input
                    type="file"
                    name="experienceLetter"
                    onChange={handleExperienceChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Relieving Letter</label>
                  <input
                    type="file"
                    name="relievingLetter"
                    onChange={handleExperienceChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Payslip</label>
                  <input
                    type="file"
                    name="payslip"
                    onChange={handleExperienceChange}
                    className="form-control"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-primary" onClick={handleAddExperience}>
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkingDetails;
