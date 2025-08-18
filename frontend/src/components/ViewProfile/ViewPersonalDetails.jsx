import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Card, Row, Col, Form, Badge, Spinner } from "react-bootstrap";
import PopupConfirmation from "../Modal/PopupConfirmation";
import { FaEye, FaEdit, FaUser, FaIdCard, FaHome, FaPhone, FaEnvelope, FaGlobe } from "react-icons/fa";

const ViewPersonalDetails = () => {
  const [formData, setFormData] = useState({});
  const [formId, setFormId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const id = user?.formId;
    if (!id) {
      setError("Form ID not found in localStorage");
      setIsLoading(false);
      return;
    }
    setFormId(id);

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`http://localhost:5000/api/forms/${id}`);
        setFormData(res.data?.data?.personalDetails || {});
      } catch (err) {
        console.error(err);
        setError("Failed to fetch personal details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [refreshKey]);

  const openPreview = (fileName) => {
    setPreviewFile(`http://localhost:5000/uploads/${fileName}`);
  };

  const closePreview = () => setPreviewFile(null);

  const fieldGroups = [
    {
      title: "Personal Information",
      icon: <FaUser className="me-2" />,
      fields: [
        { label: "Full Name", name: "name", icon: <FaUser size={14} className="me-2" /> },
        { label: "Father's Name", name: "fatherName", icon: <FaUser size={14} className="me-2" /> },
        { label: "Gender", name: "gender", icon: <FaUser size={14} className="me-2" /> },
        { label: "Date of Birth", name: "dob", type: "date", icon: <FaUser size={14} className="me-2" /> },
        { label: "Blood Group", name: "bloodGroup", icon: <FaUser size={14} className="me-2" /> },
      ],
    },
    {
      title: "Identification",
      icon: <FaIdCard className="me-2" />,
      fields: [
        { label: "Aadhaar Number", name: "aadhaarNumber", icon: <FaIdCard size={14} className="me-2" /> },
        { label: "PAN Number", name: "panNumber", icon: <FaIdCard size={14} className="me-2" /> },
        { label: "Passport Number", name: "passportNumber", icon: <FaIdCard size={14} className="me-2" /> },
      ],
    },
    {
      title: "Contact Information",
      icon: <FaPhone className="me-2" />,
      fields: [
        { label: "Nationality", name: "nationality", icon: <FaGlobe size={14} className="me-2" /> },
        { label: "Marital Status", name: "maritalStatus", icon: <FaUser size={14} className="me-2" /> },
      ],
    },
  ];

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-3">Loading personal details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger mx-3 my-4">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        {error}
      </div>
    );
  }

  return (
 <div >
      <PopupConfirmation
        show={!!message.text}
        message={message.text}
        type={message.type}
        onClose={() => setMessage({ text: "", type: "" })}
      />      
             
               
                <div className="d-flex flex-wrap gap-2 mb-3">
               
                  {formData.bloodGroup && (
                    <Badge bg="danger" className="fs-6">
                      Blood Group: {formData.bloodGroup}
                    </Badge>
                  )}
                  {formData.maritalStatus && (
                    <Badge bg="success" className="fs-6">
                      {formData.maritalStatus}
                    </Badge>
                  )}
                </div>
                {formData.dob && (
                  <p className="text-muted mb-2">
                    <i className="bi bi-calendar me-2"></i>
                    <span className="fw-semibold">Date of Birth:</span>{" "}
                    {new Date(formData.dob).toLocaleDateString()}
                  </p>
                )}
       
      
      

          {/* Details Sections */}
          {fieldGroups.map((group, groupIndex) => (
            <Card key={groupIndex} className="mb-4 border-0 shadow-sm">
              <Card.Header className="bg-light">
                <h5 className="mb-0 fw-semibold">
                  {group.icon}
                  {group.title}
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  {group.fields.map((field, fieldIndex) => (
                    <Col md={6} key={fieldIndex} >
                      <div className="d-flex align-items-start">
                        <div className="me-3 mt-1 text-primary">
                          {field.icon}
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="fw-semibold mb-1">{field.label}</h6>
                          <div className="p-2 bg-light rounded">
                            {formData[field.name] ? (
                              field.name.toLowerCase().includes("card") ||
                              field.name.toLowerCase().includes("image") ||
                              field.name.toLowerCase().includes("passport") ? (
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => openPreview(formData[field.name])}
                                  className="d-flex align-items-center"
                                >
                                  <FaEye className="me-1" />
                                  View Document
                                </Button>
                              ) : (
                                <span className="text-dark">{formData[field.name]}</span>
                              )
                            ) : (
                              <span className="text-muted">Not provided</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          ))}
       
    

      {/* Document Preview Modal */}
      {previewFile && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={closePreview}
        >
          <div
            className="modal-dialog modal-xl modal-dialog-centered"
            role="document"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h4 className="modal-title">
                  <FaEye className="me-2" />
                  Document Preview
                </h4>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  aria-label="Close"
                  onClick={closePreview}
                ></button>
              </div>
              <div className="modal-body text-center p-0">
                {previewFile.endsWith(".pdf") ? (
                  <iframe
                    src={previewFile}
                    width="100%"
                    height="600px"
                    title="Preview"
                    style={{ border: "none" }}
                  ></iframe>
                ) : (
                  <img
                    src={previewFile}
                    alt="Preview"
                    className="img-fluid"
                    style={{ maxHeight: "80vh" }}
                  />
                )}
              </div>
              <div className="modal-footer">
                <Button variant="secondary" onClick={closePreview}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewPersonalDetails;