require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const { connectDatabase } = require('./config/database');
const notificationService = require('./services/notificationService');

const medicalRoutes = require('./routes/medical');
const pharmacyRoutes = require('./routes/pharmacies');
const itemRoutes = require('./routes/items');
const redemptionRoutes = require('./routes/redemption');
const imageRoutes = require('./routes/images');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:8080',
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:8080', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize notification service with Socket.IO
notificationService.initialize(io);

// Routes
app.use('/api/medical', medicalRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/redemption', redemptionRoutes);
app.use('/api/images', imageRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'CampusConnect AI Backend' });
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
    // Connect to database
    await connectDatabase();
    
    server.listen(PORT, () => {
      console.log(`\n🚀 CampusConnect AI Backend running on http://localhost:${PORT}`);
      console.log(`🔌 WebSocket server ready for real-time notifications`);
      console.log(`\n📡 API Endpoints:`);
      console.log(`  Health:       GET    /api/health`);
      console.log(`  Medical:      GET    /api/medical`);
      console.log(`                POST   /api/medical`);
      console.log(`                POST   /api/medical/ocr/extract`);
      console.log(`  Items:        POST   /api/items/lost`);
      console.log(`                POST   /api/items/found`);
      console.log(`                POST   /api/items/match/ai`);
      console.log(`                POST   /api/items/match/batch`);
      console.log(`  Redemption:   GET    /api/redemption/partners`);
      console.log(`                POST   /api/redemption/redeem`);
      console.log(`                GET    /api/redemption/history/:userId`);
      console.log(`  Images:       POST   /api/images/generate`);
      console.log(`                POST   /api/images/analyze`);
      console.log(`                POST   /api/images/enhance-description`);
      console.log(`                GET    /api/images/placeholder/:category`);
      console.log(`                GET    /api/images/test`);
      console.log(`  Pharmacies:   GET    /api/pharmacies`);
      console.log(`\n✨ AI-powered image matching enabled`);
      console.log(`💰 Real-world coin redemption system active\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
