/**
 * AI Image Generation Service
 * Uses Google Gemini API for image analysis and Imagen for generation
 */

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || 'AIzaSyBu3VMrOzUvkzy2dviMTe9LzNBw9iUhenc';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

class ImageGeneratorService {
  /**
   * Generate a descriptive image prompt from item details
   */
  generatePrompt(itemDetails) {
    const { title, description, category } = itemDetails;
    
    return `Professional product photography of ${title}. ${description}. 
Category: ${category}. Clean white background, well-lit, high quality, detailed, realistic.`;
  }

  /**
   * Generate image using Google Imagen API
   * @param {Object} itemDetails - Item details (title, description, category)
   * @returns {Promise<string>} Base64 encoded image
   */
  async generateImage(itemDetails) {
    try {
      const prompt = this.generatePrompt(itemDetails);

      // Use Gemini 2.5 Flash Image for image generation (free tier supported)
      const response = await fetch(`${GEMINI_API_URL}/gemini-2.0-flash-exp-image-generation:generateContent?key=${GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ['IMAGE', 'TEXT'] }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.log('Gemini Image API error:', errText);
        return await this.generatePlaceholder(itemDetails);
      }

      const data = await response.json();
      const parts = data.candidates?.[0]?.content?.parts || [];
      const imagePart = parts.find(p => p.inlineData);

      if (imagePart) {
        const { mimeType, data: imageBytes } = imagePart.inlineData;
        return `data:${mimeType};base64,${imageBytes}`;
      }
      
      // Fallback to placeholder if generation fails
      return await this.generatePlaceholder(itemDetails);
      
    } catch (error) {
      console.error('Image generation error:', error);
      return await this.generatePlaceholder(itemDetails);
    }
  }

  /**
   * Generate SVG placeholder image (fallback)
   */
  async generatePlaceholder(itemDetails) {
    const { title, category } = itemDetails;
    const colors = this.getCategoryColors(category);
    
    const svg = `
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors.start};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${colors.end};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="400" fill="url(#grad)"/>
        <text x="50%" y="45%" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" fill="white" opacity="0.9">
          ${this.getCategoryIcon(category)}
        </text>
        <text x="50%" y="60%" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="white" opacity="0.8">
          ${title.substring(0, 20)}
        </text>
        <text x="50%" y="70%" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="white" opacity="0.6">
          ${category.toUpperCase()}
        </text>
      </svg>
    `;
    
    // Convert SVG to base64
    const base64 = Buffer.from(svg).toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
  }

  /**
   * Get category-specific colors
   */
  getCategoryColors(category) {
    const colorMap = {
      'electronics': { start: '#3B82F6', end: '#1D4ED8' }, // Blue
      'bags': { start: '#F59E0B', end: '#D97706' },        // Amber
      'wallets': { start: '#10B981', end: '#059669' },     // Green
      'keys': { start: '#8B5CF6', end: '#6D28D9' },        // Purple
      'clothing': { start: '#EC4899', end: '#BE185D' },    // Pink
      'documents': { start: '#EF4444', end: '#DC2626' },   // Red
      'jewelry': { start: '#F59E0B', end: '#D97706' },     // Amber
      'accessories': { start: '#06B6D4', end: '#0891B2' }, // Cyan
      'other': { start: '#6B7280', end: '#4B5563' },       // Gray
    };
    
    return colorMap[category.toLowerCase()] || colorMap['other'];
  }

  /**
   * Get category icon emoji
   */
  getCategoryIcon(category) {
    const iconMap = {
      'electronics': '📱',
      'bags': '🎒',
      'wallets': '👛',
      'keys': '🔑',
      'clothing': '👕',
      'documents': '📄',
      'jewelry': '💍',
      'accessories': '⌚',
      'other': '📦',
    };
    
    return iconMap[category.toLowerCase()] || '📦';
  }

  /**
   * Get fallback image URL
   */
  getFallbackImage(category) {
    return `https://via.placeholder.com/400x400/F59E0B/FFFFFF?text=${encodeURIComponent(category)}`;
  }

  /**
   * Use Google Gemini for image analysis (when user uploads image)
   */
  async analyzeImage(imageBase64) {
    try {
      // Remove data URL prefix if present
      const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
      
      const response = await fetch(`${GEMINI_API_URL}/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: 'Analyze this image and describe the item in detail. Include: type of item, color, brand (if visible), condition, distinctive features, and any text visible on the item. Be specific and concise.'
              },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: base64Data
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      const description = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      return {
        success: true,
        description,
        features: this.extractFeatures(description)
      };
      
    } catch (error) {
      console.error('Image analysis error:', error);
      return {
        success: false,
        error: error.message,
        description: '',
        features: {}
      };
    }
  }

  /**
   * Extract structured features from description
   */
  extractFeatures(description) {
    const features = {
      colors: [],
      brands: [],
      keywords: []
    };

    // Extract colors
    const colorRegex = /\b(red|blue|green|yellow|black|white|gray|grey|brown|orange|purple|pink|silver|gold)\b/gi;
    const colors = description.match(colorRegex);
    if (colors) {
      features.colors = [...new Set(colors.map(c => c.toLowerCase()))];
    }

    // Extract potential brands (capitalized words)
    const brandRegex = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
    const brands = description.match(brandRegex);
    if (brands) {
      features.brands = [...new Set(brands)];
    }

    // Extract keywords (nouns and adjectives)
    const words = description.toLowerCase().split(/\s+/);
    features.keywords = words.filter(w => w.length > 3);

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Enhance this lost item description to make it more detailed and searchable:
              
Title: ${title}
Category: ${category}
Description: ${description}

Provide a detailed, professional description that includes:
1. Physical characteristics
2. Potential identifying features
3. Common locations where such items are found
4. Tips for identification

Keep it concise (max 150 words).`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 300,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      const enhancedDescription = data.candidates?.[0]?.content?.parts?.[0]?.text || description;
      
      return enhancedDescription;
      
    } catch (error) {
      console.error('Description enhancement error:', error);
      return description; // Return original if enhancement fails
    }
  }

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      const response = await fetch(`${GEMINI_API_URL}/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Say "API connection successful" in 3 words'
            }]
          }]
        })
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { 
        success: true, 
        message: data.candidates?.[0]?.content?.parts?.[0]?.text || 'Connected'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new ImageGeneratorService();
