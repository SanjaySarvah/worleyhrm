
import SalaryAnalysis from '../../components/SalaryAnalysis';
import LeaveManager from '../../components/LeaveManager';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Salary Analysis</h2>
          <SalaryAnalysis /> 
        </div>

        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Leave Manager</h2>
          <LeaveManager />
        </div>
      </div>
      <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-6 rounded-xl">
  <h2 className="text-xl font-semibold">Gradient Warning</h2>
</div>

    </div>   

  );
};

export default AdminDashboard;
