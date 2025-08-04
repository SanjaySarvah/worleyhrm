const Leave = require('../models/Leave');
const User = require('../models/User');

// STAFF: Apply for leave
exports.applyLeave = async (req, res) => {
  const { leaveType, fromDate, toDate, reason } = req.body;

  try {
    const userId = req.user._id; // from token
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newLeave = new Leave({
      user: userId,
      leaveType,
      fromDate,
      toDate,
      reason,
      status: 'pending'
    });

    await newLeave.save();
    res.status(201).json({ message: 'Leave request submitted successfully', leave: newLeave });
  } catch (error) {
    console.error('Error applying for leave:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// STAFF: Get own leaves
exports.getMyLeaves = async (req, res) => {
  try {
    const userId = req.user._id;
    const leaves = await Leave.find({ user: userId }).sort({ fromDate: -1 });
    res.json(leaves);
  } catch (error) {
    console.error('Error fetching leaves:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ADMIN/HR: Get all leaves
exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .sort({ fromDate: -1 })
      .populate('user', 'name employeeId role officeMailId profileImage');

    res.json(leaves);
  } catch (error) {
    console.error('Error fetching all leaves:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ADMIN/HR: Approve/Reject leave
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updated = await Leave.findByIdAndUpdate(
      leaveId,
      { status },
      { new: true }
    ).populate('user', 'name');

    if (!updated) return res.status(404).json({ message: 'Leave not found' });

    res.json({ message: `Leave ${status}`, leave: updated });
  } catch (error) {
    console.error('Error updating leave status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
