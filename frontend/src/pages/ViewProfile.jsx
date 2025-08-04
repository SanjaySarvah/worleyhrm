import React, { useState, useEffect } from "react";
import ViewPersonalDetails from "../components/ViewProfile/ViewPersonalDetails";
import ViewContactDetails from "../components/ViewProfile/ViewContactDetails";
import ViewWorkingDetails from "../components/ViewProfile/ViewWorkingDetails";
import ViewBankDetails from "../components/ViewProfile/ViewBankDetails";
import ViewDocuments from "../components/ViewProfile/ViewDocuments";
import { FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const FALLBACK_AVATAR = "https://cdn-icons-png.flaticon.com/512/847/847969.png";

const ProfileAvatar = () => {
  const [formId, setFormId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [userInfo, setUserInfo] = useState({ name: "", id: "", role: "" });
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

      <div style={styles.userInfoBox}>
        <p style={styles.userLine}><strong>Name:</strong> {userInfo.name}</p>
        <p style={styles.userLine}><strong>ID:</strong> {userInfo.id}</p>
        <p style={styles.userLine}><strong>Role:</strong> {userInfo.role}</p>
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
  { id: "tab5", label: "📄 Documents", content: <ViewDocuments /> },
];

const ViewProfile = () => {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [rolePath, setRolePath] = useState("/profileupdate");
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
        setRolePath(`/${role}/ProfileUpdate`);
      }
    }
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.leftColumn}>
        <ProfileAvatar />
      </div>

      <div style={styles.rightColumn}>
        <div style={styles.headerRow}>
             <h2 style={styles.header}>Employee Profile</h2>
          <button style={styles.editButton} onClick={() => navigate(rolePath)}>
            <FaEdit style={{ marginRight: "6px" }} />
            Edit Profile
          </button>
       
        </div>

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

        <div style={styles.tabContent}>
          {tabs.find((tab) => tab.id === activeTab)?.content}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexWrap: "wrap",
    padding: "20px",
    gap: "20px",
  },
  leftColumn: {
    flex: "1 1 250px",
    maxWidth: "300px",
  },
  rightColumn: {
    flex: "2 1 600px",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  header: {
    fontSize: "24px",
    fontWeight: "bold",
  },
  editButton: {
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "5px",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  tabButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "20px",
  },
  tabButton: {
    padding: "10px 16px",
    backgroundColor: "#eee",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  activeTab: {
    backgroundColor: "#007bff",
    color: "#fff",
  },
  tabContent: {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    backgroundColor: "#fff",
  },
  select: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    marginBottom: "20px",
  },
  userInfoBox: {
    marginTop: "20px",
    textAlign: "left",
  },
  userLine: {
    margin: "6px 0",
    fontSize: "14px",
  },
};

export default ViewProfile;
