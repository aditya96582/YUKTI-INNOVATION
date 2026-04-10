require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const { connectDatabase } = require('./config/database');
const notificationService = require('./services/notificationService');

// Routes
const authRoutes = require('./routes/auth');
const medicalRoutes = require('./routes/medical');
const pharmacyRoutes = require('./routes/pharmacies');
const itemRoutes = require('./routes/items');
const redemptionRoutes = require('./routes/redemption');
const imageRoutes = require('./routes/images');
const emergencyRoutes = require('./routes/emergencies');
const chatRoutes = require('./routes/chat');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize notification service with Socket.IO
notificationService.initialize(io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/medical', medicalRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/redemption', redemptionRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/emergencies', emergencyRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'CampusConnect AI Backend', database: 'MongoDB Atlas' });
});

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Start server
async function startServer() {
  try {
    const dbType = await connectDatabase();

    server.listen(PORT, () => {
      console.log(`\n🚀 CampusConnect AI Backend running on http://localhost:${PORT}`);
      console.log(`🔌 WebSocket server ready for real-time notifications`);
      console.log(`📦 Database: ${dbType === 'atlas' ? 'MongoDB Atlas (cloud)' : 'Local In-Memory (Fallback)'}`);
      console.log(`\n📡 API Endpoints:`);
      console.log(`  Auth:         POST   /api/auth/signup`);
      console.log(`                POST   /api/auth/login`);
      console.log(`                GET    /api/auth/me`);
      console.log(`                PUT    /api/auth/profile`);
      console.log(`  Items:        GET    /api/items/lost`);
      console.log(`                GET    /api/items/found`);
      console.log(`                POST   /api/items/lost`);
      console.log(`                POST   /api/items/found`);
      console.log(`  Medical:      GET    /api/medical`);
      console.log(`                POST   /api/medical`);
      console.log(`  Emergencies:  GET    /api/emergencies`);
      console.log(`                POST   /api/emergencies`);
      console.log(`  Chat:         GET    /api/chat/conversations/:userId`);
      console.log(`                POST   /api/chat/conversations`);
      console.log(`  Redemption:   GET    /api/redemption/partners`);
      console.log(`  Pharmacies:   GET    /api/pharmacies`);
      console.log(`\n✨ All data persisted to ${dbType === 'atlas' ? 'MongoDB Atlas' : 'Local Memory'}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}


startServer();

module.exports = app;
