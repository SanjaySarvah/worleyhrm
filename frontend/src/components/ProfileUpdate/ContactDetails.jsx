import React, { useEffect, useState } from "react";
import axios from "axios";
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
    <div className="container mx-auto py-6 px-4">
      <PopupConfirmation
        show={!!message.text}
        message={message.text}
        type={message.type}
        onClose={() => setMessage({ text: "", type: "" })}
      />

      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div className="bg-blue-100 p-3 rounded-lg mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800">Contact Details</h3>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-200 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Edit Details
          </button>
        )}
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                className={`w-full px-4 py-2 border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'border-gray-200 bg-gray-50'} rounded-lg transition`}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                className={`w-full px-4 py-2 border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'border-gray-200 bg-gray-50'} rounded-lg transition`}
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            {/* Alternate Contact Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Contact Number</label>
              <input
                className={`w-full px-4 py-2 border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'border-gray-200 bg-gray-50'} rounded-lg transition`}
                type="text"
                name="alternateContactNumber"
                value={formData.alternateContactNumber}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            {/* Present Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Present Address</label>
              <input
                className={`w-full px-4 py-2 border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'border-gray-200 bg-gray-50'} rounded-lg transition`}
                type="text"
                name="presentAddress"
                value={formData.presentAddress}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            {/* Permanent Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Permanent Address</label>
              <input
                className={`w-full px-4 py-2 border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'border-gray-200 bg-gray-50'} rounded-lg transition`}
                type="text"
                name="permanentAddress"
                value={formData.permanentAddress}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div className="mt-8">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-2 rounded-lg mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-800">Emergency Contact</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Emergency Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  className={`w-full px-4 py-2 border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'border-gray-200 bg-gray-50'} rounded-lg transition`}
                  type="text"
                  name="emergencyContact.name"
                  value={formData.emergencyContact.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              {/* Relationship */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                <input
                  className={`w-full px-4 py-2 border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'border-gray-200 bg-gray-50'} rounded-lg transition`}
                  type="text"
                  name="emergencyContact.relationship"
                  value={formData.emergencyContact.relationship}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              {/* Emergency Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  className={`w-full px-4 py-2 border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'border-gray-200 bg-gray-50'} rounded-lg transition`}
                  type="text"
                  name="emergencyContact.phone"
                  value={formData.emergencyContact.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Action Buttons */}
        {isEditing && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={handleUpdate}
              className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white font-medium py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-200 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Save Changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-medium py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-200 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactDetails;