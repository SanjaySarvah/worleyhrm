import React, { useEffect, useState } from "react";
import axios from "axios";

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
  const [message, setMessage] = useState({ text: "", type: "" });

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
      setMessage({ text: "Failed to load bank details", type: "error" });
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
      setMessage({ text: "Please fill in all required fields", type: "warning" });
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
      setMessage({ text: "Bank details updated successfully!", type: "success" });
      setIsEditing(false);
      fetchBankDetails(formId);
    } catch (err) {
      setMessage({ text: "Failed to update bank details", type: "error" });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setBankDetails(originalDetails);
    setIsEditing(false);
    setMessage({ text: "", type: "" });
  };

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div className="bg-blue-100 p-3 rounded-lg mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800">Bank Details</h3>
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

      {/* Message Alert */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === "success" ? "bg-green-50 text-green-800" :
          message.type === "error" ? "bg-red-50 text-red-800" :
          "bg-yellow-50 text-yellow-800"
        }`}>
          <div className="flex items-center">
            {message.type === "success" ? (
              <svg className="h-5 w-5 mr-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : message.type === "error" ? (
              <svg className="h-5 w-5 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <svg className="h-5 w-5 mr-3 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form>
          {/* Account Number */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
            <input
              type="text"
              name="accountNumber"
              value={bankDetails.accountNumber}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'border-gray-200 bg-gray-50'} rounded-lg transition`}
            />
          </div>

          {/* IFSC Code */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
            <input
              type="text"
              name="ifscCode"
              value={bankDetails.ifscCode}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500' : 'border-gray-200 bg-gray-50'} rounded-lg transition`}
            />
          </div>

          {/* Bank Passbook */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Passbook (PDF/Image)</label>
            {isEditing ? (
              <div className="relative">
                <input
                  type="file"
                  name="bankPassbook"
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            ) : (
              bankDetails.bankPassbook && typeof bankDetails.bankPassbook === "string" && (
                <div className="mt-2">
                  <a
                    href={`http://localhost:5000/uploads/${bankDetails.bankPassbook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 border border-blue-200 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Existing File
                  </a>
                </div>
              )
            )}
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white font-medium py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-200 flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-medium py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-200 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default BankDetails;