import CalendarView from '../components/CalendarView';
import CalenderReport from '../components/CalenderReport';
import LeaveManager from '../components/LeaveManager';

const AdminDashboard = () => {
  return (
    <div>
         <LeaveManager/>
         <CalenderReport/>
         <CalendarView/>
    </div>
  );
};

export default AdminDashboard;
