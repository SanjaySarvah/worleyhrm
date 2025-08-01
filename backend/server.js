require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// ⬇️ ROUTES
const calendarRoutes = require('./routes/calendarRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const authRoutes = require('./routes/authRoutes');
const formRoutes = require('./routes/form.routes');
const announcementRoutes = require('./routes/announcementRoutes'); // ✅ NEW

// ✅ INIT
const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');

// ✅ SOCKET.IO CONFIG
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // your Vite frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// ✅ Connect DB
connectDB();

// ✅ CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

// ✅ Middleware
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Make io accessible in routes/controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ✅ ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/auth/leaves', leaveRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/announcements', announcementRoutes); // ✅ NEW

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

// ✅ WebSocket Events
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
