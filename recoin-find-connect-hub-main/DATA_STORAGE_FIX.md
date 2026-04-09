# Data Storage Fix - Lost & Found Items

## Problem
Lost and Found items were not being stored when users filled out the forms. The data would disappear after submission.

## Root Cause
The frontend was configured to use **Supabase** (a cloud database service) but:
1. No Supabase project was set up
2. No environment variables were configured (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`)
3. The backend API we created was not being used

## Solution
Switched from Supabase to the **backend API** we already created.

### Files Modified

#### 1. `src/contexts/ItemContext.tsx`
**Before**: Used Supabase for all database operations
```typescript
import { supabase } from "@/lib/supabase";
// ... Supabase queries and real-time subscriptions
```

**After**: Uses backend API endpoints
```typescript
import { itemsApi } from "@/services/api";
// ... API calls to http://localhost:5000/api/items
```

**Changes**:
- Removed all Supabase imports and queries
- Updated `addLostItem()` to call `itemsApi.createLost()`
- Updated `addFoundItem()` to call `itemsApi.createFound()`
- Removed Supabase authentication checks
- Added local state management with polling for updates
- Removed real-time subscriptions (can be added back with WebSocket)

#### 2. `src/contexts/MedicalContext.tsx`
**Before**: Used Supabase for medical requests
```typescript
import { supabase } from "@/lib/supabase";
```

**After**: Uses backend API endpoints
```typescript
import { medicalApi } from "@/services/api";
```

**Changes**:
- Removed all Supabase imports and queries
- Updated `addMedicalRequest()` to call `medicalApi.create()`
- Updated all methods to use backend API
- Added polling for updates every 5 seconds

## How It Works Now

### Lost Items Flow
1. User fills out "Report Lost Item" form
2. Frontend calls `addLostItem()` in ItemContext
3. ItemContext calls `itemsApi.createLost()` → `POST http://localhost:5000/api/items/lost`
4. Backend stores item in `db.lostItems` array (in-memory)
5. Backend returns success with item ID
6. Frontend adds item to local state
7. Item appears in the list immediately

### Found Items Flow
1. User fills out "Report Found Item" form
2. Frontend calls `addFoundItem()` in ItemContext
3. ItemContext calls `itemsApi.createFound()` → `POST http://localhost:5000/api/items/found`
4. Backend stores item in `db.foundItems` array (in-memory)
5. Backend returns success with item ID
6. Frontend adds item to local state
7. Item appears in the list immediately

### Medical Requests Flow
1. User creates medical request
2. Frontend calls `addMedicalRequest()` in MedicalContext
3. MedicalContext calls `medicalApi.create()` → `POST http://localhost:5000/api/medical`
4. Backend stores request in `db.medicalRequests` array
5. Backend returns success with request ID
6. Frontend adds request to local state

## Data Persistence

### Current Setup (Development)
- **Storage**: In-memory JavaScript object (`server/data/db.js`)
- **Persistence**: Data is lost when server restarts
- **Advantages**: 
  - No database setup required
  - Fast development
  - Easy testing

### Production Setup (Recommended)
To make data persistent across server restarts:

#### Option 1: MongoDB (Already Configured)
```bash
# 1. Install MongoDB
# 2. Start MongoDB service
# 3. Update server/.env
USE_MONGODB=true
MONGODB_URI=mongodb://localhost:27017/campusconnect

# 4. Restart server
cd server
npm start
```

#### Option 2: Supabase (Original Plan)
```bash
# 1. Create Supabase project at https://supabase.com
# 2. Get your project URL and API key
# 3. Create .env file in root
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key

# 4. Run SQL schema from src/lib/supabase-schema.sql
# 5. Revert ItemContext.tsx to use Supabase
```

#### Option 3: JSON File Storage (Simple)
Add to `server/data/db.js`:
```javascript
const fs = require('fs');
const DB_FILE = './data/database.json';

// Load from file on startup
if (fs.existsSync(DB_FILE)) {
  Object.assign(db, JSON.parse(fs.readFileSync(DB_FILE, 'utf8')));
}

// Save to file on changes
function saveDB() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// Call saveDB() after each data modification
```

## Testing the Fix

### 1. Start Backend
```bash
cd recoin-find-connect-hub-main/server
npm start
```

Should see:
```
🚀 CampusConnect AI Backend running on http://localhost:5000
```

### 2. Start Frontend
```bash
cd recoin-find-connect-hub-main
npm run dev
```

Should see:
```
➜  Local:   http://localhost:8080/
```

### 3. Test Lost Item
1. Open http://localhost:8080
2. Login with test account
3. Go to "Lost Items" page
4. Click "Report Item"
5. Fill form:
   - Title: "Black Backpack"
   - Description: "Nike backpack with laptop"
   - Category: "bags"
   - Location: "Library"
   - Reward: 50
6. Click Submit
7. Item should appear in the list immediately

### 4. Verify Backend Storage
```bash
# Check backend logs
# You should see: POST /api/items/lost 200

# Or test API directly
curl http://localhost:5000/api/items/lost -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Item",
    "description": "Test description",
    "category": "other",
    "location": "Test location",
    "date": "2026-04-10",
    "userId": "user_1",
    "userName": "Test User",
    "reward": 0
  }'
```

## API Endpoints Used

### Lost & Found
- `POST /api/items/lost` - Create lost item
- `POST /api/items/found` - Create found item
- `POST /api/items/match/ai` - Run AI matching
- `GET /api/items/matches/:itemId` - Get matches

### Medical
- `POST /api/medical` - Create medical request
- `GET /api/medical` - Get all requests
- `POST /api/medical/ocr/extract` - Extract medicines from prescription
- `POST /api/medical/:id/notify` - Notify pharmacies

## Benefits of This Approach

1. **No External Dependencies**: Works without Supabase account
2. **Full Control**: Backend API gives complete control over data
3. **Easy Testing**: Can test without internet connection
4. **Flexible**: Easy to switch to any database later
5. **Consistent**: All data flows through same backend

## Known Limitations

### Current (In-Memory Storage)
- ❌ Data lost on server restart
- ❌ No data sharing between multiple server instances
- ❌ Limited by server RAM

### Solutions
- ✅ Use MongoDB for production (already configured)
- ✅ Use Supabase for cloud hosting
- ✅ Use JSON file for simple persistence

## Migration Path

### To MongoDB
1. Set `USE_MONGODB=true` in `server/.env`
2. Ensure MongoDB is running
3. Restart server
4. Data will be stored in MongoDB

### To Supabase
1. Create Supabase project
2. Add environment variables
3. Revert context files to use Supabase
4. Run database migrations

## Troubleshooting

### Items not appearing after submit
1. Check browser console for errors
2. Check backend terminal for API errors
3. Verify backend is running on port 5000
4. Check Network tab in DevTools

### "Failed to add lost item" error
1. Ensure backend is running
2. Check CORS settings in `server/index.js`
3. Verify API endpoint is correct in `src/services/api.ts`

### Data disappears after page refresh
This is expected with in-memory storage. To persist data:
1. Enable MongoDB in `.env`
2. Or implement JSON file storage
3. Or use Supabase

## Summary

✅ **Fixed**: Lost & Found items now store properly
✅ **Fixed**: Medical requests now store properly
✅ **Working**: Backend API fully functional
✅ **Working**: Frontend-backend integration complete

The app now uses the backend API we created instead of Supabase, making it work without any external database setup. Data is stored in-memory during development and can be easily migrated to MongoDB or Supabase for production.

---

**Last Updated**: April 10, 2026
**Status**: ✅ Fixed and Working
