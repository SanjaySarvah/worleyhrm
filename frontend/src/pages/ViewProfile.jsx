import React, { useState, useEffect } from "react";
import ViewPersonalDetails from "../components/ViewProfile/ViewPersonalDetails";
import ViewContactDetails from "../components/ViewProfile/ViewContactDetails";
import ViewWorkingDetails from "../components/ViewProfile/ViewWorkingDetails";
import ViewBankDetails from "../components/ViewProfile/ViewBankDetails";
import { FaEdit } from "react-icons/fa";

const FALLBACK_AVATAR = "https://cdn-icons-png.flaticon.com/512/847/847969.png";

const ProfileAvatar = () => {
  const [formId, setFormId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = React.useRef();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.formId) setFormId(user.formId);
    }
  }, []);

  const fetchImage = () => {
    if (formId) {
      setPreviewUrl(
        `http://localhost:5000/api/forms/profile-image/${formId}?t=${Date.now()}`
      );
    }
  };

  useEffect(() => {
    if (formId) fetchImage();
  }, [formId]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !formId) return;

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      await fetch(`http://localhost:5000/api/forms/profile-image/${formId}`, {
        method: "PATCH",
        body: formData,
      });
      fetchImage();
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  return (
    <div style={avatarStyles.wrapper}>
      <div style={avatarStyles.imageContainer}>
        <img
          src={previewUrl || FALLBACK_AVATAR}
          alt="Profile"
          style={avatarStyles.image}
          onError={(e) => (e.target.src = FALLBACK_AVATAR)}
        />
        <div
          style={avatarStyles.editIcon}
          onClick={() => fileInputRef.current.click()}
        >
          <FaEdit color="#fff" size={16} />
        </div>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
};

const avatarStyles = {
  wrapper: {
    textAlign: "center",
    marginBottom: "20px",
  },
  imageContainer: {
    position: "relative",
    width: "150px",
    height: "150px",
    margin: "auto",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #ccc",
  },
  editIcon: {
    position: "absolute",
    bottom: "8px",
    right: "8px",
    backgroundColor: "#000",
    borderRadius: "50%",
    padding: "6px",
    cursor: "pointer",
  },
};

const tabs = [
  { id: "tab1", label: "👤 Personal Details", content: <ViewPersonalDetails /> },
  { id: "tab2", label: "📞 Contact Details", content: <ViewContactDetails /> },
  { id: "tab3", label: "💼 Working Details", content: <ViewWorkingDetails /> },
  { id: "tab4", label: "🏦 Bank Details", content: <ViewBankDetails /> },
];

const ViewProfile = () => {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.leftColumn}>
        <ProfileAvatar />
      </div>
      <div style={styles.rightColumn}>
        <h2 style={styles.header}>Employee Profile</h2>

        {/* Tab Navigation */}
        {isMobile ? (
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            style={styles.select}
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.label}
              </option>
            ))}
          </select>
        ) : (
          <div style={styles.tabButtons}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  ...styles.tabButton,
                  ...(activeTab === tab.id ? styles.activeTab : {}),
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Tab Content */}
        <div style={styles.tabContent}>
          {tabs.find((tab) => tab.id === activeTab)?.content}
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;

// Layout & Style
const styles = {
  container: {
    display: "flex",
    flexWrap: "wrap",
    padding: "20px",
    gap: "20px",
  },
  leftColumn: {
    flex: "1 1 30%",
    maxWidth: "300px",
    padding: "10px",
    borderRight: "1px solid #eee",
    minWidth: "250px",
  },
  rightColumn: {
    flex: "1 1 70%",
    padding: "10px",
    minWidth: "300px",
  },
  header: {
    marginBottom: "20px",
    fontSize: "22px",
    color: "#333",
  },
  tabButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "15px",
  },
  tabButton: {
    padding: "10px 15px",
    border: "1px solid #ccc",
    backgroundColor: "#f9f9f9",
    borderRadius: "5px",
    cursor: "pointer",
  },
  activeTab: {
    backgroundColor: "#007bff",
    color: "#fff",
    borderColor: "#007bff",
  },
  select: {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    marginBottom: "10px",
  },
  tabContent: {
    marginTop: "10px",
    border: "1px solid #ddd",
    padding: "15px",
    borderRadius: "8px",
    backgroundColor: "#fefefe",
  },
};
