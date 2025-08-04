import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SalaryManager = () => {
  const [salaryData, setSalaryData] = useState([]);
  const [file, setFile] = useState(null);
  const [uploadMonth, setUploadMonth] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const monthOptions = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const yearOptions = Array.from({ length: 5 }, (_, i) => 2023 + i);

  useEffect(() => {
    fetchSalaries();
  }, [monthFilter]);

  const fetchSalaries = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/salary-sheet${monthFilter ? `?month=${monthFilter}` : ''}`);
      setSalaryData(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !uploadMonth) {
      setMessage('File and month are required');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('month', uploadMonth);
    
    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/salary-sheet/import', formData);
      setMessage(res.data.message);
      fetchSalaries();
    } catch (err) {
      console.error(err);
      setMessage('Upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}>Salary Sheet Manager</h2>
        
        <div style={styles.section}>
          <h3 style={styles.sectionHeader}>Upload Salary Data</h3>
          <form onSubmit={handleUpload} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Excel File:</label>
              <div style={styles.fileInputContainer}>
                <input 
                  type="file" 
                  onChange={(e) => setFile(e.target.files[0])} 
                  style={styles.fileInput}
                  accept=".xlsx,.xls"
                />
                <span style={styles.fileInputLabel}>
                  {file ? file.name : 'Choose file...'}
                </span>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>For Month:</label>
              <div style={styles.dropdownGroup}>
                <select 
                  value={uploadMonth.split(' ')[0] || ''} 
                  onChange={(e) => setUploadMonth(`${e.target.value} ${uploadMonth.split(' ')[1] || ''}`)} 
                  style={styles.select}
                  required
                >
                  <option value="">Select Month</option>
                  {monthOptions.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <select 
                  onChange={(e) => setUploadMonth(`${uploadMonth.split(' ')[0] || ''} ${e.target.value}`)} 
                  style={styles.select}
                  required
                >
                  <option value="">Select Year</option>
                  {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              style={styles.primaryButton}
              disabled={isLoading}
            >
              {isLoading ? 'Uploading...' : 'Upload Salary Sheet'}
            </button>
            
            {message && (
              <p style={message.includes('failed') ? styles.errorMessage : styles.successMessage}>
                {message}
              </p>
            )}
          </form>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionHeader}>Filter Salary Records</h3>
          <div style={styles.formGroup}>
            <label style={styles.label}>Filter by Month:</label>
            <div style={styles.dropdownGroup}>
              <select 
                onChange={(e) => setMonthFilter(`${e.target.value} ${monthFilter.split(' ')[1] || ''}`)} 
                style={styles.select}
              >
                <option value="">All Months</option>
                {monthOptions.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <select 
                onChange={(e) => setMonthFilter(`${monthFilter.split(' ')[0] || ''} ${e.target.value}`)} 
                style={styles.select}
              >
                <option value="">All Years</option>
                {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionHeader}>Salary Records</h3>
          {isLoading ? (
            <div style={styles.loading}>Loading data...</div>
          ) : salaryData.length > 0 ? (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.tableHeader}>Employee ID</th>
                    <th style={styles.tableHeader}>Month</th>
                    <th style={styles.tableHeader}>Annual CTC</th>
                    <th style={styles.tableHeader}>Gross Salary</th>
                    <th style={styles.tableHeader}>Net Salary</th>
                    <th style={styles.tableHeader}>Total Deduction</th>
                  </tr>
                </thead>
                <tbody>
                  {salaryData.map((row, index) => (
                    <tr key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                      <td style={styles.tableCell}>{row.employeeId}</td>
                      <td style={styles.tableCell}>{row.month}</td>
                      <td style={styles.tableCell}>{formatCurrency(row.annualCTC)}</td>
                      <td style={styles.tableCell}>{formatCurrency(row.grossSalary)}</td>
                      <td style={styles.tableCell}>{formatCurrency(row.netSalary)}</td>
                      <td style={styles.tableCell}>{formatCurrency(row.totalDeduction)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={styles.emptyState}>No salary records found</div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  card: {
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    padding: '30px',
    overflow: 'hidden'
  },
  header: {
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: '30px',
    fontSize: '28px',
    fontWeight: '600',
    borderBottom: '2px solid #eaeaea',
    paddingBottom: '15px'
  },
  section: {
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: '#f9fafc',
    borderRadius: '6px',
    borderLeft: '4px solid #3498db'
  },
  sectionHeader: {
    color: '#2c3e50',
    marginTop: '0',
    marginBottom: '20px',
    fontSize: '20px',
    fontWeight: '500'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    color: '#34495e',
    fontSize: '14px',
    fontWeight: '500'
  },
  fileInputContainer: {
    position: 'relative',
    overflow: 'hidden',
    display: 'inline-block',
    width: '100%'
  },
  fileInput: {
    position: 'absolute',
    left: '0',
    top: '0',
    opacity: '0',
    width: '100%',
    height: '100%',
    cursor: 'pointer'
  },
  fileInputLabel: {
    display: 'inline-block',
    padding: '10px 15px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%',
    boxSizing: 'border-box',
    color: '#555',
    transition: 'all 0.3s ease'
  },
  dropdownGroup: {
    display: 'flex',
    gap: '10px',
    width: '100%'
  },
  select: {
    padding: '10px 12px',
    borderRadius: '4px',
    border: '1px solid #ced4da',
    backgroundColor: '#fff',
    fontSize: '14px',
    color: '#495057',
    flex: '1',
    transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
    outline: 'none'
  },
  primaryButton: {
    padding: '12px 20px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'background-color 0.3s ease',
    alignSelf: 'flex-start',
    ':hover': {
      backgroundColor: '#2980b9'
    }
  },
  successMessage: {
    color: '#27ae60',
    margin: '10px 0 0',
    fontSize: '14px'
  },
  errorMessage: {
    color: '#e74c3c',
    margin: '10px 0 0',
    fontSize: '14px'
  },
  loading: {
    padding: '20px',
    textAlign: 'center',
    color: '#7f8c8d'
  },
  emptyState: {
    padding: '20px',
    textAlign: 'center',
    color: '#95a5a6',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px'
  },
  tableContainer: {
    overflowX: 'auto',
    borderRadius: '4px',
    border: '1px solid #eaeaea'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px'
  },
  tableHeaderRow: {
    backgroundColor: '#3498db',
    color: '#fff'
  },
  tableHeader: {
    padding: '12px 15px',
    textAlign: 'left',
    fontWeight: '500'
  },
  tableRow: {
    backgroundColor: '#fff',
    borderBottom: '1px solid #eaeaea',
    ':hover': {
      backgroundColor: '#f5f7fa'
    }
  },
  tableRowAlt: {
    backgroundColor: '#f9f9f9',
    borderBottom: '1px solid #eaeaea',
    ':hover': {
      backgroundColor: '#f0f3f5'
    }
  },
  tableCell: {
    padding: '12px 15px',
    color: '#34495e'
  }
};

export default SalaryManager;