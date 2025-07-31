import React, { useEffect, useState } from "react";
import axios from "axios";

const ContactDetails = () => {
  const [formId, setFormId] = useState(null);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    email: "",
    presentAddress: "",
    permanentAddress: "",
    alternateContactNumber: "",
    emergencyContact: {
      name: "",
      relationship: "",
      phone: ""
    }
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const id = user?.formId;
    if (id) {
      setFormId(id);
      fetchContactDetails(id);
    }
  }, []);

  const fetchContactDetails = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/forms/${id}`);
      const contactDetails = res.data?.data?.contactDetails || {};
      setFormData({
        phoneNumber: contactDetails.phoneNumber || "",
        email: contactDetails.email || "",
        presentAddress: contactDetails.presentAddress || "",
        permanentAddress: contactDetails.permanentAddress || "",
        alternateContactNumber: contactDetails.alternateContactNumber || "",
        emergencyContact: {
          name: contactDetails.emergencyContact?.name || "",
          relationship: contactDetails.emergencyContact?.relationship || "",
          phone: contactDetails.emergencyContact?.phone || ""
        }
      });
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("emergencyContact.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        emergencyContact: { ...prev.emergencyContact, [key]: value }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.patch(
        `http://localhost:5000/api/forms/${formId}/contact`,
        formData
      );
      alert("Contact details updated successfully!");
      setIsEditing(false);
      fetchContactDetails(formId);
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update contact details");
    }
  };

  return (
    <div className="container mt-4">
      <h4 className="mb-3">📞 Contact Details</h4>
      <div className="row">
        <div className="col-md-6 mb-3">
          <label>Email</label>
          <input
            className="form-control"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>

        <div className="col-md-6 mb-3">
          <label>Phone Number</label>
          <input
            className="form-control"
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>

        <div className="col-md-6 mb-3">
          <label>Alternate Contact Number</label>
          <input
            className="form-control"
            type="text"
            name="alternateContactNumber"
            value={formData.alternateContactNumber}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>

        <div className="col-md-6 mb-3">
          <label>Present Address</label>
          <input
            className="form-control"
            type="text"
            name="presentAddress"
            value={formData.presentAddress}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>

        <div className="col-md-6 mb-3">
          <label>Permanent Address</label>
          <input
            className="form-control"
            type="text"
            name="permanentAddress"
            value={formData.permanentAddress}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>

        <div className="col-md-12 mt-4">
          <h5>🚨 Emergency Contact</h5>
        </div>

        <div className="col-md-4 mb-3">
          <label>Name</label>
          <input
            className="form-control"
            type="text"
            name="emergencyContact.name"
            value={formData.emergencyContact.name}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>

        <div className="col-md-4 mb-3">
          <label>Relationship</label>
          <input
            className="form-control"
            type="text"
            name="emergencyContact.relationship"
            value={formData.emergencyContact.relationship}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>

        <div className="col-md-4 mb-3">
          <label>Phone</label>
          <input
            className="form-control"
            type="text"
            name="emergencyContact.phone"
            value={formData.emergencyContact.phone}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>
      </div>

      {!isEditing ? (
        <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
          Edit
        </button>
      ) : (
        <div className="mt-3">
          <button className="btn btn-success me-2" onClick={handleUpdate}>
            Save
          </button>
          <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default ContactDetails;
