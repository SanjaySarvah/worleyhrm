import React, { useEffect, useState } from "react";
import axios from "axios";

const ViewWorkingDetails = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const formId = user?.formId;
  const API_URL = `http://localhost:5000/api/forms/${formId}`;

  const [pfNumber, setPfNumber] = useState("");
  const [esiNumber, setEsiNumber] = useState("");
  const [experiences, setExperiences] = useState([]);

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
      <div className="card mb-4 shadow-sm rounded">
        <div className="card-header bg-primary text-white rounded-top">
          <h5 className="mb-0">
            <i className="bi bi-card-checklist me-2"></i> PF / ESI Details
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold">PF Number</label>
              <input
                type="text"
                value={pfNumber}
                readOnly
                className="form-control bg-light"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">ESI Number</label>
              <input
                type="text"
                value={esiNumber}
                readOnly
                className="form-control bg-light"
              />
            </div>
          </div>
        </div>
      </div>
  
      {/* Previous Experiences Section */}
      <div className="card mb-4 shadow-sm rounded">
        <div className="card-header bg-primary text-white rounded-top">
          <h5 className="mb-0">
            <i className="bi bi-briefcase-fill me-2"></i> Previous Experiences
          </h5>
        </div>
        <div className="card-body">
          {experiences.length === 0 ? (
            <div className="alert alert-warning">No experience records found.</div>
          ) : (
            experiences.map((exp) => (
              <div key={exp._id} className="mb-4 border-bottom pb-3">
                <h6 className="fw-bold">
                  {exp.company} - {exp.designation}
                </h6>
                <p className="mb-2">
                  <strong>From:</strong>{" "}
                  {new Date(exp.from).toLocaleDateString()}{" "}
                  <strong>To:</strong> {new Date(exp.to).toLocaleDateString()}
                </p>
  
                <div className="d-flex flex-wrap justify-content-end gap-2">
                  {exp.experienceLetter && (
                    <a
                      href={`http://localhost:5000/uploads/${exp.experienceLetter.replace(
                        /\\/g,
                        "/"
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                    >
                      <i className="bi bi-file-earmark-text-fill"></i> Experience Letter
                    </a>
                  )}
                  {exp.relievingLetter && (
                    <a
                      href={`http://localhost:5000/uploads/${exp.relievingLetter.replace(
                        /\\/g,
                        "/"
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                    >
                      <i className="bi bi-file-earmark-text-fill"></i> Relieving Letter
                    </a>
                  )}
                  {exp.payslip && (
                    <a
                      href={`http://localhost:5000/uploads/${exp.payslip.replace(
                        /\\/g,
                        "/"
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                    >
                      <i className="bi bi-file-earmark-text-fill"></i> Payslip
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
  


};

export default ViewWorkingDetails;
