// import React from 'react';

// import AdminDashboard from '../pages/Dashboard/AdminDashboard';
// import HrDashboard from '../pages/Dashboard/HrDashboard';
// import StaffDashboard from '../pages/Dashboard/StaffDashboard';

// import LeaveForm from '../pages/LeaveForm';
// import LeaveStatus from '../pages/LeaveStatus';
// import ProfileUpdate from '../pages/ProfileUpdate';
// import ProductOrder from '../pages/ProductOrder';
// import CreateEmployee from '../pages/CreateEmployee';
// import CalendarManager from '../pages/CalendarManager';

// const roleRoutes = {
//   admin: [
//     { path: '/admin', element: <AdminDashboard /> },
//     { path: '/admin/leave-form', element: <LeaveForm /> },
//     { path: '/admin/leave-status', element: <LeaveStatus /> },
//     { path: '/admin/profile-update', element: <ProfileUpdate /> },
//     { path: '/admin/product-order', element: <ProductOrder /> },
//     { path: '/admin/create-employee', element: <CreateEmployee /> },
//     { path: '/admin/calendar-manager', element: <CalendarManager /> },
//   ],
//   hr: [
//     { path: '/hr', element: <HrDashboard /> },
//     { path: '/hr/leave-form', element: <LeaveForm /> },
//     { path: '/hr/leave-status', element: <LeaveStatus /> },
//   ],
//   employee: [
//     { path: '/employee', element: <HrDashboard /> }, // Change to EmployeeDashboard if needed
//     { path: '/employee/leave-form', element: <LeaveForm /> },
//     { path: '/employee/leave-status', element: <LeaveStatus /> },
//   ],
//   staff: [
//     { path: '/staff', element: <StaffDashboard /> },
//     { path: '/staff/leave-form', element: <LeaveForm /> },
//     { path: '/staff/leave-status', element: <LeaveStatus /> },
//   ],
//   user: [
//     { path: '/user', element: <StaffDashboard /> }, // You can replace with UserDashboard if needed
//     { path: '/user/leave-form', element: <LeaveForm /> },
//     { path: '/user/leave-status', element: <LeaveStatus /> },
//   ],
// };

// export default roleRoutes;



// src/routes/roleRoutes.jsx
// src/routes/roleRoutes.jsx
import React from 'react';
import AdminDashboard from '../pages/Dashboard/AdminDashboard';
import CreateEmployee from '../pages/CreateEmployee';
import LeaveStatus from '../pages/LeaveStatus';
import HrDashboard from '../pages/Dashboard/HrDashboard';
import StaffDashboard from '../pages/Dashboard/StaffDashboard';
import LeaveForm from '../pages/LeaveForm';
import ProfileUpdate from '../pages/ProfileUpdate';
import CalendarManager from '../pages/CalendarManager';
import ViewProfile from '../pages/ViewProfile';
import ANnoncementManager from '../components/AnnouncementManager';
const roleRoutes = {
  admin: [
    { path: '/admin', element: <AdminDashboard /> },
    { path: '/admin/create-employee', element: <CreateEmployee /> },
    { path: '/admin/leave-status', element: <LeaveStatus /> },
      { path: '/admin/ProfileUpdate', element: <ProfileUpdate /> },
         { path: '/admin/CalendarManager', element: <CalendarManager /> },
           { path: '/admin/ViewProfile', element: <ViewProfile /> },
            { path: '/admin/ANnoncementManager', element: <ANnoncementManager /> },
     
  ],
  hr: [
    { path: '/hr', element: <HrDashboard /> },
    { path: '/hr/leave-status', element: <LeaveStatus /> },
  ],
  staff: [
    { path: '/staff', element: <StaffDashboard /> },
    { path: '/staff/leave-status', element: <LeaveStatus /> },
       { path: '/staff/LeaveForm', element: <LeaveForm /> },
       { path: '/staff/ProfileUpdate', element: <ProfileUpdate /> },
  ],
};

export default roleRoutes;


