require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const calendarRoutes = require('./routes/calendarRoutes');
const leaveRoutes = require('./routes/leaveRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Connect to DB
connectDB();

// ✅ Enable CORS for frontend (adjust for your actual frontend origin)
app.use(cors({
  origin: 'http://localhost:5173', // frontend running on Vite
  credentials: true, // only needed if using cookies or authorization headers
}));

// ✅ Parse JSON request bodies
app.use(express.json());

// ✅ Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Existing Routes
app.use('/api/auth', require('./routes/authRoutes'));

// ✅ New Form Routes
app.use('/api/forms', require('./routes/form.routes'));
app.use('/api/auth/leaves', leaveRoutes);


app.use('/api/calendar', calendarRoutes);



// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
