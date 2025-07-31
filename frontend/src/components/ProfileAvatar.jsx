import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaEdit } from "react-icons/fa";

const FALLBACK_AVATAR = "https://cdn-icons-png.flaticon.com/512/847/847969.png";

const ProfileImageUploader = () => {
  const [formId, setFormId] = useState(null);
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
    setSelectedFile(e.target.files[0]);
    setMessage("");
    handleUpload(e.target.files[0]);
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
    <div style={styles.wrapper}>
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
      <p style={styles.message}>{loading ? "Uploading..." : message}</p>
    </div>
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
  message: {
    marginTop: "10px",
    color: "gray",
    fontSize: "14px",
  },
};
