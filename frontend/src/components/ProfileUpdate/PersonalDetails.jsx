import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Card, Row, Col, Form } from "react-bootstrap";
import PopupConfirmation from "../Modal/PopupConfirmation";

const PersonalDetails = () => {
  const [formData, setFormData] = useState({});
  const [formId, setFormId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const id = user?.formId;
    if (!id) {
      setError("Form ID not found in localStorage");
      return;
    }
    setFormId(id);

    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/forms/${id}`);
        setFormData(res.data?.data?.personalDetails || {});
      } catch (err) {
        console.error(err);
        setError("Failed to fetch personal details");
      }
    };

    fetchData();
  }, [refreshKey]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files.length > 0) {
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
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage({ text: "Profile Details Updated successfully!", type: "success" });
      setIsEditing(false);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      setMessage({ text: "Update failed.", type: "danger" });
    }
  };

  const openPreview = (fileName) => {
    setPreviewFile(`http://localhost:5000/uploads/${fileName}`);
  };

  const closePreview = () => setPreviewFile(null);

  const fieldGroups = [
    {
      title: "Personal Info",
      icon: "bi-person",
      fields: [
        { label: "Name", name: "name" },
        { label: "Father's Name", name: "fatherName" },
        { label: "Gender", name: "gender" },
        { label: "Date of Birth", name: "dob", type: "date" },
        { label: "Blood Group", name: "bloodGroup" },
        { label: "Marital Status", name: "maritalStatus" },
        { label: "Nationality", name: "nationality" },
        { label: "Aadhaar Number", name: "aadhaarNumber" },
        { label: "PAN Number", name: "panNumber" },
        { label: "Passport Number", name: "passportNumber" },
      ],
    },
    {
      title: "Documents Upload",
      icon: "bi-upload",
      fields: [
        { label: "Profile Image", name: "profileImage" },
        { label: "Aadhaar Card", name: "aadhaarCard" },
        { label: "PAN Card", name: "panCard" },
        { label: "Passport", name: "passport" },
      ],
    },
  ];

  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="container mt-4 mb-5">
      <PopupConfirmation
        show={!!message.text}
        message={message.text}
        type={message.type}
        onClose={() => setMessage({ text: "", type: "" })}
      />
  <div className="d-flex justify-content-between align-items-center text-white rounded mb-4">
    <h5></h5>
  {!isEditing && (
          <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
            <i className="bi bi-pencil-square me-1"></i> Edit Details
          </button>
        )}
  </div>
      <div className="d-flex justify-content-between align-items-center bg-primary text-white rounded mb-4 p-2">
        <h5 className="fw-bold"><i className="bi bi-person-lines-fill me-2"></i> Personal Details</h5>

      </div>

      {fieldGroups.map((group, idx) => (
        <Card className="mb-4" key={idx}>
          <Card.Header className="fw-bold">
            <i className={`bi ${group.icon} me-2`}></i>
            {group.title}
          </Card.Header>
          <Card.Body>
            <Row>
              {group.fields.map(({ label, name, type = "text" }) => (
                <Col md={6} className="mb-3" key={name}>
                  <Form.Label className="fw-semibold">{label}</Form.Label>
                  {isEditing ? (
                    name.toLowerCase().includes("card") ||
                    name.toLowerCase().includes("image") ||
                    name.toLowerCase().includes("passport") ? (
                      <Form.Control
                        type="file"
                        name={name}
                        accept="image/*,.pdf"
                        onChange={handleChange}
                      />
                    ) : (
                      <Form.Control
                        type={type}
                        name={name}
                        value={formData[name] || ""}
                        onChange={handleChange}
                      />
                    )
                  ) : (
                    <div>
                      {formData[name] ? (
                        name.toLowerCase().includes("card") ||
                        name.toLowerCase().includes("image") ||
                        name.toLowerCase().includes("passport") ? (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => openPreview(formData[name])}
                          >
                            Preview
                          </Button>
                        ) : (
                          <span>{formData[name]}</span>
                        )
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </div>
                  )}
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      ))}

{isEditing && (
  <div className="d-flex justify-content-end gap-2 mt-3">
    <Button variant="success" onClick={handleUpdate}>
      <i className="bi bi-save me-1"></i> Save
    </Button>
    <Button variant="danger" onClick={() => setIsEditing(false)}>
      <i className="bi bi-x-circle me-1"></i> Cancel
    </Button>
  </div>
)}


      {previewFile && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={closePreview}
        >
          <div
            className="modal-dialog modal-xl"
            role="document"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Document Preview</h4>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={closePreview}
                ></button>
              </div>
              <div className="modal-body text-center">
                {previewFile.endsWith(".pdf") ? (
                  <iframe
                    src={previewFile}
                    width="100%"
                    height="600px"
                    title="Preview"
                  ></iframe>
                ) : (
                  <img
                    src={previewFile}
                    alt="Preview"
                    className="img-fluid"
                    style={{ maxHeight: "600px" }}
                  />
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