const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = (allowedRoles = []) => {
  return async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id); // Fetch full user
      if (!user) return res.status(401).json({ message: 'User not found' });

      if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      req.user = user;
      next();
    } catch (err) {
      res.status(403).json({ message: 'Invalid token' });
    }
  };
};

module.exports = { protect };
