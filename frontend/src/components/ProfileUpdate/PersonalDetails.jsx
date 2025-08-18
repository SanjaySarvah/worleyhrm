import React, { useEffect, useState } from "react";
import axios from "axios";
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

  if (error) return <p className="text-red-600 p-4">{error}</p>;

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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800">Personal Details</h3>
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

      {/* Field Groups */}
      {fieldGroups.map((group, idx) => (
        <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          {/* Group Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {group.icon === "bi-person" ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  )}
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-800">{group.title}</h4>
            </div>
          </div>

          {/* Group Fields */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {group.fields.map(({ label, name, type = "text" }) => (
                <div key={name} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  {isEditing ? (
                    name.toLowerCase().includes("card") ||
                    name.toLowerCase().includes("image") ||
                    name.toLowerCase().includes("passport") ? (
                      <div className="relative">
                        <input
                          type="file"
                          name={name}
                          accept="image/*,.pdf"
                          onChange={handleChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    ) : (
                      <input
                        type={type}
                        name={name}
                        value={formData[name] || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      />
                    )
                  ) : (
                    <div className="min-h-[40px] flex items-center">
                      {formData[name] ? (
                        name.toLowerCase().includes("card") ||
                        name.toLowerCase().includes("image") ||
                        name.toLowerCase().includes("passport") ? (
                          <button
                            onClick={() => openPreview(formData[name])}
                            className="inline-flex items-center px-3 py-1 border border-blue-200 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Preview
                          </button>
                        ) : (
                          <span className="text-gray-800">{formData[name]}</span>
                        )
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex justify-end space-x-3 mt-6">
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

      {/* Document Preview Modal */}
      {previewFile && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={closePreview}
        >
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Document Preview</h3>
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                        onClick={closePreview}
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-2">
                      {previewFile.endsWith(".pdf") ? (
                        <iframe
                          src={previewFile}
                          width="100%"
                          height="600px"
                          title="Preview"
                          className="border-0"
                        ></iframe>
                      ) : (
                        <img
                          src={previewFile}
                          alt="Preview"
                          className="mx-auto max-h-[600px]"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalDetails;