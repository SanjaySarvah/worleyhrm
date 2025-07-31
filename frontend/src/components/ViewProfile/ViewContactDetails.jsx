import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../assets/css/EmployeeProfileUpdate.css";
import PopupConfirmation from "../Modal/PopupConfirmation";

const ViewContactDetails = () => {
  const [formData, setFormData] = useState({
    phoneNumber: "",
    email: "",
    presentAddress: "",
    permanentAddress: "",
    alternateContactNumber: "",
    emergencyContact: {
      name: "",
      relationship: "",
      phone: "",
    },
  });
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const id = user?.formId;
    if (id) fetchContactDetails(id);
  }, []);

  const fetchContactDetails = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/forms/${id}`);
      const contact = res.data?.data?.contactDetails || {};
      setFormData({
        phoneNumber: contact.phoneNumber || "",
        email: contact.email || "",
        presentAddress: contact.presentAddress || "",
        permanentAddress: contact.permanentAddress || "",
        alternateContactNumber: contact.alternateContactNumber || "",
        emergencyContact: {
          name: contact.emergencyContact?.name || "",
          relationship: contact.emergencyContact?.relationship || "",
          phone: contact.emergencyContact?.phone || "",
        },
      });
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <PopupConfirmation
        show={!!message.text}
        message={message.text}
        type={message.type}
        onClose={() => setMessage({ text: "", type: "" })}
      />

      <div className="card shadow-sm border-0">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">
            <i className="bi bi-person-lines-fill me-2"></i>Contact Details
          </h5>
        </div>

        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Email</label>
              <div className="form-control bg-light">{formData.email || "-"}</div>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Phone Number</label>
              <div className="form-control bg-light">{formData.phoneNumber || "-"}</div>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Alternate Contact</label>
              <div className="form-control bg-light">
                {formData.alternateContactNumber || "-"}
              </div>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Present Address</label>
              <div className="form-control bg-light">{formData.presentAddress || "-"}</div>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Permanent Address</label>
              <div className="form-control bg-light">{formData.permanentAddress || "-"}</div>
            </div>
          </div>

          <hr className="my-4" />
          {/* <h5 className="mb-3 fw-bold">
            <i className="bi bi-telephone-forward me-2"></i>Emergency Contact
          </h5> */}
          <div className="card-header bg-primary text-white">
          <h5 className="mb-0">
            <i className="bi bi-telephone-forward me-2"></i>Emergency Contact
          </h5>
        </div>

          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold">Name</label>
              <div className="form-control bg-light">{formData.emergencyContact.name || "-"}</div>
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">Relationship</label>
              <div className="form-control bg-light">
                {formData.emergencyContact.relationship || "-"}
              </div>
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">Phone</label>
              <div className="form-control bg-light">
                {formData.emergencyContact.phone || "-"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewContactDetails;
