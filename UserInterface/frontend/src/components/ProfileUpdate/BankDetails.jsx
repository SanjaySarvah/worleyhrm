import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Form, Button, Alert, Spinner } from "react-bootstrap";

const BankDetails = () => {
  const [formId, setFormId] = useState(null);
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "",
    ifscCode: "",
    bankPassbook: null,
  });
  const [originalDetails, setOriginalDetails] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
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

      setOriginalDetails({
        accountNumber: bank.accountNumber || "",
        ifscCode: bank.ifscCode || "",
        bankPassbook: bank.bankPassbook || null,
      });
    } catch (error) {
      setMessage("❌ Failed to load bank details.");
      console.error(error);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "bankPassbook") {
      setBankDetails((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setBankDetails((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = async () => {
    if (!bankDetails.accountNumber || !bankDetails.ifscCode) {
      setMessage("⚠️ Please fill in all required fields.");
      return;
    }

    const form = new FormData();
    form.append("accountNumber", bankDetails.accountNumber);
    form.append("ifscCode", bankDetails.ifscCode);
    if (bankDetails.bankPassbook instanceof File) {
      form.append("bankPassbook", bankDetails.bankPassbook);
    }

    setLoading(true);
    try {
      await axios.patch(
        `http://localhost:5000/api/forms/${formId}/bank`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setMessage("✅ Bank details updated successfully!");
      setIsEditing(false);
      fetchBankDetails(formId);
    } catch (err) {
      setMessage("❌ Failed to update bank details.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setBankDetails(originalDetails);
    setIsEditing(false);
    setMessage("");
  };

  return (
    <Card className="p-4 m-4 shadow">
      <h4 className="mb-3">🏦 Bank Details</h4>
      {message && <Alert variant="info">{message}</Alert>}

      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Account Number</Form.Label>
          <Form.Control
            type="text"
            name="accountNumber"
            value={bankDetails.accountNumber}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>IFSC Code</Form.Label>
          <Form.Control
            type="text"
            name="ifscCode"
            value={bankDetails.ifscCode}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Bank Passbook (PDF/Image)</Form.Label>
          <Form.Control
            type="file"
            name="bankPassbook"
            onChange={handleChange}
            disabled={!isEditing}
          />
          {!isEditing && bankDetails.bankPassbook && typeof bankDetails.bankPassbook === "string" && (
            <div className="mt-2">
              <a
                href={`http://localhost:5000/uploads/${bankDetails.bankPassbook}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Existing File
              </a>
            </div>
          )}
        </Form.Group>

        {!isEditing ? (
          <Button variant="primary" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        ) : (
          <>
            <Button
              variant="success"
              className="me-2"
              onClick={handleUpdate}
              disabled={loading}
            >
              {loading ? <Spinner size="sm" animation="border" /> : "Save"}
            </Button>
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          </>
        )}
      </Form>
    </Card>
  );
};

export default BankDetails;
