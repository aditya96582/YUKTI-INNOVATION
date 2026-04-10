/**
 * AI Image Generation Service
 * Uses Google Gemini API for image analysis and generation
 */

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

class ImageGeneratorService {
  /**
   * Generate image using Gemini 2.0 Flash (native image generation)
   * Falls back to enhanced SVG placeholder if API unavailable
   */
  async generateImage(itemDetails) {
    const { title, description, category } = itemDetails;

    // First try Gemini native image generation
    try {
      const prompt = `Create a clean, realistic product photo of: ${title}. ${description || ''}. Category: ${category}. White background, studio lighting, high quality.`;

      const response = await fetch(`${GEMINI_API_URL}/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ['IMAGE', 'TEXT'] }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const parts = data.candidates?.[0]?.content?.parts || [];
        const imagePart = parts.find(p => p.inlineData);
        if (imagePart) {
          const { mimeType, data: imageBytes } = imagePart.inlineData;
          console.log('✅ Gemini image generated successfully');
          return `data:${mimeType};base64,${imageBytes}`;
        }
      }
    } catch (err) {
      console.log('Gemini image gen not available, trying Imagen...');
    }

    // Try Imagen 3 API
    try {
      const prompt = `Professional product photo of ${title}. ${description || ''}. Clean white background.`;
      const response = await fetch(`${GEMINI_API_URL}/imagen-3.0-generate-002:predict?key=${GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: { sampleCount: 1, aspectRatio: '1:1' }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const imageBytes = data.predictions?.[0]?.bytesBase64Encoded;
        if (imageBytes) {
          console.log('✅ Imagen 3 image generated successfully');
          return `data:image/png;base64,${imageBytes}`;
        }
      }
    } catch (err) {
      console.log('Imagen 3 not available, using enhanced placeholder...');
    }

    // Fallback: Generate an enhanced SVG with AI description
    return await this.generateEnhancedPlaceholder(itemDetails);
  }

  /**
   * Generate an enhanced SVG placeholder with rich visuals
   */
  async generateEnhancedPlaceholder(itemDetails) {
    const { title, description, category } = itemDetails;
    const colors = this.getCategoryColors(category);
    const icon = this.getCategoryIcon(category);
    const shortDesc = (description || '').substring(0, 50);

    const svg = `
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors.start};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${colors.end};stop-opacity:1" />
          </linearGradient>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.3"/>
          </filter>
        </defs>
        <rect width="400" height="400" fill="url(#bg)" rx="16"/>
        <rect x="20" y="20" width="360" height="360" rx="12" fill="white" opacity="0.08"/>
        <text x="50%" y="38%" text-anchor="middle" font-family="Arial, sans-serif" font-size="64" fill="white" opacity="0.95" filter="url(#shadow)">
          ${icon}
        </text>
        <text x="50%" y="55%" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="white" font-weight="bold" opacity="0.95">
          ${title.substring(0, 22)}
        </text>
        <text x="50%" y="64%" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" fill="white" opacity="0.65">
          ${shortDesc}
        </text>
        <rect x="130" y="280" width="140" height="28" rx="14" fill="white" opacity="0.15"/>
        <text x="50%" y="76%" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="white" opacity="0.8" letter-spacing="2">
          ${category.toUpperCase()}
        </text>
        <text x="50%" y="90%" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="white" opacity="0.4">
          AI Generated • CampusConnect
        </text>
      </svg>
    `;

    const base64 = Buffer.from(svg).toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
  }

  /**
   * Legacy placeholder (simple version)
   */
  async generatePlaceholder(itemDetails) {
    return this.generateEnhancedPlaceholder(itemDetails);
  }

  /**
   * Get category-specific colors
   */
  getCategoryColors(category) {
    const colorMap = {
      'electronics': { start: '#3B82F6', end: '#1D4ED8' },
      'bags': { start: '#F59E0B', end: '#D97706' },
      'wallets': { start: '#10B981', end: '#059669' },
      'keys': { start: '#8B5CF6', end: '#6D28D9' },
      'clothing': { start: '#EC4899', end: '#BE185D' },
      'documents': { start: '#EF4444', end: '#DC2626' },
      'jewelry': { start: '#F59E0B', end: '#D97706' },
      'accessories': { start: '#06B6D4', end: '#0891B2' },
      'other': { start: '#6B7280', end: '#4B5563' },
    };
    return colorMap[(category || '').toLowerCase()] || colorMap['other'];
  }

  /**
   * Get category icon emoji
   */
  getCategoryIcon(category) {
    const iconMap = {
      'electronics': '📱', 'bags': '🎒', 'wallets': '👛', 'keys': '🔑',
      'clothing': '👕', 'documents': '📄', 'jewelry': '💍',
      'accessories': '⌚', 'other': '📦',
    };
    return iconMap[(category || '').toLowerCase()] || '📦';
  }

  /**
   * Use Google Gemini for image analysis (when user uploads image)
   */
  async analyzeImage(imageBase64) {
    try {
      const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

      const response = await fetch(`${GEMINI_API_URL}/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: 'Analyze this image and describe the item in detail. Include: type, color, brand (if visible), condition, distinctive features, and any text visible. Be specific and concise.' },
              { inline_data: { mime_type: 'image/jpeg', data: base64Data } }
            ]
          }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 2048 }
        })
      });

      if (!response.ok) throw new Error(`Gemini API error: ${response.statusText}`);
      const data = await response.json();
      const description = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return { success: true, description, features: this.extractFeatures(description) };
    } catch (error) {
      console.error('Image analysis error:', error.message);
      return { success: false, error: error.message, description: '', features: {} };
    }
  }

  /**
   * Extract structured features from description
   */
  extractFeatures(description) {
    const features = { colors: [], brands: [], keywords: [] };
    const colorRegex = /\b(red|blue|green|yellow|black|white|gray|grey|brown|orange|purple|pink|silver|gold)\b/gi;
    const colors = description.match(colorRegex);
    if (colors) features.colors = [...new Set(colors.map(c => c.toLowerCase()))];
    const brandRegex = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
    const brands = description.match(brandRegex);
    if (brands) features.brands = [...new Set(brands)];
    features.keywords = description.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    return features;
  }

  /**
   * Generate AI-enhanced description for item
   */
  async enhanceDescription(itemDetails) {
    const { title, description, category } = itemDetails;
    try {
      const response = await fetch(`${GEMINI_API_URL}/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Enhance this lost item description to make it more detailed and searchable:\nTitle: ${title}\nCategory: ${category}\nDescription: ${description}\n\nProvide a detailed description with physical characteristics and identifying features. Max 150 words.` }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
        })
      });
      if (!response.ok) throw new Error(`Gemini API error`);
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || description;
    } catch (error) {
      return description;
    }
  }

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      const response = await fetch(`${GEMINI_API_URL}/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'Say "Connected" in 1 word' }] }] })
      });
      if (!response.ok) return { success: false, error: `HTTP ${response.status}` };
      const data = await response.json();
      return { success: true, message: data.candidates?.[0]?.content?.parts?.[0]?.text || 'Connected' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new ImageGeneratorService();
