const Leave = require('../models/Leave');
const User = require('../models/User');

// Apply for leave
exports.applyLeave = async (req, res) => {
  const { leaveType, fromDate, toDate, reason, userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newLeave = new Leave({
      user: userId,
      leaveType,
      fromDate,
      toDate,
      reason,
    });

    await newLeave.save();
    res.status(201).json({ message: 'Leave request submitted successfully' });
  } catch (error) {
    console.error('Error applying for leave:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get leaves of a particular user (for user)
exports.getMyLeaves = async (req, res) => {
  const { userId } = req.params;

  try {
    const leaves = await Leave.find({ user: userId }).sort({ fromDate: -1 });
    res.json(leaves);
  } catch (error) {
    console.error('Error fetching leaves:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all leaves (admin)
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

// Update leave status (admin)
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status } = req.body;
    const updated = await Leave.findByIdAndUpdate(
      leaveId,
      { status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ msg: 'Leave not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
};
