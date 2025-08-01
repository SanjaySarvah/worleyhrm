import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Card, Row, Col, Form, Spinner } from "react-bootstrap";
import PopupConfirmation from "../Modal/PopupConfirmation";

const ViewDocuments = () => {
  const [formData, setFormData] = useState({});
  const [formId, setFormId] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const id = user?.formId;

    if (!id) {
      setError("Form ID not found in localStorage");
      setLoading(false);
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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openPreview = (fileName) => {
    setPreviewFile(`http://localhost:5000/uploads/${fileName}`);
  };

  const closePreview = () => setPreviewFile(null);

  const documents = [
    { label: "Profile Image", name: "profileImage" },
    { label: "Aadhaar Card", name: "aadhaarCard" },
    { label: "PAN Card", name: "panCard" },
    { label: "Passport", name: "passport" },
  ];

  return (
    <div className="container mt-4 mb-5">
      <PopupConfirmation
        show={!!message.text}
        message={message.text}
        type={message.type}
        onClose={() => setMessage({ text: "", type: "" })}
      />

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : (
        <Card className="shadow-sm border-0">
          <Card.Header className="bg-primary text-white d-flex align-items-center">
            <i className="bi bi-folder2-open me-2"></i>
            <h5 className="mb-0 fw-bold">Uploaded Documents</h5>
          </Card.Header>

          <Card.Body className="p-4">
            <Row>
              {documents.map(({ label, name }) => {
                const fileName = formData[name];
                const isUploaded = !!fileName;

                return (
                  <Col md={6} className="mb-4" key={name}>
                    <Card className="border-light shadow-sm h-100">
                      <Card.Body>
                        <h6 className="fw-semibold">{label}</h6>
                        <div className="mt-2">
                          {isUploaded ? (
                            <Button
                              variant="outline-primary"
                              onClick={() => openPreview(fileName)}
                            >
                              <i className="bi bi-eye me-1"></i> Preview
                            </Button>
                          ) : (
                            <span className="text-muted">Not uploaded</span>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Preview Modal */}
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
                <h5 className="modal-title">Document Preview</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closePreview}
                ></button>
              </div>
              <div className="modal-body text-center">
                {previewFile.endsWith(".pdf") ? (
                  <iframe
                    src={previewFile}
                    width="100%"
                    height="600px"
                    title="PDF Preview"
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

export default ViewDocuments;
