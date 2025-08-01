import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../assets/css/EmployeeProfileUpdate.css";
import PopupConfirmation from "../Modal/PopupConfirmation";

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
  const [message, setMessage] = useState({ text: "", type: "" });

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
      setMessage({ text: "Contact details updated successfully!", type: "success" });
      setIsEditing(false);
      fetchContactDetails(formId);
    } catch (err) {
      console.error("Update error:", err);
      setMessage({ text: "Update failed.", type: "danger" });
    }
  };

  return (
    <div className="container mt-4">
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
        <h5 className="fw-bold"><i className="bi bi-person-lines-fill me-2"></i> Contact Details</h5>
        {/* {!isEditing && (
          <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
            <i className="bi bi-pencil-square me-1"></i> Edit Details
          </button>
        )} */}
      </div>

      <div className="card shadow-sm border-0">
        {/* <div className="card-header d-flex justify-content-between align-items-center bg-primary text-white">
          <h5 className="mb-0">
            <i className="bi bi-person-lines-fill me-2"></i>Contact Details
          </h5>
          {!isEditing && (
            <button className="btn btn-light btn-sm" onClick={() => setIsEditing(true)}>
              <i className="bi bi-pencil-square me-1"></i> Edit
            </button>
          )}
        </div> */}

        <div className="card-body">
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



            <div className="d-flex justify-content-between align-items-center bg-primary text-white rounded mb-4 p-2">
              <h5 className="fw-bold">
                <i className="bi bi-telephone-forward me-2"></i>Emergency Contact
              </h5>
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
        </div>

        {isEditing && (
          <div className="card-footer d-flex justify-content-end bg-light">
            <button className="btn btn-success me-2" onClick={handleUpdate}>
              <i className="bi bi-save me-1"></i> Save
            </button>
            <button className="btn btn-danger" onClick={() => setIsEditing(false)}>
              <i className="bi bi-x-circle me-1"></i> Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactDetails;
