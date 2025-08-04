import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaEdit, FaSave, FaTimes, FaFileExcel } from "react-icons/fa";

const AttendancePage = () => {
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [records, setRecords] = useState([]);
  const [editMode, setEditMode] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/attendance/daily?date=${date}`);
      setRecords(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (index, field, value) => {
    const updated = [...records];
    updated[index][field] = value;
    setRecords(updated);
  };

  const handleNestedTimeChange = (index, field, subField, value) => {
    const updated = [...records];
    const current = updated[index][field]?.[0] || { from: "", to: "" };
    updated[index][field] = [{ ...current, [subField]: value }];
    setRecords(updated);
  };

  const handleUpdate = async (record) => {
    try {
      await axios.put("http://localhost:5000/api/attendance/update-single", {
        userId: record.user._id,
        date,
        status: record.status,
        permissionHours: record.permissionHours || [],
        extraHours: record.extraHours || [],
      });
      alert("Updated successfully");
      setEditMode({ ...editMode, [record.user._id]: false });
      fetchAttendance();
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const handleMarkToday = async () => {
    try {
      const payload = records.map((r) => ({
        userId: r.user._id,
        date,
        status: r.status || "Absent",
        permissionHours: r.permissionHours || [],
        extraHours: r.extraHours || [],
      }));

      await axios.post("http://localhost:5000/api/attendance/bulk", {
        records: payload,
      });
      alert("Attendance submitted");
      fetchAttendance();
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const handleExportExcel = () => {
    const data = records.map((rec) => ({
      Name: rec.user.name,
      EmployeeID: rec.user.employeeId,
      Status: rec.status,
      PermissionFrom: rec.permissionHours?.[0]?.from || "",
      PermissionTo: rec.permissionHours?.[0]?.to || "",
      TotalHours: rec.totalHours || "0",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(file, `Attendance_${date}.xlsx`);
  };

  useEffect(() => {
    fetchAttendance();
  }, [date]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Attendance for {date}</h2>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <label>Select Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <button onClick={handleExportExcel} style={{ backgroundColor: "#1f8f2e", color: "#fff", padding: "5px 10px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
          <FaFileExcel /> Export to Excel
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table
          border="1"
          cellPadding="8"
          cellSpacing="0"
          style={{ width: "100%", marginTop: 10, borderCollapse: "collapse" }}
        >
          <thead style={{ backgroundColor: "#f0f0f0" }}>
            <tr>
              <th>Name</th>
              <th>Employee ID</th>
              <th>Status</th>
              <th>Permission Hours</th>
              <th>Total Hours</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec, idx) => (
              <tr key={rec.user._id}>
                <td>{rec.user.name}</td>
                <td>{rec.user.employeeId}</td>
                <td>
                  {editMode[rec.user._id] ? (
                    <select
                      value={rec.status || "Absent"}
                      onChange={(e) => handleFieldChange(idx, "status", e.target.value)}
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                    </select>
                  ) : (
                    rec.status
                  )}
                </td>

                <td>
                  {editMode[rec.user._id] ? (
                    <>
                      <input
                        type="time"
                        value={rec.permissionHours?.[0]?.from || ""}
                        onChange={(e) =>
                          handleNestedTimeChange(idx, "permissionHours", "from", e.target.value)
                        }
                      />
                      <span> - </span>
                      <input
                        type="time"
                        value={rec.permissionHours?.[0]?.to || ""}
                        onChange={(e) =>
                          handleNestedTimeChange(idx, "permissionHours", "to", e.target.value)
                        }
                      />
                    </>
                  ) : rec.permissionHours?.[0]?.from && rec.permissionHours?.[0]?.to ? (
                    `${rec.permissionHours[0].from} - ${rec.permissionHours[0].to}`
                  ) : (
                    "—"
                  )}
                </td>

                <td>{(rec.totalHours).toFixed(2) || "0"}</td>
                <td>
                  {editMode[rec.user._id] ? (
                    <>
                      <button
                        onClick={() => handleUpdate(rec)}
                        style={{ backgroundColor: "#4CAF50", color: "white", border: "none", marginRight: 5 }}
                      >
                        <FaSave />
                      </button>
                      <button
                        onClick={() => setEditMode({ ...editMode, [rec.user._id]: false })}
                        style={{ backgroundColor: "#f44336", color: "white", border: "none" }}
                      >
                        <FaTimes />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditMode({ ...editMode, [rec.user._id]: true })}
                      style={{ backgroundColor: "#2196F3", color: "white", border: "none" }}
                    >
                      <FaEdit />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button
        onClick={handleMarkToday}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Save All Attendance for {date}
      </button>
    </div>
  );
};

export default AttendancePage;
