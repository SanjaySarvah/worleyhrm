import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Card, Row, Col, Form } from "react-bootstrap";
import PopupConfirmation from "../Modal/PopupConfirmation";

const ViewPersonalDetails = () => {
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

  // const handleUpdate = async () => {
  //   if (!formId) return;

  //   const form = new FormData();
  //   for (const key in formData) {
  //     if (formData[key]) {
  //       form.append(key, formData[key]);
  //     }
  //   }

  //   try {
  //     await axios.patch(`http://localhost:5000/api/forms/${formId}/personal`, form, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //     });
  //     setMessage({ text: "Profile Details Updated successfully!", type: "success" });
  //     setIsEditing(false);
  //     setRefreshKey((prev) => prev + 1);
  //   } catch (err) {
  //     console.error(err);
  //     setMessage({ text: "Update failed.", type: "danger" });
  //   }
  // };

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
    // {
    //   title: "Documents Upload",
    //   icon: "bi-upload",
    //   fields: [
    //     { label: "Profile Image", name: "profileImage" },
    //     { label: "Aadhaar Card", name: "aadhaarCard" },
    //     { label: "PAN Card", name: "panCard" },
    //     { label: "Passport", name: "passport" },
    //   ],
    // },
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
  
      <Card className="shadow-sm border-0">
        {/* Card Header */}
        <div className="card-header bg-primary text-white">
          <h5 className="fw-bold mb-0">
            <i className="bi bi-person-lines-fill me-2"></i> Profile Details
          </h5>
        </div>
  
        {/* Card Body */}
        <Card.Body className="p-4">
          {/* Section 1: First 3 rows and Profile Image */}
          <Row>
            {/* Left: First 3 rows */}
            <Col lg={12} xs={12}>
              <Form>
                {fieldGroups.slice(0, 3).map((group, idx) => (
                  <Row className="mb-4" key={idx}>
                    {group.fields.map(({ label, name }) => (
                      <Col md={4} xs={12} className="mb-3" key={name}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">{label}</Form.Label>
                          <div className="form-control bg-light border">
                            {formData[name] ? (
                              name.toLowerCase().includes("card") ||
                              name.toLowerCase().includes("image") ||
                              name.toLowerCase().includes("passport") ? (
                                <Button
                                  variant="primary"
                                  size="md"
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
                        </Form.Group>
                      </Col>
                    ))}
                  </Row>
                ))}
              </Form>
            </Col>
  
            {/* Right: Profile Image + Name/Role */}
            {/* <Col lg={3} xs={12} className="text-center mt-4 mt-lg-0">
              {formData.profileImage ? (
                <>
                  <img
                    src={`http://localhost:5000/uploads/${formData.profileImage}`}
                    alt="Profile"
                    className="rounded-circle border"
                    style={{
                      width: 150,
                      height: 150,
                      objectFit: "cover",
                      border: "4px solid #dee2e6",
                    }}
                  />
                  {formData.name && (
                    <p className="mt-3 fw-semibold mb-1">Name: {formData.name}</p>
                  )}
                  {formData.role && (
                    <p className="fw-semibold">Role: {formData.role}</p>
                  )}
                </>
              ) : (
                <div className="text-muted mt-4">No profile image uploaded</div>
              )}
            </Col> */}
          </Row>
  
          {/* Section 2: Remaining Form Fields with bordered layout */}
          <div className="mt-5">
            {fieldGroups.slice(3).map((group, idx) => (
              <Row className="mb-4" key={idx}>
                {group.fields.map(({ label, name }) => (
                  <Col md={6} xs={12} className="mb-3" key={name}>
                    <div className="border p-3 rounded bg-light h-100">
                      <strong className="d-block mb-2">{label}</strong>
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
                  </Col>
                ))}
              </Row>
            ))}
          </div>
        </Card.Body>
      </Card>
  
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

export default ViewPersonalDetails;