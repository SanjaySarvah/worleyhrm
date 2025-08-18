import SalaryAnalysis from '../../components/SalaryAnalysis';
import LeaveManager from '../../components/LeaveManager';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="page-title">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="card-title">Salary Analysis</h2>
          <SalaryAnalysis />
        </div>

        <div className="card">
          <h2 className="card-title">Leave Manager</h2>
          <LeaveManager />
        </div>
      </div>

      <div className="mt-8 warning-banner">
        <h2 className="text-lg font-semibold">Gradient Warning</h2>
        <p>This is a gradient alert box used for important notices.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
