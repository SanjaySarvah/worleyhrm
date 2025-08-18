import React, { useState, useEffect } from "react";
import ViewPersonalDetails from "../components/ViewProfile/ViewPersonalDetails";
import ViewContactDetails from "../components/ViewProfile/ViewContactDetails";
import ViewWorkingDetails from "../components/ViewProfile/ViewWorkingDetails";
import ViewBankDetails from "../components/ViewProfile/ViewBankDetails";
import ViewDocuments from "../components/ViewProfile/ViewDocuments";
import { FaEdit, FaUser, FaPhone, FaBriefcase, FaLandmark, FaFileAlt, FaCamera } from "react-icons/fa";
import { useNavigate } from "react-router-dom";


const FALLBACK_AVATAR = "https://cdn-icons-png.flaticon.com/512/847/847969.png";

const ProfileAvatar = ({ onImageUpdate }) => {
  const [formId, setFormId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [userInfo, setUserInfo] = useState({ name: "", id: "", role: "" });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.formId) setFormId(user.formId);
        setUserInfo({
          name: user.name || "-",
          id: user.id || "-",
          role: user.role || "-",
        });
      } catch (err) {
        console.error("Invalid user data in localStorage", err);
      }
    }
  }, []);

  const fetchImage = () => {
    if (formId) {
      setPreviewUrl(
        `${import.meta.env.VITE_API_URL}/forms/profile-image/${formId}?t=${Date.now()}`
      );
    }
  };

  useEffect(() => {
    if (formId) fetchImage();
  }, [formId]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !formId) return;

    // Validate file type and size
    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      alert('Image size should be less than 2MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/forms/profile-image/${formId}`, {
        method: "PATCH",
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      fetchImage();
      if (onImageUpdate) onImageUpdate();
    } catch (err) {
      console.error("Upload failed", err);
      alert('Failed to update profile image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
<div className="flex flex-col items-center relative group">
<div className="relative w-40 h-40 mb-4 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white group">
  <img src={previewUrl || FALLBACK_AVATAR}
    alt="Profile"
    className="w-full h-full object-cover"
    onError={(e) => (e.target.src = FALLBACK_AVATAR)} />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => fileInputRef.current.click()}
            disabled={isUploading}
            className="flex flex-col items-center justify-center text-white cursor-pointer"
          >
            {isUploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            ) : (
              <>
                <FaCamera className="text-2xl mb-1" />
                <span className="text-sm">Change Photo</span>
              </>
            )}
          </button>
        </div>
      </div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 w-full text-center">
        <h3 className="font-semibold text-gray-800 text-xl mb-2">{userInfo.name}</h3>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Employee ID:</span>{' '}
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md text-xs">
              {userInfo.id}
            </span>
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Role:</span>{' '}
            <span className="text-gray-800 capitalize">{userInfo.role.toLowerCase()}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

const tabs = [
  { id: "tab1", label: "Personal Details", icon: <FaUser className="mr-2" />, content: <ViewPersonalDetails /> },
  { id: "tab2", label: "Contact Details", icon: <FaPhone className="mr-2" />, content: <ViewContactDetails /> },
  { id: "tab3", label: "Working Details", icon: <FaBriefcase className="mr-2" />, content: <ViewWorkingDetails /> },
  { id: "tab4", label: "Bank Details", icon: <FaLandmark className="mr-2" />, content: <ViewBankDetails /> },
  { id: "tab5", label: "Documents", icon: <FaFileAlt className="mr-2" />, content: <ViewDocuments /> },
];

const ViewProfile = () => {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [rolePath, setRolePath] = useState("/profileupdate");
  const [imageUpdated, setImageUpdated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData?.role) {
      const role = userData.role.toLowerCase();
      if (["admin", "hr", "staff"].includes(role)) {
        setRolePath(`/${role}/profile-update`);
      }
    }
  }, []);

  const handleImageUpdate = () => {
    setImageUpdated(prev => !prev); // Trigger re-render if needed
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Profile Card */}
        <div className="w-full lg:w-1/3 xl:w-1/4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
            <ProfileAvatar onImageUpdate={handleImageUpdate} />
          </div>
        </div>

        {/* Right Column - Content */}
        <div className="w-full lg:w-2/3 xl:w-3/4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-semibold text-gray-800">Employee Profile</h2>
              <button
                onClick={() => navigate(rolePath)}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors whitespace-nowrap"
              >
                <FaEdit className="mr-2" />
                Edit Profile Details
              </button>
            </div>

            {/* Tabs */}
            {isMobile ? (
              <div className="px-4 pt-4">
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {tabs.map((tab) => (
                    <option key={tab.id} value={tab.id}>
                      {tab.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex border-b border-gray-200 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === tab.id
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Tab Content */}
            <div className="p-6">
              {tabs.find((tab) => tab.id === activeTab)?.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;