# 🚀 CampusConnect AI - Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

## Installation

### 1. Install Frontend Dependencies
```bash
cd recoin-find-connect-hub-main
npm install
```

### 2. Install Backend Dependencies
```bash
cd server
npm install
```

## Running the Application

### Option 1: Manual Start (Recommended for Development)

#### Terminal 1 - Start Backend
```bash
cd recoin-find-connect-hub-main/server
npm start
```

You should see:
```
🚀 CampusConnect AI Backend running on http://localhost:5000
🔌 WebSocket server ready for real-time notifications
```

#### Terminal 2 - Start Frontend
```bash
cd recoin-find-connect-hub-main
npm run dev
```

You should see:
```
VITE ready in XXX ms
➜  Local:   http://localhost:8080/
```

### Option 2: Using Install Scripts

#### Windows
```bash
cd recoin-find-connect-hub-main
install.bat
```

#### Linux/Mac
```bash
cd recoin-find-connect-hub-main
chmod +x install.sh
./install.sh
```

## Accessing the Application

1. **Frontend**: Open http://localhost:8080 in your browser
2. **Backend API**: http://localhost:5000/api/health
3. **API Documentation**: See `BACKEND_FRONTEND_INTEGRATION_STATUS.md`

## Default Test Account

```
Email: arjun.mehta@iitd.ac.in
Password: password123
```

## Testing Features

### 1. Medical Connect
- Go to Medical page
- Click "New Request"
- Upload prescription image (optional)
- Click "Scan Prescription" to test OCR
- Add medicines manually or use extracted ones
- Submit request

### 2. Lost & Found
- Go to Lost Items page
- Click "Report Lost Item"
- Fill form (all fields visible, submit button fixed)
- Upload image
- Submit

### 3. Image Generation (Google Gemini)
- Test endpoint: http://localhost:5000/api/images/test
- Or use AIImageUpload component in the app

### 4. Coin Redemption
- Go to Rewards page
- View available partners
- Redeem coins for real-world value

## API Testing

### Using curl

```bash
# Health check
curl http://localhost:5000/api/health

# Get pharmacies
curl http://localhost:5000/api/pharmacies

# Get medical requests
curl http://localhost:5000/api/medical

# Test image generation
curl http://localhost:5000/api/images/test
```

### Using the Test Script

```bash
cd recoin-find-connect-hub-main/server
node test-api.js
```

## Troubleshooting

### Backend won't start
1. Check if port 5000 is available
2. Verify .env file exists in server folder
3. Check Node.js version (18+ required)

### Frontend won't start
1. Check if port 8080 is available
2. Run `npm install` again
3. Clear node_modules and reinstall

### TensorFlow Warning
```
⚠️  TensorFlow.js not available. AI image matching will use fallback mode.
```
This is normal on Windows. The app works fine with fallback mode.

To enable full AI (optional):
```bash
cd server
npm rebuild @tensorflow/tfjs-node --build-addon-from-source
```

### CORS Errors
- Ensure backend is running on port 5000
- Ensure frontend is running on port 8080
- Check CORS_ORIGIN in server/.env

## Environment Configuration

### Backend (.env)
Located at: `recoin-find-connect-hub-main/server/.env`

Key settings:
```env
PORT=5000
GOOGLE_API_KEY=AIzaSyBPY29xEbz0QmTsrzcDhKZpRwh0xNs5JSI
USE_MONGODB=false  # Set to true for production
```

### Frontend
No .env needed for development. Uses default localhost:5000 for API.

## Features to Test

### ✅ Working Features
- [x] User authentication
- [x] Medical prescription scanning (OCR)
- [x] Pharmacy matching
- [x] Lost & Found item reporting
- [x] AI image matching (fallback mode)
- [x] Coin redemption system
- [x] Real-time notifications (WebSocket)
- [x] Image generation (Google Gemini)
- [x] Trust rating system
- [x] QR code generation

### 🎨 UI Features
- [x] Glassmorphism design
- [x] Amber Intelligence Dark theme
- [x] Framer Motion animations
- [x] Responsive layout
- [x] Dark mode

## Development Tips

### Hot Reload
Both frontend and backend support hot reload:
- Frontend: Vite automatically reloads on file changes
- Backend: Restart server manually after changes

### Debugging
- Frontend: Open browser DevTools (F12)
- Backend: Check terminal output for logs
- API: Use browser Network tab or Postman

### Database
Currently using in-memory database (data resets on restart).

To use MongoDB:
1. Install MongoDB
2. Set `USE_MONGODB=true` in server/.env
3. Update `MONGODB_URI` if needed

## Project Structure

```
recoin-find-connect-hub-main/
├── src/                    # Frontend source
│   ├── pages/             # Page components
│   ├── components/        # Reusable components
│   ├── contexts/          # React contexts
│   └── services/          # API services
├── server/                # Backend
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── config/           # Configuration
│   └── data/             # Database
└── public/               # Static assets
```

## Documentation

- `BACKEND_FRONTEND_INTEGRATION_STATUS.md` - Complete status report
- `PLATFORM_ANALYSIS.md` - Platform vision and features
- `IMAGE_GENERATION_GUIDE.md` - Image generation setup
- `GOOGLE_AI_INTEGRATION.md` - Google AI integration details
- `SETUP_GUIDE.md` - Detailed setup instructions

## Support

For issues or questions:
1. Check documentation files
2. Review error messages in terminal
3. Check browser console for frontend errors
4. Verify all dependencies are installed

## Next Steps

1. ✅ Start both servers
2. ✅ Test basic features
3. ✅ Create test account
4. ✅ Report lost/found items
5. ✅ Test medical requests
6. ✅ Try image generation
7. ✅ Test coin redemption

---

**Happy Coding! 🎉**

The platform is ready for development and testing. All critical issues have been resolved.
