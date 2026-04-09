# AI Image Generation & Analysis Guide

## 🎨 Overview

CampusConnect AI now includes AI-powered image generation and analysis using Google Gemini API. This feature helps users:
- Generate placeholder images for lost items
- Analyze uploaded images to extract details
- Enhance item descriptions with AI
- Improve matching accuracy with visual features

---

## 🔑 API Key Configuration

### Google Gemini API Key
```
AIzaSyBPY29xEbz0QmTsrzcDhKZpRwh0xNs5JSI
```

### Setup

1. **Add to Environment Variables**:
```bash
# server/.env
GOOGLE_API_KEY=AIzaSyBPY29xEbz0QmTsrzcDhKZpRwh0xNs5JSI
```

2. **Verify Configuration**:
```bash
cd server
cat .env | grep GOOGLE_API_KEY
```

---

## 🚀 Features

### 1. Image Generation with Imagen 4.0

**Purpose**: Create realistic images when users don't have photos

**How it works**:
- User provides item details (title, category, description)
- System calls Google Imagen 4.0 API
- Generates professional product photography
- Falls back to SVG placeholder if Imagen unavailable

**API Endpoint**:
```javascript
POST /api/images/generate
{
  "title": "Blue Backpack",
  "description": "Large blue backpack with laptop compartment",
  "category": "bags"
}

Response:
{
  "success": true,
  "image": "data:image/png;base64,...",
  "type": "generated"
}
```

**Imagen Configuration**:
- Model: `imagen-4.0-generate-001`
- Aspect Ratio: 1:1 (square)
- Number of Images: 1
- Safety Filter: Block some
- Person Generation: Don't allow

**Category Colors**:
| Category | Start Color | End Color | Icon |
|----------|------------|-----------|------|
| Electronics | #3B82F6 (Blue) | #1D4ED8 | 📱 |
| Bags | #F59E0B (Amber) | #D97706 | 🎒 |
| Wallets | #10B981 (Green) | #059669 | 👛 |
| Keys | #8B5CF6 (Purple) | #6D28D9 | 🔑 |
| Clothing | #EC4899 (Pink) | #BE185D | 👕 |
| Documents | #EF4444 (Red) | #DC2626 | 📄 |
| Jewelry | #F59E0B (Amber) | #D97706 | 💍 |
| Accessories | #06B6D4 (Cyan) | #0891B2 | ⌚ |
| Other | #6B7280 (Gray) | #4B5563 | 📦 |

---

### 2. Image Analysis

**Purpose**: Extract details from uploaded images using AI

**How it works**:
- User uploads image of lost/found item
- Google Gemini analyzes the image
- Extracts:
  - Item type and description
  - Colors
  - Brands (if visible)
  - Distinctive features
  - Text visible on item

**API Endpoint**:
```javascript
POST /api/images/analyze
{
  "image": "data:image/jpeg;base64,..."
}

Response:
{
  "success": true,
  "description": "A blue backpack with Nike logo, appears to be in good condition...",
  "features": {
    "colors": ["blue", "black"],
    "brands": ["Nike"],
    "keywords": ["backpack", "laptop", "compartment", "zipper"]
  }
}
```

**Use Cases**:
- Auto-fill item description
- Improve AI matching accuracy
- Extract searchable keywords
- Identify brand and model

---

### 3. Description Enhancement

**Purpose**: Improve item descriptions with AI suggestions

**How it works**:
- User provides basic description
- AI enhances with:
  - Physical characteristics
  - Identifying features
  - Common locations
  - Search-friendly keywords

**API Endpoint**:
```javascript
POST /api/images/enhance-description
{
  "title": "Lost Phone",
  "description": "Black phone",
  "category": "electronics"
}

Response:
{
  "success": true,
  "originalDescription": "Black phone",
  "enhancedDescription": "Black smartphone, likely iPhone or Samsung Galaxy model. Check for distinctive features like case color, screen protector, or visible scratches. Commonly found in library study areas, cafeteria tables, or lecture halls. May have personal photos or wallpaper visible on lock screen."
}
```

---

## 💻 Frontend Integration

### Using the AIImageUpload Component

```tsx
import AIImageUpload from '@/components/AIImageUpload';

function LostItemForm() {
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
        description: 'Large backpack',
        category: 'bags'
      }}
    />
  );
}
```

### Features:
- Drag-and-drop upload
- Real-time AI analysis
- Generate placeholder button
- Visual feedback with loading states
- Analysis results display

---

## 🔧 Backend Implementation

### Service: `imageGenerator.js`

**Methods**:

1. **generateImage(itemDetails)**
   - Creates SVG placeholder
   - Returns base64 encoded image

2. **analyzeImage(imageBase64)**
   - Calls Google Gemini API
   - Extracts features and description

3. **enhanceDescription(itemDetails)**
   - Uses AI to improve description
   - Returns enhanced text

4. **generatePlaceholder(itemDetails)**
   - Creates category-specific SVG
   - Includes gradient, icon, title

---

## 📊 API Routes

### Image Routes: `routes/images.js`

```javascript
POST   /api/images/generate              // Generate placeholder
POST   /api/images/analyze               // Analyze uploaded image
POST   /api/images/enhance-description   // Enhance description
GET    /api/images/placeholder/:category // Get placeholder by category
```

---

## 🎯 Integration with AI Matching

### Enhanced Matching with Image Analysis

When a user uploads an image:

1. **Image Analysis** extracts features:
   ```javascript
   {
     colors: ['blue', 'black'],
     brands: ['Nike'],
     keywords: ['backpack', 'laptop', 'zipper']
   }
   ```

2. **AI Matcher** uses features for comparison:
   ```javascript
   // In aiImageMatcher.js
   const visualFeatures = await imageGenerator.analyzeImage(image);
   const matchScore = calculateMatch(lostFeatures, foundFeatures);
   ```

3. **Confidence Boost** for matching features:
   - Same colors: +10% confidence
   - Same brand: +15% confidence
   - Matching keywords: +5% per keyword

---

## 🔐 Security & Privacy

### API Key Protection

**DO NOT** expose API key in frontend:
```javascript
// ❌ WRONG - Never do this
const API_KEY = 'AIzaSyBPY29xEbz0QmTsrzcDhKZpRwh0xNs5JSI';

// ✅ CORRECT - Use backend proxy
const result = await fetch('/api/images/analyze', {
  method: 'POST',
  body: JSON.stringify({ image })
});
```

### Rate Limiting

Implement rate limiting to prevent API abuse:

```javascript
// server/index.js
const rateLimit = require('express-rate-limit');

const imageRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  message: 'Too many image requests, please try again later'
});

app.use('/api/images', imageRateLimiter);
```

---

## 📈 Usage Examples

### Example 1: Lost Item with Generated Image

```javascript
// User creates lost item without photo
const item = {
  title: 'Red Wallet',
  description: 'Leather wallet with cards',
  category: 'wallets'
};

// Generate placeholder
const { image } = await imageApi.generate(
  item.title,
  item.description,
  item.category
);

// Save item with generated image
await itemsApi.createLost({ ...item, image });
```

### Example 2: Found Item with Image Analysis

```javascript
// User uploads photo of found item
const uploadedImage = 'data:image/jpeg;base64,...';

// Analyze image
const analysis = await imageApi.analyze(uploadedImage);

// Pre-fill form with AI suggestions
setFormData({
  title: extractTitle(analysis.description),
  description: analysis.description,
  category: detectCategory(analysis.features),
  colors: analysis.features.colors,
  brands: analysis.features.brands
});
```

### Example 3: Enhanced Description

```javascript
// User enters basic description
const basic = {
  title: 'Lost Keys',
  description: 'Car keys',
  category: 'keys'
};

// Enhance with AI
const { enhancedDescription } = await imageApi.enhanceDescription(
  basic.title,
  basic.description,
  basic.category
);

// Result: "Car keys with keychain, likely Toyota or Honda key fob. 
// Check for distinctive keychain accessories like photos, charms, or 
// company logos. Commonly found in parking lots, cafeteria, or gym 
// locker areas. May have remote lock/unlock buttons."
```

---

## 🧪 Testing

### Test Image Generation

```bash
# Test with Imagen (if available)
curl -X POST http://localhost:5000/api/images/generate \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Blue Backpack",
    "description": "Large backpack with laptop compartment",
    "category": "bags"
  }'

# Test API connection
curl http://localhost:5000/api/images/test
```

### Test Image Analysis (Gemini Flash)

```bash
# First, convert image to base64
base64 image.jpg > image.txt

# Then send to API
curl -X POST http://localhost:5000/api/images/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/jpeg;base64,<paste base64 here>"
  }'
```

### Test Description Enhancement

```bash
curl -X POST http://localhost:5000/api/images/enhance-description \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Lost Phone",
    "description": "Black phone",
    "category": "electronics"
  }'
```

---

## 📊 Performance Metrics

### Expected Response Times

| Operation | Average Time | Max Time |
|-----------|-------------|----------|
| Generate Placeholder | 50ms | 100ms |
| Analyze Image | 2-3s | 5s |
| Enhance Description | 1-2s | 4s |

### API Quotas (Google Gemini)

- **Free Tier**: 60 requests per minute
- **Rate Limit**: Implement client-side throttling
- **Caching**: Cache analysis results for 24 hours

---

## 🔮 Future Enhancements

### Planned Features

1. **Real Image Generation**
   - Integrate DALL-E or Stable Diffusion
   - Generate realistic item images from descriptions

2. **Advanced Analysis**
   - Object detection with bounding boxes
   - Similar image search
   - Duplicate detection

3. **Multi-language Support**
   - Analyze images in multiple languages
   - Translate descriptions

4. **Batch Processing**
   - Analyze multiple images at once
   - Bulk placeholder generation

---

## 🆘 Troubleshooting

### Common Issues

**Issue**: "API key invalid"
```bash
# Solution: Check .env file
cat server/.env | grep GOOGLE_API_KEY

# Restart server
npm start
```

**Issue**: "Image analysis timeout"
```javascript
// Solution: Increase timeout
const response = await fetch(url, {
  timeout: 10000 // 10 seconds
});
```

**Issue**: "Rate limit exceeded"
```javascript
// Solution: Implement caching
const cacheKey = `analysis:${imageHash}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);
```

---

## 📞 Support

For issues or questions:
- Check server logs: `pm2 logs campusconnect-api`
- Test API directly: Use Postman or curl
- Review Google Gemini docs: https://ai.google.dev/docs

---

**API Key**: `AIzaSyBPY29xEbz0QmTsrzcDhKZpRwh0xNs5JSI`

**Status**: ✅ Active and ready to use
