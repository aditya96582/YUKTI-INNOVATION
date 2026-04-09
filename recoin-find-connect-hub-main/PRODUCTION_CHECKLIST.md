# CampusConnect AI - Production Deployment Checklist

## 🚀 Pre-Deployment Checklist

Use this checklist to ensure your CampusConnect AI deployment is production-ready.

---

## 📋 PHASE 1: Environment Setup

### Backend Configuration

- [ ] **MongoDB Setup**
  ```bash
  # Install MongoDB
  # Ubuntu/Debian
  sudo apt-get install mongodb
  
  # macOS
  brew install mongodb-community
  
  # Or use MongoDB Atlas (cloud)
  # https://www.mongodb.com/cloud/atlas
  ```

- [ ] **Environment Variables**
  ```bash
  cd server
  cp .env.example .env
  
  # Edit .env and set:
  USE_MONGODB=true
  MONGODB_URI=mongodb://your-host:27017/campusconnect
  NODE_ENV=production
  JWT_SECRET=your-secure-random-string-here
  ```

- [ ] **Install Production Dependencies**
  ```bash
  cd server
  npm install --production
  ```

- [ ] **Test Database Connection**
  ```bash
  npm start
  # Look for: "✅ Connected to MongoDB"
  ```

### Frontend Configuration

- [ ] **Build for Production**
  ```bash
  npm run build
  # Output in dist/
  ```

- [ ] **Test Production Build**
  ```bash
  npm run preview
  ```

- [ ] **Configure API URL**
  ```bash
  # Create .env.production
  VITE_API_URL=https://api.yourdomain.com
  VITE_WS_URL=wss://api.yourdomain.com
  ```

---

## 🔐 PHASE 2: Security

### Authentication & Authorization

- [ ] **Implement JWT Authentication**
  ```javascript
  // Add to server/middleware/auth.js
  const jwt = require('jsonwebtoken');
  
  module.exports = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };
  ```

- [ ] **Add Rate Limiting**
  ```bash
  npm install express-rate-limit
  ```
  ```javascript
  // Add to server/index.js
  const rateLimit = require('express-rate-limit');
  
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  
  app.use('/api/', limiter);
  ```

- [ ] **Input Validation**
  ```bash
  npm install joi
  ```
  ```javascript
  // Add validation to routes
  const Joi = require('joi');
  
  const itemSchema = Joi.object({
    title: Joi.string().required().max(100),
    description: Joi.string().required().max(500),
    category: Joi.string().required(),
    // ... more fields
  });
  ```

- [ ] **Sanitize User Input**
  ```bash
  npm install express-mongo-sanitize
  npm install helmet
  ```
  ```javascript
  const mongoSanitize = require('express-mongo-sanitize');
  const helmet = require('helmet');
  
  app.use(helmet());
  app.use(mongoSanitize());
  ```

### SSL/TLS Configuration

- [ ] **Obtain SSL Certificate**
  ```bash
  # Using Let's Encrypt (free)
  sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
  ```

- [ ] **Configure HTTPS**
  ```javascript
  // server/index.js
  const https = require('https');
  const fs = require('fs');
  
  const options = {
    key: fs.readFileSync('/path/to/privkey.pem'),
    cert: fs.readFileSync('/path/to/fullchain.pem')
  };
  
  https.createServer(options, app).listen(443);
  ```

- [ ] **Force HTTPS Redirect**
  ```javascript
  app.use((req, res, next) => {
    if (req.protocol === 'http') {
      res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
  ```

---

## 🔧 PHASE 3: Performance Optimization

### Backend Optimization

- [ ] **Enable Compression**
  ```bash
  npm install compression
  ```
  ```javascript
  const compression = require('compression');
  app.use(compression());
  ```

- [ ] **Add Caching**
  ```bash
  npm install redis
  ```
  ```javascript
  const redis = require('redis');
  const client = redis.createClient();
  
  // Cache AI match results
  const cacheKey = `match:${lostItemId}`;
  const cached = await client.get(cacheKey);
  if (cached) return JSON.parse(cached);
  ```

- [ ] **Database Indexing**
  ```javascript
  // Add to database.js
  LostItemSchema.index({ userId: 1, status: 1 });
  LostItemSchema.index({ category: 1, location: 1 });
  MatchSchema.index({ confidence: -1 });
  MatchSchema.index({ lostItemId: 1, foundItemId: 1 });
  ```

- [ ] **Image Optimization**
  ```javascript
  // Resize images before storing
  const sharp = require('sharp');
  
  const optimized = await sharp(imageBuffer)
    .resize(800, 800, { fit: 'inside' })
    .jpeg({ quality: 80 })
    .toBuffer();
  ```

### Frontend Optimization

- [ ] **Code Splitting**
  ```javascript
  // Use React.lazy for route-based splitting
  const LostItems = lazy(() => import('./pages/LostItems'));
  const Medical = lazy(() => import('./pages/Medical'));
  ```

- [ ] **Image Lazy Loading**
  ```jsx
  <img src={image} loading="lazy" alt="..." />
  ```

- [ ] **Bundle Analysis**
  ```bash
  npm run build -- --analyze
  ```

---

## 📊 PHASE 4: Monitoring & Logging

### Logging Setup

- [ ] **Install Winston**
  ```bash
  npm install winston
  ```
  ```javascript
  // server/config/logger.js
  const winston = require('winston');
  
  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' })
    ]
  });
  
  module.exports = logger;
  ```

- [ ] **Add Request Logging**
  ```bash
  npm install morgan
  ```
  ```javascript
  const morgan = require('morgan');
  app.use(morgan('combined'));
  ```

### Monitoring Setup

- [ ] **Health Check Endpoint**
  ```javascript
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: Date.now(),
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  });
  ```

- [ ] **Error Tracking** (Optional: Sentry)
  ```bash
  npm install @sentry/node
  ```
  ```javascript
  const Sentry = require('@sentry/node');
  Sentry.init({ dsn: 'your-sentry-dsn' });
  ```

---

## 🚀 PHASE 5: Deployment

### Option 1: Docker Deployment

- [ ] **Create Dockerfile**
  ```dockerfile
  # server/Dockerfile
  FROM node:18-alpine
  WORKDIR /app
  COPY package*.json ./
  RUN npm install --production
  COPY . .
  EXPOSE 5000
  CMD ["npm", "start"]
  ```

- [ ] **Create docker-compose.yml**
  ```yaml
  version: '3.8'
  services:
    backend:
      build: ./server
      ports:
        - "5000:5000"
      environment:
        - MONGODB_URI=mongodb://mongo:27017/campusconnect
      depends_on:
        - mongo
    
    mongo:
      image: mongo:6
      volumes:
        - mongo-data:/data/db
    
    frontend:
      build: .
      ports:
        - "80:80"
  
  volumes:
    mongo-data:
  ```

- [ ] **Deploy with Docker**
  ```bash
  docker-compose up -d
  ```

### Option 2: PM2 Deployment

- [ ] **Install PM2**
  ```bash
  npm install -g pm2
  ```

- [ ] **Create ecosystem.config.js**
  ```javascript
  module.exports = {
    apps: [{
      name: 'campusconnect-api',
      script: './server/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    }]
  };
  ```

- [ ] **Start with PM2**
  ```bash
  pm2 start ecosystem.config.js
  pm2 save
  pm2 startup
  ```

### Option 3: Cloud Platform

#### Heroku

- [ ] **Create Heroku App**
  ```bash
  heroku create campusconnect-api
  heroku addons:create mongolab
  ```

- [ ] **Deploy**
  ```bash
  git push heroku main
  ```

#### AWS

- [ ] **Set up Elastic Beanstalk**
  ```bash
  eb init
  eb create campusconnect-production
  eb deploy
  ```

#### Vercel (Frontend)

- [ ] **Deploy Frontend**
  ```bash
  vercel deploy --prod
  ```

---

## 🔌 PHASE 6: Partner Integration

### E-commerce Partners

- [ ] **Amazon Gift Cards**
  ```bash
  # Get API credentials from Amazon
  # https://developer.amazon.com/
  ```
  ```env
  AMAZON_API_KEY=your_key
  AMAZON_API_SECRET=your_secret
  ```

- [ ] **Flipkart Vouchers**
  ```bash
  # Get API credentials from Flipkart
  # https://seller.flipkart.com/api-docs
  ```

### Campus Partners

- [ ] **Jan Aushadhi Kendra**
  - Contact local pharmacy
  - Set up voucher system
  - Configure API endpoint

- [ ] **Campus Canteen**
  - Integrate with POS system
  - Set up QR code redemption
  - Configure menu items

---

## 📱 PHASE 7: Mobile App (Optional)

### React Native Setup

- [ ] **Initialize React Native**
  ```bash
  npx react-native init CampusConnectMobile
  ```

- [ ] **Install Dependencies**
  ```bash
  npm install socket.io-client axios
  npm install @react-navigation/native
  ```

- [ ] **Configure API**
  ```javascript
  const API_URL = 'https://api.yourdomain.com';
  const socket = io(API_URL);
  ```

### Push Notifications

- [ ] **Firebase Setup**
  ```bash
  npm install @react-native-firebase/app
  npm install @react-native-firebase/messaging
  ```

- [ ] **Configure FCM**
  ```javascript
  // Get FCM token
  const token = await messaging().getToken();
  
  // Send to backend
  await fetch(`${API_URL}/users/${userId}/push-token`, {
    method: 'POST',
    body: JSON.stringify({ token })
  });
  ```

---

## 🧪 PHASE 8: Testing

### Backend Tests

- [ ] **Install Testing Framework**
  ```bash
  npm install --save-dev jest supertest
  ```

- [ ] **Write API Tests**
  ```javascript
  // server/__tests__/items.test.js
  const request = require('supertest');
  const app = require('../index');
  
  describe('Items API', () => {
    test('POST /api/items/lost', async () => {
      const response = await request(app)
        .post('/api/items/lost')
        .send({ title: 'Test Item', ... });
      expect(response.status).toBe(200);
    });
  });
  ```

- [ ] **Run Tests**
  ```bash
  npm test
  ```

### Frontend Tests

- [ ] **Install Testing Library**
  ```bash
  npm install --save-dev @testing-library/react
  ```

- [ ] **Write Component Tests**
  ```javascript
  import { render, screen } from '@testing-library/react';
  import Medical from './pages/Medical';
  
  test('renders medical page', () => {
    render(<Medical />);
    expect(screen.getByText(/Medical Connect/i)).toBeInTheDocument();
  });
  ```

---

## 📊 PHASE 9: Analytics

### Google Analytics

- [ ] **Add GA4**
  ```javascript
  // Add to index.html
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
  ```

### Custom Analytics

- [ ] **Track Key Events**
  ```javascript
  // Track AI matches
  analytics.track('ai_match_found', {
    confidence: 98.5,
    itemId: 'lost_123'
  });
  
  // Track redemptions
  analytics.track('coin_redeemed', {
    partnerId: 'amazon',
    amount: 100
  });
  ```

---

## 🎯 PHASE 10: Launch

### Pre-Launch

- [ ] **Final Security Audit**
- [ ] **Load Testing**
  ```bash
  npm install -g artillery
  artillery quick --count 100 --num 10 https://api.yourdomain.com/api/health
  ```
- [ ] **Backup Strategy**
  ```bash
  # Set up automated MongoDB backups
  mongodump --uri="mongodb://..." --out=/backups/$(date +%Y%m%d)
  ```
- [ ] **Documentation Review**
- [ ] **Team Training**

### Launch Day

- [ ] **Deploy to Production**
- [ ] **Monitor Logs**
  ```bash
  pm2 logs campusconnect-api
  ```
- [ ] **Check Health Endpoints**
  ```bash
  curl https://api.yourdomain.com/api/health
  ```
- [ ] **Test Critical Flows**
  - User registration
  - Item upload
  - AI matching
  - Coin redemption
- [ ] **Monitor Performance**
  - Response times
  - Error rates
  - Database connections

### Post-Launch

- [ ] **User Feedback Collection**
- [ ] **Performance Monitoring**
- [ ] **Bug Tracking**
- [ ] **Feature Requests**
- [ ] **Regular Updates**

---

## 📞 Support Contacts

### Emergency Contacts

- **DevOps**: devops@yourdomain.com
- **Backend**: backend@yourdomain.com
- **Frontend**: frontend@yourdomain.com
- **On-Call**: +1-XXX-XXX-XXXX

### Monitoring Dashboards

- **Server Status**: https://status.yourdomain.com
- **Analytics**: https://analytics.yourdomain.com
- **Logs**: https://logs.yourdomain.com

---

## ✅ Final Checklist

Before going live, ensure ALL items are checked:

**Security:**
- [ ] HTTPS enabled
- [ ] Authentication implemented
- [ ] Rate limiting active
- [ ] Input validation
- [ ] Environment variables secured

**Performance:**
- [ ] Caching enabled
- [ ] Database indexed
- [ ] Images optimized
- [ ] Code minified

**Monitoring:**
- [ ] Logging configured
- [ ] Health checks active
- [ ] Error tracking setup
- [ ] Analytics integrated

**Deployment:**
- [ ] Production environment configured
- [ ] Database backed up
- [ ] SSL certificates valid
- [ ] DNS configured

**Testing:**
- [ ] All tests passing
- [ ] Load testing completed
- [ ] Security audit done
- [ ] User acceptance testing

---

## 🎉 You're Ready to Launch!

Once all items are checked, your CampusConnect AI platform is production-ready and can serve thousands of users with AI-powered matching, real-world coin redemption, and intelligent automation.

**Good luck with your launch! 🚀**
