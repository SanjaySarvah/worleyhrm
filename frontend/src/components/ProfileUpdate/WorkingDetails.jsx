import React, { useEffect, useState } from "react";
import axios from "axios";

const WorkingDetails = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const formId = user?.formId;
  const API_URL = `http://localhost:5000/api/forms/${formId}`;

  const [pfNumber, setPfNumber] = useState("");
  const [esiNumber, setEsiNumber] = useState("");
  const [experiences, setExperiences] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const [newExp, setNewExp] = useState({
    company: "",
    designation: "",
    from: "",
    to: "",
    experienceLetter: null,
    relievingLetter: null,
    payslip: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(API_URL);
        const working = res.data?.data?.workingDetails || {};
        setPfNumber(working.pfNumber || "");
        setEsiNumber(working.esiNumber || "");
        setExperiences(working.experiences || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [formId]);

  const handlePfEsiUpdate = async () => {
    try {
      await axios.patch(`${API_URL}/working`, { pfNumber, esiNumber });
      alert("PF/ESI Numbers updated!");
    } catch (err) {
      console.error(err);
      alert("Error updating PF/ESI");
    }
  };

  const handleExperienceChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setNewExp({ ...newExp, [name]: files[0] });
    } else {
      setNewExp({ ...newExp, [name]: value });
    }
  };

  const handleAddExperience = async () => {
    if (!pfNumber.trim() || !esiNumber.trim()) {
      alert("Please update PF and ESI numbers before adding experience.");
      return;
    }

    const formData = new FormData();
    Object.entries(newExp).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    try {
      await axios.post(`${API_URL}/working/experiences`, formData);
      alert("Experience added!");
      setNewExp({
        company: "",
        designation: "",
        from: "",
        to: "",
        experienceLetter: null,
        relievingLetter: null,
        payslip: null,
      });
      document.getElementById("closeAddExpModal").click();
      const res = await axios.get(API_URL);
      setExperiences(res.data?.data?.workingDetails?.experiences || []);
    } catch (err) {
      console.error("Error adding experience:", err);
      alert("Failed to add experience.");
    }
  };

  const handleEditExperienceChange = (index, field, value) => {
    const updated = [...experiences];
    updated[index][field] = value;
    setExperiences(updated);
  };

  const handleEditFileChange = (index, field, file) => {
    const updated = [...experiences];
    updated[index][field] = file;
    setExperiences(updated);
  };

  const handleUpdateExperience = async (index) => {
    const exp = experiences[index];
    const formData = new FormData();
    for (const key in exp) {
      if (exp[key]) formData.append(key, exp[key]);
    }

    try {
      await axios.put(`${API_URL}/working/experiences/${exp._id}`, formData);
      alert("Experience updated!");
      setEditIndex(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update experience");
    }
  };

  const getFilePreview = (filePath) => {
    if (!filePath) return null;
    const url = `http://localhost:5000/uploads/${filePath.replace(/\\/g, "/")}`;
    const filename = filePath.split(/[\\/]/).pop();
    const isPDF = url.endsWith(".pdf");
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 no-underline text-gray-800 hover:text-blue-600"
      >
        📄{" "}
        <span className="truncate max-w-[120px]">
          {filename}
        </span>
      </a>
    );
  };

  return (
    <div className="container mx-auto py-6 px-4">
      {/* PF/ESI Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">PF / ESI Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">PF Number</label>
            <input
              type="text"
              value={pfNumber}
              onChange={(e) => setPfNumber(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
          <div className="md:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">ESI Number</label>
            <input
              type="text"
              value={esiNumber}
              onChange={(e) => setEsiNumber(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
          <div className="md:col-span-4 flex items-end">
            <button
              className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-200"
              onClick={handlePfEsiUpdate}
            >
              Update Details
            </button>
          </div>
        </div>
      </div>

      {/* Experience Section Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div className="bg-blue-100 p-2 rounded-lg mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800">Previous Experiences</h3>
        </div>
        <button
          className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-200 flex items-center"
          data-bs-toggle="modal"
          data-bs-target="#addExperienceModal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
          Add Experience
        </button>
      </div>

      {/* Experience List */}
      {experiences.length === 0 ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                No experience records found.
              </p>
            </div>
          </div>
        </div>
      ) : (
        experiences.map((exp, i) => (
          <div
            key={exp._id}
            className="bg-white rounded-xl shadow-sm p-6 mb-4 border border-gray-100 relative hover:shadow-md transition duration-200"
          >
            {editIndex === i ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                  <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <input
                      value={exp.company}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      onChange={(e) =>
                        handleEditExperienceChange(i, "company", e.target.value)
                      }
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                    <input
                      value={exp.designation}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      onChange={(e) =>
                        handleEditExperienceChange(
                          i,
                          "designation",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                    <input
                      type="date"
                      value={exp.from?.slice(0, 10)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      onChange={(e) =>
                        handleEditExperienceChange(i, "from", e.target.value)
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                    <input
                      type="date"
                      value={exp.to?.slice(0, 10)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      onChange={(e) =>
                        handleEditExperienceChange(i, "to", e.target.value)
                      }
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience Letter</label>
                    <input
                      type="file"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      onChange={(e) =>
                        handleEditFileChange(
                          i,
                          "experienceLetter",
                          e.target.files[0]
                        )
                      }
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Relieving Letter</label>
                    <input
                      type="file"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      onChange={(e) =>
                        handleEditFileChange(
                          i,
                          "relievingLetter",
                          e.target.files[0]
                        )
                      }
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payslip</label>
                    <input
                      type="file"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      onChange={(e) =>
                        handleEditFileChange(i, "payslip", e.target.files[0])
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-200 flex items-center"
                    onClick={() => handleUpdateExperience(i)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Save
                  </button>
                  <button
                    className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-200 flex items-center"
                    onClick={() => setEditIndex(null)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      {exp.company} - {exp.designation}
                    </h4>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">From:</span>{" "}
                      {new Date(exp.from).toLocaleDateString()} |{" "}
                      <span className="font-medium">To:</span>{" "}
                      {new Date(exp.to).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-2 rounded-full"
                    onClick={() => setEditIndex(i)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                </div>

                <div className="flex flex-wrap gap-3 mb-4">
                  {typeof exp.experienceLetter === "string" && (
                    <a
                      href={`http://localhost:5000/uploads/${exp.experienceLetter.replace(
                        /\\/g,
                        "/"
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 border border-blue-200 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      Experience Letter
                    </a>
                  )}
                  {typeof exp.relievingLetter === "string" && (
                    <a
                      href={`http://localhost:5000/uploads/${exp.relievingLetter.replace(
                        /\\/g,
                        "/"
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 border border-blue-200 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      Relieving Letter
                    </a>
                  )}

                  {typeof exp.payslip === "string" && (
                    <a
                      href={`http://localhost:5000/uploads/${exp.payslip.replace(
                        /\\/g,
                        "/"
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 border border-blue-200 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      Payslip
                    </a>
                  )}
                </div>
              </>
            )}
          </div>
        ))
      )}

      {/* Add Experience Modal */}
      <div className="modal fade" id="addExperienceModal" tabIndex="-1">
        <div className="modal-dialog modal-xl">
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-lg">
              <h5 className="modal-title font-semibold">Add New Experience</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                id="closeAddExpModal"
              ></button>
            </div>

            <div className="modal-body p-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={newExp.company}
                    onChange={handleExperienceChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Company"
                    required
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Designation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="designation"
                    value={newExp.designation}
                    onChange={handleExperienceChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Designation"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="from"
                    value={newExp.from}
                    onChange={handleExperienceChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="to"
                    value={newExp.to}
                    onChange={handleExperienceChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience Letter <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    name="experienceLetter"
                    onChange={handleExperienceChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relieving Letter</label>
                  <input
                    type="file"
                    name="relievingLetter"
                    onChange={handleExperienceChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payslip</label>
                  <input
                    type="file"
                    name="payslip"
                    onChange={handleExperienceChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer bg-gray-50 px-6 py-4 rounded-b-lg">
              <button
                className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-medium py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-200"
                onClick={handleAddExperience}
              >
                Save Experience
              </button>
              <button
                type="button"
                className="ml-3 bg-white border border-gray-300 text-gray-700 font-medium py-2 px-6 rounded-lg shadow-sm hover:bg-gray-50 transition"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkingDetails;