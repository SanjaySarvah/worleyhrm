import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaEdit } from "react-icons/fa";

const FALLBACK_AVATAR = "https://cdn-icons-png.flaticon.com/512/847/847969.png";

const ProfileImageUploader = () => {
  const [formId, setFormId] = useState(null);
  const [userInfo, setUserInfo] = useState({ name: "", id: "", role: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.formId) setFormId(user.formId);
        setUserInfo({
          name: user.name || "",
          id: user.id || "",
          role: user.role || "",
        });
      } catch {
        console.error("Invalid user data in localStorage");
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setMessage("");
      handleUpload(file);
    }
  };

  const handleUpload = async (file) => {
    if (!formId || !file) return;

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      setLoading(true);
      const res = await axios.patch(
        `http://localhost:5000/api/forms/profile-image/${formId}`,
        formData
      );
      setMessage(res.data.message || "Uploaded successfully");
      setSelectedFile(null);
      fetchImage();
    } catch (err) {
      console.error("Upload error:", err);
      setMessage("Upload failed.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <h1 style={{ color: "red", fontSize: "40px" }}>TEST data</h1>
      <div style={styles.wrapper}>
        {/* ✅ Profile image and uploader */}
        <div style={styles.imageContainer}>
          <img
            src={previewUrl || FALLBACK_AVATAR}
            alt="Profile"
            style={styles.image}
            onError={(e) => (e.target.src = FALLBACK_AVATAR)}
          />
          <div
            style={styles.editIcon}
            onClick={() => fileInputRef.current.click()}
          >
            <FaEdit color="#fff" />
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>
  
        {/* ✅ User info */}
        <div style={styles.userInfoBox}>
          <p style={styles.userLine}><strong>Name:</strong> {userInfo.name || "-"}</p>
          <p style={styles.userLine}><strong>ID:</strong> {userInfo.id || "-"}</p>
          <p style={styles.userLine}><strong>Role:</strong> {userInfo.role || "-"}</p>
        </div>
  
        {/* ✅ Message */}
        <p style={styles.message}>{loading ? "Uploading..." : message}</p>
      </div>


    </>
  );



};

export default ProfileImageUploader;

// Styles
const styles = {
  wrapper: {
    textAlign: "center",
    padding: "1rem",
  },
  imageContainer: {
    position: "relative",
    width: "200px",
    height: "200px",
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
  userInfoBox: {
    marginTop: "20px",
    background: "#f8f9fa",
    padding: "10px 20px",
    borderRadius: "8px",
    display: "inline-block",
    textAlign: "left",
  },
  userLine: {
    margin: "5px 0px",
    fontSize: "16px",
  },
  message: {
    marginTop: "12px",
    color: "gray",
    fontSize: "14px",
  },
};
