import React, { useState } from 'react';
import PersonalDetails from "../components/ProfileUpdate/PersonalDetails";
import ContactDetails from "../components/ProfileUpdate/ContactDetails";
import WorkingDetails from "../components/ProfileUpdate/WorkingDetails";
import BankDetails from "../components/ProfileUpdate/BankDetails";

import "../assets/css/EmployeeProfileUpdate.css";

const tabs = [
  { id: 'tab1', label: '👤 Personal Details', content: <PersonalDetails /> },
  { id: 'tab2', label: '📞 Contact Details', content: <ContactDetails /> },
  { id: 'tab3', label: '💼 Working Details', content: <WorkingDetails /> },
  { id: 'tab4', label: '🏦 Bank Details', content: <BankDetails /> },
];

const Tabs = () => {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const handleChange = (e) => {
    setActiveTab(e.target.value);
  };

  return (
    <div className="tabs-container">
      {/* Desktop Tabs */}
      <div className="tabs-desktop">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mobile Dropdown */}
      <div className="tabs-mobile">
        <select value={activeTab} onChange={handleChange}>
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};

const EmployeeProfileUpdate = () => {
  return (
    <div>
      <h2>Employee Profile Update</h2>
      <Tabs />
    </div>
  );
};

export default EmployeeProfileUpdate;
