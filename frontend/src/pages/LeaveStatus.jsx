import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BASE_URL = 'http://localhost:5000';
const BASEProfile_URL = 'http://localhost:5000/uploads';

const AdminLeaveManager = () => {
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const token = localStorage.getItem('token');

const fetchAllLeaves = async () => {
  setIsLoading(true);
  try {
    const res = await axios.get(`${BASE_URL}/api/auth/leaves/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Add timestamp to profileImage to prevent caching
    const updatedLeaves = res.data.map(leave => {
      if (leave.user?.profileImage) {
        leave.user.profileImage = `${leave.user.profileImage}?t=${Date.now()}`;
      }
      return leave;
    });

    setLeaves(updatedLeaves);
  } catch (err) {
    console.error('Failed to fetch leave requests:', err);
    alert('Error fetching leave data');
  } finally {
    setIsLoading(false);
  }
};


  // Update leave status
  const handleStatusChange = async (leaveId, newStatus) => {
    try {
      if (!newStatus) {
        alert("Please select a status.");
        return;
      }

      await axios.patch(
        `${BASE_URL}/api/auth/leaves/status/${leaveId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      fetchAllLeaves(); // refresh
    } catch (err) {
      console.error('Failed to update status:', err.response?.data || err.message);
      alert(`Failed to update status: ${err.response?.data?.message || err.message}`);
    }
  };

  useEffect(() => {
    fetchAllLeaves();
  }, []);

  const filteredLeaves = leaves.filter(leave => {
    if (filter === 'all') return true;
    return leave.status === filter;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


  const calculateLeaveDays = (fromDate, toDate) => {
    const diffTime = Math.abs(new Date(toDate) - new Date(fromDate));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // +1 to include both start and end dates
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Leave Management</h1>
              <p className="text-gray-600">Review and manage employee leave requests</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm flex items-center w-full md:w-auto">
              <span className="text-gray-500 mr-2 whitespace-nowrap">Filter:</span>
              <select
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
                value={filter}
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
              <div className="text-gray-500 text-sm font-medium">Total Requests</div>
              <div className="text-2xl font-bold text-gray-800">{leaves.length}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
              <div className="text-gray-500 text-sm font-medium">Pending</div>
              <div className="text-2xl font-bold text-gray-800">
                {leaves.filter(l => l.status === 'pending').length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
              <div className="text-gray-500 text-sm font-medium">Approved</div>
              <div className="text-2xl font-bold text-gray-800">
                {leaves.filter(l => l.status === 'approved').length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
              <div className="text-gray-500 text-sm font-medium">Rejected</div>
              <div className="text-2xl font-bold text-gray-800">
                {leaves.filter(l => l.status === 'rejected').length}
              </div>
            </div>
          </div>

          {/* Leave Requests Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading leave requests...</p>
              </div>
            ) : filteredLeaves.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No leave requests found matching your criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLeaves.map((leave) => (
                      <tr key={leave._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-full"
                                src={
                                  leave.user?.profileImage
                                    ? `${BASEProfile_URL}/${leave.user.profileImage}`
                                    : 'https://via.placeholder.com/40'
                                }
                                alt="Profile"
                              />

                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{leave.user?.name}</div>
                              <div className="text-sm text-gray-500">{leave.user?.officeMailId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">{leave.leaveType}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {calculateLeaveDays(leave.fromDate, leave.toDate)} days
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">{leave.reason}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(leave.status)}`}>
                            {leave.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <select
                            value={leave.status}
                            onChange={(e) => handleStatusChange(leave._id, e.target.value)}
                            className={`block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${leave.status === 'approved' ? 'bg-green-50 text-green-700' : leave.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approve</option>
                            <option value="rejected">Reject</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLeaveManager;