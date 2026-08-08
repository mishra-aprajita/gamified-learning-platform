// ─────────────────────────────────────────────────────────────
//  XPify Backend  –  server.js
//  Production-ready Express server with crash-proof Nova API
//  Run:  npm run dev   (development)
//        npm start     (production)
// ─────────────────────────────────────────────────────────────
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express   = require('express');
const http      = require('http');
const socketIO  = require('socket.io');
const cors      = require('cors');
const connectDB = require('./config/db');
const { corsOriginDelegate, getAllowedOrigins } = require('./config/cors');
const errorHandler  = require('./middleware/errorHandler');
const startStreakCron = require('./utils/cronJobs');
const seedRoadmaps     = require('./utils/seedRoadmaps');
const seedQuestions     = require('./utils/seedQuestions');

// ── Routes ───────────────────────────────────
const authRoutes    = require('./routes/auth');
const postRoutes    = require('./routes/posts');
const userRoutes    = require('./routes/users');
const messageRoutes = require('./routes/messages');
const goalRoutes     = require('./routes/goals');
const taskRoutes     = require('./routes/tasks');
const roadmapRoutes   = require('./routes/roadmaps');
const quizRoutes        = require('./routes/quiz');
const pomodoroRoutes      = require('./routes/pomodoro');
const reportRoutes          = require('./routes/reports');
const novaRoutes               = require('./routes/nova');

// ── Connect Database ─────────────────────────
connectDB().then(() => {
  seedRoadmaps();
  seedQuestions();
}).catch(err => {
  console.error('Database connection failed:', err.message);
  // Don't crash - allow server to start for health checks
});

// ── Express App ──────────────────────────────
const app    = express();
const server = http.createServer(app);

// ── Socket.io Setup ──────────────────────────
const io = socketIO(server, {
  cors: {
    origin: getAllowedOrigins(),
    methods: ['GET', 'POST'],
  },
});

// Track online users:  { userId → socketId }
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // User comes online
  socket.on('user_online', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('online_users', Array.from(onlineUsers.keys()));
    console.log(`👤 User online: ${userId}`);
  });

  // Send a private message
  socket.on('send_message', async (data) => {
    // data: { senderId, receiverId, content }
    const receiverSocket = onlineUsers.get(data.receiverId);

    // Save to DB via REST is handled separately;
    // here we just push to the receiver if online
    if (receiverSocket) {
      io.to(receiverSocket).emit('receive_message', {
        senderId:  data.senderId,
        content:   data.content,
        createdAt: new Date(),
      });
    }
  });

  // Typing indicator
  socket.on('typing', ({ senderId, receiverId }) => {
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit('user_typing', { senderId });
    }
  });

  socket.on('stop_typing', ({ senderId, receiverId }) => {
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit('user_stop_typing', { senderId });
    }
  });

  // User goes offline
  socket.on('disconnect', () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        io.emit('online_users', Array.from(onlineUsers.keys()));
        console.log(`👤 User offline: ${userId}`);
        break;
      }
    }
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// Attach io to req so controllers can emit events
app.use((req, res, next) => { req.io = io; next(); });

// ── Middleware ───────────────────────────────
// CORS configuration for Vercel frontend
app.use(cors({ origin: corsOriginDelegate, credentials: true }));

// Parse JSON bodies (crucial for POST /api/nova/chat)
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ── API Routes ───────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/posts',    postRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/goals',    goalRoutes);
app.use('/api/tasks',    taskRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/quiz',     quizRoutes);
app.use('/api/pomodoro', pomodoroRoutes);
app.use('/api/reports',  reportRoutes);
app.use('/api/nova',     novaRoutes);

// ── Health check ─────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: '⚡ XPify API is running!', 
    timestamp: new Date(),
    nova: {
      configured: require('./services/gemini').isConfigured(),
      model: require('./services/gemini').GEMINI_MODEL
    }
  });
});

// ── 404 handler ──────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Error handler (must be last) ─────────────
app.use(errorHandler);

// ── Start Cron Jobs ──────────────────────────
try {
  startStreakCron();
} catch (err) {
  console.error('Failed to start cron jobs:', err.message);
  // Don't crash the server
}

// ── Start Server ─────────────────────────────
const PORT = process.env.PORT || 5000;
const geminiSvc = require('./services/gemini');

server.listen(PORT, () => {
  console.log(`\n🚀 XPify server running on http://localhost:${PORT}`);
  console.log(`📡 Socket.io ready`);
  console.log(`🌍 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  console.log(`🤖 Gemini model: ${geminiSvc.GEMINI_MODEL} (REST API, no SDK)`);
  console.log(`🔑 GEMINI_API_KEY: ${geminiSvc.isConfigured() ? '✅ Configured' : '❌ Missing/Placeholder'}`);
  console.log(`📦 Node version: ${process.version} | Env: ${process.env.NODE_ENV || 'development'}\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err.message);
  // Don't crash - log and continue
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  // Don't crash - log and continue
});