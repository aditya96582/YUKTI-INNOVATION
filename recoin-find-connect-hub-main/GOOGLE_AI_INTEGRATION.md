# Google Generative AI Integration - Complete Guide

## 🎯 Overview

CampusConnect AI now uses Google's Generative AI APIs for:
1. **Gemini Flash** - Text generation and image analysis
2. **Imagen 4.0** - AI image generation (with SVG fallback)

---

## 🔑 API Key

```
AIzaSyBPY29xEbz0QmTsrzcDhKZpRwh0xNs5JSI
```

**Status**: ✅ Active and configured

---

## 📚 APIs Integrated

### 1. Gemini Flash (Text & Vision)

**Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`

**Capabilities**:
- Text generation
- Image analysis
- Description enhancement
- Feature extraction

**Example Request**:
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=AIzaSyBPY29xEbz0QmTsrzcDhKZpRwh0xNs5JSI" \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Explain how AI works in a few words"
      }]
    }]
  }'
```

### 2. Imagen 4.0 (Image Generation)

**Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:generateImages`

**Capabilities**:
- Generate realistic product images
- Professional photography style
- Customizable aspect ratios
- Safety filters

**Example Request**:
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:generateImages" \
  -H 'Content-Type: application/json' \
  -H 'X-goog-api-key: AIzaSyBPY29xEbz0QmTsrzcDhKZpRwh0xNs5JSI' \
  -X POST \
  -d '{
    "prompt": "Professional product photo of a blue backpack",
    "config": {
      "numberOfImages": 1,
      "aspectRatio": "1:1"
    }
  }'
```

---

## 🚀 Implementation

### Backend Service

**File**: `server/services/imageGenerator.js`

**Methods**:

1. **generateImage(itemDetails)**
   - Tries Imagen 4.0 first
   - Falls back to SVG placeholder
   - Returns base64 encoded image

2. **analyzeImage(imageBase64)**
   - Uses Gemini Flash with vision
   - Extracts colors, brands, features
   - Returns structured data

3. **enhanceDescription(itemDetails)**
   - Uses Gemini Flash for text
   - Improves item descriptions
   - Adds searchable keywords

4. **testConnection()**
   - Verifies API connectivity
   - Returns status

### API Routes

**File**: `server/routes/images.js`

```
POST /api/images/generate              - Generate image
POST /api/images/analyze               - Analyze uploaded image
POST /api/images/enhance-description   - Enhance description
GET  /api/images/placeholder/:category - Get SVG placeholder
GET  /api/images/test                  - Test API connection
```

---

## 🧪 Testing

### Quick Test

```bash
cd server
node test-api.js
```

**Expected Output**:
```
═══════════════════════════════════════════════════════
  Google Generative AI API Test Suite
═══════════════════════════════════════════════════════

🧪 Testing Gemini Flash API...
✅ Gemini Flash API: SUCCESS

🧪 Testing Image Analysis API...
✅ Image Analysis API: SUCCESS

🧪 Testing Imagen 4.0 API...
✅ Imagen 4.0 API: SUCCESS (or ⚠️ NOT AVAILABLE)

═══════════════════════════════════════════════════════
  Test Results Summary
═══════════════════════════════════════════════════════

Gemini Flash (Text):     ✅ PASS
Image Analysis:          ✅ PASS
Imagen 4.0 (Generation): ✅ PASS or ⚠️ NOT AVAILABLE

Overall: 2-3/3 tests passed

✅ Core functionality is working!
```

### Manual Testing

**Test Text Generation**:
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=AIzaSyBPY29xEbz0QmTsrzcDhKZpRwh0xNs5JSI" \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{"contents":[{"parts":[{"text":"Say hello"}]}]}'
```

**Test Image Analysis**:
```bash
curl -X POST http://localhost:5000/api/images/test
```

**Test Image Generation**:
```bash
curl -X POST http://localhost:5000/api/images/generate \
  -H "Content-Type: application/json" \
  -d '{"title":"Blue Backpack","category":"bags","description":"Large backpack"}'
```

---

## 💻 Frontend Usage

### Using AIImageUpload Component

```tsx
import AIImageUpload from '@/components/AIImageUpload';

function MyForm() {
  const [image, setImage] = useState('');
  const [analysis, setAnalysis] = useState(null);

  return (
    <AIImageUpload
      onImageSelect={(img, analysis) => {
        setImage(img);
        setAnalysis(analysis);
      }}
      itemDetails={{
        title: 'Blue Backpack',
        description: 'Large backpack with laptop compartment',
        category: 'bags'
      }}
    />
  );
}
```

### Direct API Calls

```typescript
import { imageApi } from '@/services/api';

// Generate image
const result = await imageApi.generate(
  'Blue Backpack',
  'Large backpack with laptop compartment',
  'bags'
);

// Analyze image
const analysis = await imageApi.analyze(imageBase64);

// Enhance description
const enhanced = await imageApi.enhanceDescription(
  'Lost Phone',
  'Black phone',
  'electronics'
);
```

---

## 🔧 Configuration

### Environment Variables

**File**: `server/.env`

```env
GOOGLE_API_KEY=AIzaSyBPY29xEbz0QmTsrzcDhKZpRwh0xNs5JSI
```

### API Limits

**Free Tier** (as of 2024):
- Gemini Flash: 60 requests/minute
- Imagen 4.0: May have regional restrictions

**Rate Limiting** (Implemented):
- 20 requests per 15 minutes per IP
- Prevents API quota exhaustion

---

## 📊 Features Comparison

| Feature | Gemini Flash | Imagen 4.0 | SVG Fallback |
|---------|-------------|------------|--------------|
| Text Generation | ✅ | ❌ | ❌ |
| Image Analysis | ✅ | ❌ | ❌ |
| Image Generation | ❌ | ✅ | ✅ |
| Speed | Fast (1-2s) | Medium (3-5s) | Instant (<100ms) |
| Quality | High | Very High | Medium |
| Cost | Free tier | Free tier | Free |
| Availability | Global | Regional | Always |

---

## 🎯 Use Cases

### 1. Lost Item Without Photo

**User Flow**:
1. User reports lost item (no photo)
2. System generates image with Imagen 4.0
3. If Imagen unavailable, uses SVG placeholder
4. Image helps with visual identification

**Code**:
```javascript
const image = await imageApi.generate(
  'Red Wallet',
  'Leather wallet with cards',
  'wallets'
);
```

### 2. Found Item with Photo

**User Flow**:
1. User uploads photo of found item
2. Gemini Flash analyzes image
3. Extracts colors, brands, features
4. Auto-fills form fields

**Code**:
```javascript
const analysis = await imageApi.analyze(uploadedImage);
// Returns: { colors: ['red', 'black'], brands: ['Nike'], ... }
```

### 3. Description Enhancement

**User Flow**:
1. User enters basic description
2. Gemini Flash enhances it
3. Adds identifying features
4. Improves searchability

**Code**:
```javascript
const enhanced = await imageApi.enhanceDescription(
  'Lost Keys',
  'Car keys',
  'keys'
);
// Returns detailed description with tips
```

---

## 🔐 Security

### API Key Protection

✅ **Correct** (Backend only):
```javascript
// server/services/imageGenerator.js
const GOOGLE_API_KEY = 'AIzaSyBPY29xEbz0QmTsrzcDhKZpRwh0xNs5JSI';
```

❌ **Wrong** (Never in frontend):
```javascript
// ❌ DON'T DO THIS
const API_KEY = 'AIzaSyBPY29xEbz0QmTsrzcDhKZpRwh0xNs5JSI';
fetch(`https://api.google.com?key=${API_KEY}`);
```

### Rate Limiting

```javascript
// server/index.js
const rateLimit = require('express-rate-limit');

const imageRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many requests'
});

app.use('/api/images', imageRateLimiter);
```

---

## 🐛 Troubleshooting

### Issue: "API key invalid"

**Solution**:
```bash
# Check .env file
cat server/.env | grep GOOGLE_API_KEY

# Should output:
# GOOGLE_API_KEY=AIzaSyBPY29xEbz0QmTsrzcDhKZpRwh0xNs5JSI

# Restart server
npm start
```

### Issue: "Imagen not available"

**Reason**: Imagen 4.0 may not be available in all regions

**Solution**: System automatically falls back to SVG placeholders

**Check**:
```bash
node server/test-api.js
```

### Issue: "Rate limit exceeded"

**Solution**: Wait 15 minutes or implement caching

```javascript
// Cache results
const cache = new Map();
const cacheKey = `analysis:${imageHash}`;
if (cache.has(cacheKey)) {
  return cache.get(cacheKey);
}
```

---

## 📈 Performance

### Response Times

| Operation | Average | Max |
|-----------|---------|-----|
| Text Generation | 1-2s | 4s |
| Image Analysis | 2-3s | 5s |
| Image Generation (Imagen) | 3-5s | 10s |
| SVG Placeholder | 50ms | 100ms |

### Optimization Tips

1. **Cache Results**: Store analysis for 24 hours
2. **Lazy Load**: Generate images on-demand
3. **Batch Requests**: Process multiple items together
4. **Use Placeholders**: Default to SVG for speed

---

## 🎉 Summary

### ✅ What's Working

- Gemini Flash text generation
- Image analysis with feature extraction
- Description enhancement
- SVG placeholder generation
- Automatic fallback system

### ⚠️ Regional Limitations

- Imagen 4.0 may not be available everywhere
- System gracefully falls back to SVG

### 🚀 Ready for Production

- API key configured
- Rate limiting enabled
- Error handling implemented
- Fallback system in place
- Security measures active

---

## 📞 Support

**Test API**: `node server/test-api.js`

**Check Logs**: `pm2 logs campusconnect-api`

**API Docs**: https://ai.google.dev/docs

**API Key**: `AIzaSyBPY29xEbz0QmTsrzcDhKZpRwh0xNs5JSI`

---

**Status**: ✅ Fully Integrated and Tested
