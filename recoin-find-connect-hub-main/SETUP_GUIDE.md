# CampusConnect AI - Quick Setup Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ..
npm install
```

### Step 2: Configure Environment

```bash
# Copy environment template
cd server
cp .env.example .env

# Edit .env if needed (optional for development)
# Default uses in-memory database
```

### Step 3: Start Backend

```bash
# From server directory
npm start

# You should see:
# ✅ Connected to MongoDB (or in-memory database)
# 🚀 CampusConnect AI Backend running on http://localhost:5000
# 🔌 WebSocket server ready
# ✨ AI-powered image matching enabled
```

### Step 4: Start Frontend

```bash
# From root directory
npm run dev

# Open browser at http://localhost:8080
```

---

## 🎯 Testing AI Features

### 1. Test AI Image Matching

```bash
# Upload a lost item with image
curl -X POST http://localhost:5000/api/items/lost \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Lost Backpack",
    "description": "Blue backpack with laptop",
    "category": "bags",
    "location": "Library",
    "date": "2026-04-08",
    "image": "data:image/jpeg;base64,...",
    "userId": "user_123",
    "userName": "John Doe"
  }'

# Upload a found item
curl -X POST http://localhost:5000/api/items/found \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Found Backpack",
    "description": "Blue backpack found near library",
    "category": "bags",
    "location": "Library",
    "date": "2026-04-08",
    "image": "data:image/jpeg;base64,...",
    "userId": "user_456",
    "userName": "Jane Smith"
  }'

# Run AI matching
curl -X POST http://localhost:5000/api/items/match/ai \
  -H "Content-Type: application/json" \
  -d '{
    "lostItemId": "lost_123"
  }'
```

### 2. Test Coin Redemption

```bash
# Get available partners
curl http://localhost:5000/api/redemption/partners

# Redeem coins
curl -X POST http://localhost:5000/api/redemption/redeem \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "partnerId": "amazon",
    "coins": 100
  }'
```

### 3. Test Real-Time Notifications

```javascript
// In browser console or Node.js
const socket = io('http://localhost:5000');

socket.emit('authenticate', 'user_123');

socket.on('notification', (notification) => {
  console.log('Received:', notification);
});
```

---

## 📦 Production Deployment

### Option 1: Docker (Recommended)

```bash
# Build and run with Docker Compose
docker-compose up -d

# Services will be available at:
# Frontend: http://localhost:8080
# Backend: http://localhost:5000
# MongoDB: mongodb://localhost:27017
```

### Option 2: Manual Deployment

#### Backend (Node.js)

```bash
# Install production dependencies
cd server
npm install --production

# Set environment variables
export NODE_ENV=production
export USE_MONGODB=true
export MONGODB_URI=mongodb://your-mongo-host:27017/campusconnect

# Start with PM2
npm install -g pm2
pm2 start index.js --name campusconnect-api

# Or use systemd
sudo systemctl start campusconnect
```

#### Frontend (Static Build)

```bash
# Build for production
npm run build

# Serve with nginx or any static server
# Build output is in dist/
```

### Option 3: Cloud Platforms

#### Heroku

```bash
# Backend
heroku create campusconnect-api
heroku addons:create mongolab
git push heroku main

# Frontend
heroku create campusconnect-web
heroku buildpacks:set heroku/nodejs
git push heroku main
```

#### AWS

- **Backend**: Deploy to Elastic Beanstalk or ECS
- **Frontend**: Deploy to S3 + CloudFront
- **Database**: Use MongoDB Atlas or DocumentDB
- **WebSocket**: Use ALB with sticky sessions

#### Vercel/Netlify

```bash
# Frontend only
vercel deploy
# or
netlify deploy
```

---

## 🔧 Configuration Options

### AI Matching Thresholds

```env
# Minimum confidence to store match
AI_MATCH_THRESHOLD=85

# Minimum confidence to notify users
AI_HIGH_CONFIDENCE_THRESHOLD=98
```

### Database Options

```env
# Development: In-memory database
USE_MONGODB=false

# Production: MongoDB
USE_MONGODB=true
MONGODB_URI=mongodb://localhost:27017/campusconnect
```

### Partner Integration

```env
# Enable real partner APIs (requires API keys)
AMAZON_API_KEY=your_key
FLIPKART_API_KEY=your_key
JANAUSHADHI_API_KEY=your_key
```

---

## 🐛 Troubleshooting

### Issue: TensorFlow Installation Fails

**Solution:**
```bash
# Install Python build tools
# Windows:
npm install --global windows-build-tools

# macOS:
xcode-select --install

# Linux:
sudo apt-get install build-essential python3-dev

# Retry installation
cd server
npm install
```

### Issue: MongoDB Connection Error

**Solution:**
```bash
# Check MongoDB is running
sudo systemctl status mongod

# Or use in-memory database for development
# In server/.env:
USE_MONGODB=false
```

### Issue: WebSocket Connection Failed

**Solution:**
```javascript
// Check CORS settings in server/index.js
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:8080', // Match your frontend URL
    credentials: true
  }
});
```

### Issue: AI Matching Too Slow

**Solution:**
```bash
# Use GPU acceleration (if available)
npm install @tensorflow/tfjs-node-gpu

# Or reduce image size before processing
# In aiImageMatcher.js, adjust resize dimensions
```

---

## 📊 Monitoring & Logs

### View Logs

```bash
# Backend logs
cd server
npm start | tee logs/server.log

# With PM2
pm2 logs campusconnect-api

# Frontend logs
npm run dev | tee logs/frontend.log
```

### Health Check

```bash
# Check backend health
curl http://localhost:5000/api/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2026-04-08T...",
  "service": "CampusConnect AI Backend"
}
```

### Performance Monitoring

```javascript
// Add to server/index.js
const responseTime = require('response-time');
app.use(responseTime((req, res, time) => {
  console.log(`${req.method} ${req.url} - ${time}ms`);
}));
```

---

## 🔐 Security Checklist

- [ ] Change default JWT_SECRET in production
- [ ] Enable HTTPS/TLS
- [ ] Set up rate limiting
- [ ] Implement authentication middleware
- [ ] Validate and sanitize all inputs
- [ ] Use environment variables for secrets
- [ ] Enable CORS only for trusted origins
- [ ] Implement file upload validation
- [ ] Set up database backups
- [ ] Enable audit logging

---

## 📈 Performance Optimization

### Backend

```javascript
// Enable compression
const compression = require('compression');
app.use(compression());

// Cache static assets
app.use(express.static('public', { maxAge: '1d' }));

// Database indexing
db.lostItems.createIndex({ userId: 1, status: 1 });
db.matches.createIndex({ confidence: -1 });
```

### Frontend

```javascript
// Code splitting
const LostItems = lazy(() => import('./pages/LostItems'));

// Image optimization
<img src={image} loading="lazy" />

// Memoization
const MemoizedComponent = React.memo(Component);
```

---

## 🎓 Learning Resources

- [TensorFlow.js Documentation](https://www.tensorflow.org/js)
- [Socket.IO Guide](https://socket.io/docs/v4/)
- [MongoDB Best Practices](https://docs.mongodb.com/manual/administration/production-notes/)
- [React Performance](https://react.dev/learn/render-and-commit)

---

## 💡 Tips & Best Practices

1. **Start Simple**: Use in-memory database for development
2. **Test Locally**: Test all features before deploying
3. **Monitor Performance**: Track AI matching times
4. **Backup Data**: Regular database backups in production
5. **Scale Gradually**: Start with single server, scale as needed
6. **User Feedback**: Collect feedback on AI match accuracy
7. **Iterate**: Continuously improve AI models based on data

---

## 🆘 Getting Help

- **Documentation**: See CAMPUSCONNECT_AI_IMPLEMENTATION.md
- **Issues**: Open GitHub issue with logs and error details
- **Community**: Join our Discord/Slack channel
- **Email**: support@campusconnect.ai

---

**Happy Building! 🚀**
