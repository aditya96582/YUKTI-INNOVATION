/**
 * AI-Powered Item Matching Service
 * Uses Google Gemini API for intelligent text-based matching
 * + metadata scoring (category, location, date proximity)
 * 
 * No TensorFlow dependency — purely API-based for reliability.
 */

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

class AIImageMatcher {
  constructor() {
    this.initialized = true;
  }

  /**
   * Match a single lost item against found items using Gemini + metadata scoring
   */
  async matchItems(lostItem, foundItems) {
    const matches = [];

    for (const foundItem of foundItems) {
      try {
        // 1. Metadata match (category, location, date) — deterministic
        const metadataScore = this.calculateMetadataMatch(lostItem, foundItem);

        // 2. Text similarity — NLP keyword overlap
        const textScore = this.calculateTextMatch(lostItem, foundItem);

        // 3. Gemini AI semantic match (if both have descriptions)
        let aiScore = 0;
        if (lostItem.description && foundItem.description) {
          aiScore = await this.geminiSemanticMatch(lostItem, foundItem);
        }

        // Weighted confidence
        const hasAI = aiScore > 0;
        const confidence = hasAI
          ? (aiScore * 0.50 + textScore * 0.25 + metadataScore * 0.25)
          : (textScore * 0.60 + metadataScore * 0.40);

        const finalConfidence = Math.round(Math.min(confidence, 99));

        if (finalConfidence >= 55) {
          matches.push({
            foundItemId: foundItem._id?.toString() || foundItem.id,
            foundTitle: foundItem.title,
            confidence: finalConfidence,
            imageSimilarity: 0,
            objectMatch: hasAI ? Math.round(aiScore) : 0,
            metadataMatch: Math.round(metadataScore),
            textMatch: Math.round(textScore),
            matchReason: this.generateMatchReason(finalConfidence, lostItem, foundItem, hasAI),
            detectedObjects: [],
          });
        }
      } catch (error) {
        console.error(`Error matching with item ${foundItem._id || foundItem.id}:`, error.message);
      }
    }

    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Use Gemini to semantically compare two item descriptions
   * Returns a score 0-100
   */
  async geminiSemanticMatch(lostItem, foundItem) {
    if (!GOOGLE_API_KEY) return 0;

    try {
      const prompt = `You are an AI assistant for a lost-and-found system. Compare these two items and determine if they could be the same item.

LOST ITEM:
- Title: ${lostItem.title}
- Description: ${lostItem.description}
- Category: ${lostItem.category}
- Location: ${lostItem.location}
- Date Lost: ${lostItem.date}

FOUND ITEM:
- Title: ${foundItem.title}
- Description: ${foundItem.description}
- Category: ${foundItem.category}
- Location: ${foundItem.location}
- Date Found: ${foundItem.date}

Rate the probability that these are the SAME ITEM on a scale of 0 to 100.
Consider: physical description match, category match, location proximity, time proximity, brand/color/size matches.

Respond with ONLY a JSON object: {"score": <number>, "reason": "<brief reason>"}`;

      const response = await fetch(`${GEMINI_API_URL}/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 200 }
        })
      });

      if (!response.ok) return 0;

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return Math.max(0, Math.min(100, parsed.score || 0));
      }

      // Fallback: try to extract number
      const numMatch = text.match(/(\d+)/);
      return numMatch ? Math.min(100, parseInt(numMatch[1])) : 0;
    } catch (error) {
      console.error('Gemini semantic match error:', error.message);
      return 0;
    }
  }

  /**
   * Calculate text similarity between items (NLP keyword overlap)
   */
  calculateTextMatch(lostItem, foundItem) {
    const normalize = (s) => (s || '').toLowerCase().replace(/[^a-z0-9\s]/g, '');
    
    const lostWords = new Set(normalize(`${lostItem.title} ${lostItem.description}`).split(/\s+/).filter(w => w.length > 2));
    const foundWords = new Set(normalize(`${foundItem.title} ${foundItem.description}`).split(/\s+/).filter(w => w.length > 2));

    if (lostWords.size === 0 || foundWords.size === 0) return 0;

    let commonCount = 0;
    for (const word of lostWords) {
      if (foundWords.has(word)) commonCount++;
    }

    const jaccardSimilarity = commonCount / (lostWords.size + foundWords.size - commonCount);
    
    // Bonus for title match
    const lostTitle = normalize(lostItem.title);
    const foundTitle = normalize(foundItem.title);
    const titleBonus = lostTitle.includes(foundTitle) || foundTitle.includes(lostTitle) ? 20 : 0;

    return Math.min(100, Math.round(jaccardSimilarity * 100 + titleBonus));
  }

  /**
   * Calculate metadata match (category, location, date)
   */
  calculateMetadataMatch(lostItem, foundItem) {
    let score = 0;

    // Category match (40 points)
    if ((lostItem.category || '').toLowerCase() === (foundItem.category || '').toLowerCase()) {
      score += 40;
    }

    // Location proximity (30 points)
    const lostLoc = (lostItem.location || '').toLowerCase().trim();
    const foundLoc = (foundItem.location || '').toLowerCase().trim();
    if (lostLoc === foundLoc) {
      score += 30;
    } else if (lostLoc.includes(foundLoc) || foundLoc.includes(lostLoc)) {
      score += 15;
    } else {
      // Check first word match (e.g., "Library" in "Library Building" vs "Library 1st Floor")
      const lWord = lostLoc.split(/[\s,]+/)[0];
      const fWord = foundLoc.split(/[\s,]+/)[0];
      if (lWord && fWord && lWord === fWord) score += 10;
    }

    // Date proximity (30 points)
    const lostDate = new Date(lostItem.date);
    const foundDate = new Date(foundItem.date);
    if (!isNaN(lostDate) && !isNaN(foundDate)) {
      const dayDiff = Math.abs(lostDate.getTime() - foundDate.getTime()) / (1000 * 60 * 60 * 24);
      if (dayDiff <= 1) score += 30;
      else if (dayDiff <= 3) score += 20;
      else if (dayDiff <= 7) score += 10;
      else if (dayDiff <= 14) score += 5;
    }

    return score;
  }

  /**
   * Generate human-readable match reason
   */
  generateMatchReason(confidence, lostItem, foundItem, hasAI) {
    const reasons = [];

    if (confidence >= 90) reasons.push('🔥 Very high match confidence');
    else if (confidence >= 75) reasons.push('✅ High match confidence');
    else if (confidence >= 60) reasons.push('⚡ Moderate match confidence');
    else reasons.push('ℹ️ Possible match');

    if ((lostItem.category || '').toLowerCase() === (foundItem.category || '').toLowerCase()) {
      reasons.push(`Same category: ${lostItem.category}`);
    }

    if (hasAI) reasons.push('🤖 AI semantic analysis confirmed');

    const lostLoc = (lostItem.location || '').toLowerCase();
    const foundLoc = (foundItem.location || '').toLowerCase();
    if (lostLoc && foundLoc && (lostLoc.includes(foundLoc) || foundLoc.includes(lostLoc))) {
      reasons.push('📍 Similar location');
    }

    return reasons.join(' • ');
  }

  /**
   * Batch process multiple lost items against all found items
   */
  async batchMatch(lostItems, foundItems) {
    const results = [];
    for (const lostItem of lostItems) {
      const matches = await this.matchItems(lostItem, foundItems);
      if (matches.length > 0) {
        results.push({
          lostItemId: lostItem._id?.toString() || lostItem.id,
          matches,
        });
      }
    }
    return results;
  }
}

module.exports = new AIImageMatcher();
