# Debug Data Storage Issues

## Quick Diagnosis

### Step 1: Check if Backend is Running

Open terminal and run:
```bash
curl http://localhost:5000/api/health
```

**Expected Output:**
```json
{
  "status": "ok",
  "timestamp": "2026-04-10T...",
  "service": "CampusConnect AI Backend"
}
```

**If you get an error:**
- Backend is not running
- Start it: `cd server && npm start`

### Step 2: Test Backend API Directly

Run the test script:
```bash
cd recoin-find-connect-hub-main
node test-backend.js
```

This will test all API endpoints and show you exactly what's working and what's not.

### Step 3: Check Browser Console

1. Open your app in browser (http://localhost:8080)
2. Press F12 to open DevTools
3. Go to Console tab
4. Try to submit a lost item
5. Look for errors

**Common Errors:**

#### CORS Error
```
Access to fetch at 'http://localhost:5000/api/items/lost' from origin 'http://localhost:8080' 
has been blocked by CORS policy
```

**Solution:**
- Check `server/.env` has `CORS_ORIGIN=http://localhost:8080`
- Restart backend server

#### Network Error
```
Failed to fetch
```

**Solution:**
- Backend is not running
- Check if port 5000 is in use
- Start backend: `cd server && npm start`

#### 404 Not Found
```
POST http://localhost:5000/api/items/lost 404 (Not Found)
```

**Solution:**
- Backend routes not loaded
- Check `server/index.js` has `app.use('/api/items', itemRoutes)`
- Restart backend

### Step 4: Check Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Try to submit a lost item
4. Look for the POST request to `/api/items/lost`

**What to check:**
- Status Code: Should be 200
- Response: Should have `"success": true`
- Request Payload: Should have your form data

### Step 5: Check Backend Logs

Look at the terminal where backend is running.

**You should see:**
```
POST /api/items/lost 200
```

**If you see errors:**
- Read the error message
- Check if database is initialized
- Check if routes are loaded

## Manual API Test

### Test Lost Item Creation

```bash
curl -X POST http://localhost:5000/api/items/lost \
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

**Expected Response:**
```json
{
  "success": true,
  "item": {
    "id": "lost_1712745600000",
    "title": "Test Item",
    "description": "Test description",
    "category": "other",
    "location": "Test location",
    "date": "2026-04-10",
    "userId": "user_1",
    "userName": "Test User",
    "reward": 0,
    "status": "active",
    "createdAt": "2026-04-10T..."
  }
}
```

### Test Get Lost Items

```bash
curl http://localhost:5000/api/items/lost
```

**Expected Response:**
```json
{
  "success": true,
  "items": [
    {
      "id": "lost_1712745600000",
      "title": "Test Item",
      ...
    }
  ]
}
```

## Common Issues & Solutions

### Issue 1: Items Not Appearing After Submit

**Symptoms:**
- Form submits successfully
- No error messages
- Items don't appear in list

**Debug Steps:**
1. Check browser console for errors
2. Check Network tab - is POST request successful?
3. Check if GET request is being made after POST
4. Check backend logs - is data being stored?

**Solution:**
- If POST succeeds but GET fails: Backend GET endpoint issue
- If POST fails silently: Check error handling in frontend
- If data not persisting: Check backend storage (db.js)

### Issue 2: CORS Errors

**Symptoms:**
```
Access to fetch ... has been blocked by CORS policy
```

**Solution:**
```bash
# Check server/.env
CORS_ORIGIN=http://localhost:8080

# Restart backend
cd server
npm start
```

### Issue 3: Backend Not Receiving Requests

**Symptoms:**
- No logs in backend terminal
- Network tab shows request pending

**Debug:**
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Check if port is in use
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Mac/Linux
```

**Solution:**
- Start backend if not running
- Kill process using port 5000 if needed
- Use different port in .env

### Issue 4: Data Disappears After Page Refresh

**Symptoms:**
- Items appear after submit
- Disappear after refresh

**Cause:**
- Frontend state not loading from backend
- Backend not storing data

**Solution:**
1. Check if `loadData()` is being called in ItemContext
2. Check if GET endpoints return data
3. Verify backend storage is working

### Issue 5: Authentication Errors

**Symptoms:**
```
Error: Not authenticated
```

**Solution:**
The new implementation doesn't require authentication. If you see this:
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Check if old Supabase code is still running

## Verification Checklist

Run through this checklist:

- [ ] Backend is running on port 5000
- [ ] Frontend is running on port 8080
- [ ] Health check returns success: `curl http://localhost:5000/api/health`
- [ ] Can create lost item via curl
- [ ] Can get lost items via curl
- [ ] Browser console shows no errors
- [ ] Network tab shows POST request succeeds (200)
- [ ] Network tab shows GET request after POST
- [ ] Backend logs show POST and GET requests
- [ ] Items appear in UI after submit

## Still Not Working?

### Collect Debug Information

1. **Backend Logs:**
   - Copy everything from backend terminal
   
2. **Browser Console:**
   - Copy all errors from console
   
3. **Network Tab:**
   - Right-click on failed request
   - Copy as cURL
   
4. **Test Script Output:**
   ```bash
   node test-backend.js > test-output.txt 2>&1
   ```

### Reset Everything

```bash
# Stop all servers (Ctrl+C)

# Clear node_modules and reinstall
cd recoin-find-connect-hub-main
rm -rf node_modules
npm install

cd server
rm -rf node_modules
npm install

# Start fresh
cd ..
cd server
npm start

# New terminal
cd recoin-find-connect-hub-main
npm run dev
```

## Quick Fix Commands

```bash
# Test backend health
curl http://localhost:5000/api/health

# Test create lost item
curl -X POST http://localhost:5000/api/items/lost \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Test","category":"other","location":"Test","date":"2026-04-10","userId":"user_1","userName":"Test","reward":0}'

# Test get lost items
curl http://localhost:5000/api/items/lost

# Run full test suite
node test-backend.js

# Check what's using port 5000 (Windows)
netstat -ano | findstr :5000

# Check what's using port 5000 (Mac/Linux)
lsof -i :5000
```

---

**If you're still having issues after following this guide, the test-backend.js output will show exactly where the problem is.**
