# Test Data Storage - Quick Guide

## Quick Test (5 minutes)

### Step 1: Start Backend
```bash
cd recoin-find-connect-hub-main/server
npm start
```

Wait for:
```
🚀 CampusConnect AI Backend running on http://localhost:5000
```

### Step 2: Start Frontend (New Terminal)
```bash
cd recoin-find-connect-hub-main
npm run dev
```

Wait for:
```
➜  Local:   http://localhost:8080/
```

### Step 3: Test Lost Item Submission

1. Open browser: http://localhost:8080
2. Login (or skip if already logged in)
3. Click "Lost Items" in navigation
4. Click "Report Item" button
5. Switch to "Lost" tab if not already selected
6. Fill the form:
   ```
   Title: Black Backpack
   Description: Nike backpack with laptop inside
   Category: bags
   Location: Library, 2nd Floor
   Reward: 50
   ```
7. Click "Submit"

**Expected Result**: 
- ✅ Success toast appears
- ✅ Dialog closes
- ✅ Item appears in the list immediately
- ✅ Item shows your name and details

### Step 4: Test Found Item Submission

1. Click "Report Item" button again
2. Switch to "Found" tab
3. Fill the form:
   ```
   Title: Blue Water Bottle
   Description: Stainless steel, blue color
   Category: other
   Location: Cafeteria
   ```
4. Click "Submit"

**Expected Result**:
- ✅ Success toast appears
- ✅ Dialog closes
- ✅ Item appears in the found items list

### Step 5: Verify Backend Storage

Open new terminal:
```bash
# Test backend API directly
curl http://localhost:5000/api/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2026-04-10T...",
  "service": "CampusConnect AI Backend"
}
```

### Step 6: Test Medical Request

1. Click "Medical" in navigation
2. Click "New Request" button
3. Add medicine:
   ```
   Name: Paracetamol 500mg
   Dosage: Twice daily
   Quantity: 10 tablets
   ```
4. Add location: "Campus Hostel"
5. Click "Submit Request"

**Expected Result**:
- ✅ Success notification
- ✅ Request appears in list
- ✅ Status shows "Pending"

## Verify Data Persistence

### Test 1: Refresh Page
1. After adding items, refresh the page (F5)
2. Items should still be visible (loaded from backend)

### Test 2: Check Backend Logs
Look at backend terminal, you should see:
```
POST /api/items/lost 200
POST /api/items/found 200
POST /api/medical 200
```

### Test 3: API Direct Test
```bash
# Create lost item via API
curl -X POST http://localhost:5000/api/items/lost \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Item",
    "description": "Testing API",
    "category": "other",
    "location": "Test Location",
    "date": "2026-04-10",
    "userId": "user_1",
    "userName": "Test User",
    "reward": 0
  }'
```

Should return:
```json
{
  "success": true,
  "item": {
    "id": "lost_...",
    "title": "Test Item",
    ...
  }
}
```

## Common Issues & Solutions

### Issue: "Failed to add lost item"
**Solution**: 
- Check if backend is running on port 5000
- Check browser console for CORS errors
- Verify backend logs for errors

### Issue: Items disappear after server restart
**Solution**: 
This is expected with in-memory storage. To persist:
```bash
# In server/.env, change:
USE_MONGODB=true
```

### Issue: CORS error in browser console
**Solution**:
- Ensure backend is running on port 5000
- Ensure frontend is running on port 8080
- Check `server/.env` has `CORS_ORIGIN=http://localhost:8080`

### Issue: "Not authenticated" error
**Solution**:
- The new implementation doesn't require authentication
- If you see this, clear browser cache and reload

## Success Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can submit lost item
- [ ] Lost item appears in list
- [ ] Can submit found item
- [ ] Found item appears in list
- [ ] Can create medical request
- [ ] Medical request appears in list
- [ ] Items persist after page refresh
- [ ] No errors in browser console
- [ ] No errors in backend logs

## What's Working Now

✅ Lost items storage
✅ Found items storage
✅ Medical requests storage
✅ Data persists during session
✅ Backend API integration
✅ Form validation
✅ Success notifications
✅ Real-time UI updates

## What's NOT Working (Expected)

❌ Data persistence after server restart (use MongoDB for this)
❌ Real-time updates across multiple browsers (use WebSocket for this)
❌ User authentication (simplified for development)

## Next Steps

1. ✅ Test basic functionality (this guide)
2. ⏭️ Test AI image matching
3. ⏭️ Test coin redemption
4. ⏭️ Enable MongoDB for persistence
5. ⏭️ Deploy to production

---

**If all tests pass, your data storage is working correctly! 🎉**
