import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Form, Alert } from "react-bootstrap";

const ViewBankDetails = () => {
  const [formId, setFormId] = useState(null);
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "",
    ifscCode: "",
    bankPassbook: null,
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const id = user?.formId;
    setFormId(id);

    if (id) {
      fetchBankDetails(id);
    }
  }, []);

  const fetchBankDetails = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/forms/${id}`);
      const bank = res.data?.data?.bankDetails || {};

      setBankDetails({
        accountNumber: bank.accountNumber || "",
        ifscCode: bank.ifscCode || "",
        bankPassbook: bank.bankPassbook || null,
      });
    } catch (error) {
      setMessage("❌ Failed to load bank details.");
      console.error(error);
    }
  };

  return (
    <>
      <Card className="p-4 m-4 shadow">
        {/* Heading */}
        <div className="card-header bg-primary text-white rounded mb-4">
          <h5 className="mb-0">
            <i className="bi bi-bank me-2"></i> Bank Details
          </h5>
        </div>

        {message && <Alert variant="info">{message}</Alert>}

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Account Number</Form.Label>
            <Form.Control
              type="text"
              name="accountNumber"
              value={bankDetails.accountNumber}
              readOnly
              className="bg-light"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>IFSC Code</Form.Label>
            <Form.Control
              type="text"
              name="ifscCode"
              value={bankDetails.ifscCode}
              readOnly
              className="bg-light"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Bank Passbook</Form.Label>
            {bankDetails.bankPassbook && typeof bankDetails.bankPassbook === "string" ? (
              <div className="mt-2">
                <a
                  href={`http://localhost:5000/uploads/${bankDetails.bankPassbook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary btn-sm"
                >
                  <i className="bi bi-file-earmark-text me-1"></i> View Bank Passbook
                </a>
              </div>
            ) : (
              <p className="text-muted">No file uploaded</p>
            )}
          </Form.Group>
        </Form>
      </Card>
    </>
  );
};

export default ViewBankDetails;
