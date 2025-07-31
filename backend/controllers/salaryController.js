const User = require('../models/User');

exports.addIncrement = async (req, res) => {
  const { userId } = req.params;
  const { amount, type, note } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Add new increment
    user.increments.push({ amount, type, note });

    // Recalculate current salary
    const totalIncrements = user.increments.reduce((sum, inc) => sum + inc.amount, 0);
    user.currentSalary = user.initialSalary + totalIncrements;

    await user.save();

    res.json({ msg: "Increment added", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to add increment" });
  }
};
