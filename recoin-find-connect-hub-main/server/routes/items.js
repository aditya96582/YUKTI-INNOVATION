/**
 * Lost & Found Items Routes — MongoDB Backed
 * Full CRUD + AI matching with Gemini
 */

const express = require('express');
const router = express.Router();
const { LostItem, FoundItem, Match } = require('../config/database');
const aiImageMatcher = require('../services/aiImageMatcher');

/**
 * GET /api/items/lost — Get all lost items
 */
router.get('/lost', async (req, res) => {
  try {
    const items = await LostItem.find().sort({ createdAt: -1 });
    res.json({ success: true, items: items.map(mapItem) });
  } catch (error) {
    console.error('Error getting lost items:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/items/found — Get all found items
 */
router.get('/found', async (req, res) => {
  try {
    const items = await FoundItem.find().sort({ createdAt: -1 });
    res.json({ success: true, items: items.map(mapItem) });
  } catch (error) {
    console.error('Error getting found items:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/items/lost — Create lost item report
 */
router.post('/lost', async (req, res) => {
  try {
    const { title, description, category, location, date, image, reward, userId, userName, aiGenerated } = req.body;

    const lostItem = await LostItem.create({
      title, description, category, location, date,
      image: image || null,
      reward: reward || 0,
      userId, userName,
      aiGenerated: aiGenerated || false,
      status: 'active',
    });

    res.json({ success: true, item: mapItem(lostItem) });
  } catch (error) {
    console.error('Error creating lost item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/items/found — Create found item report
 */
router.post('/found', async (req, res) => {
  try {
    const { title, description, category, location, date, image, userId, userName } = req.body;

    const foundItem = await FoundItem.create({
      title, description, category, location, date,
      image: image || null,
      userId, userName,
      status: 'active',
    });

    res.json({ success: true, item: mapItem(foundItem) });
  } catch (error) {
    console.error('Error creating found item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/items/:type/:id — Update an item
 */
router.put('/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = type === 'lost' ? LostItem : FoundItem;
    const item = await Model.findByIdAndUpdate(id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, error: 'Item not found' });
    res.json({ success: true, item: mapItem(item) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/items/:type/:id/resolve — Resolve an item
 */
router.put('/:type/:id/resolve', async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = type === 'lost' ? LostItem : FoundItem;
    const item = await Model.findByIdAndUpdate(id, { status: 'resolved' }, { new: true });
    if (!item) return res.status(404).json({ success: false, error: 'Item not found' });
    res.json({ success: true, item: mapItem(item) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/items/:type/:id — Delete an item
 */
router.delete('/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = type === 'lost' ? LostItem : FoundItem;
    const item = await Model.findByIdAndDelete(id);
    if (!item) return res.status(404).json({ success: false, error: 'Item not found' });
    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/items/match/ai — Run AI-powered matching for a single lost item
 * Uses description as the matching prompt content
 */
router.post('/match/ai', async (req, res) => {
  try {
    const { lostItemId, foundItemIds } = req.body;

    const lostItem = await LostItem.findById(lostItemId);
    if (!lostItem) {
      return res.status(400).json({ success: false, error: 'Lost item not found' });
    }

    let foundItems;
    if (foundItemIds && foundItemIds.length > 0) {
      foundItems = await FoundItem.find({ _id: { $in: foundItemIds } });
    } else {
      foundItems = await FoundItem.find({ status: 'active' });
    }

    if (foundItems.length === 0) {
      return res.json({ success: true, matches: [], count: 0, message: 'No found items to match against' });
    }

    // Run AI matching (uses description as prompt content in Gemini)
    console.log(`🤖 Running AI match: "${lostItem.title}" (desc: "${lostItem.description?.substring(0, 50)}...") vs ${foundItems.length} found items`);
    
    let matches = [];
    try {
      matches = await aiImageMatcher.matchItems(lostItem, foundItems);
    } catch (err) {
      console.error('AI matching error:', err.message);
      matches = [];
    }

    // Store matches in DB
    const storedMatches = [];
    for (const match of matches) {
      try {
        // Check for existing match to avoid duplicates
        const existing = await Match.findOne({ lostItemId: lostItem._id.toString(), foundItemId: match.foundItemId });
        if (existing) {
          // Update confidence if higher
          if (match.confidence > existing.confidence) {
            existing.confidence = match.confidence;
            existing.matchReason = match.matchReason;
            await existing.save();
          }
          storedMatches.push(mapMatch(existing, lostItem.title, match.foundTitle));
        } else {
          const newMatch = await Match.create({
            lostItemId: lostItem._id.toString(),
            foundItemId: match.foundItemId,
            confidence: match.confidence,
            imageSimilarity: match.imageSimilarity || 0,
            objectMatch: match.objectMatch || 0,
            metadataMatch: match.metadataMatch || 0,
            matchReason: match.matchReason || '',
            detectedObjects: match.detectedObjects || [],
            status: 'pending',
          });
          storedMatches.push(mapMatch(newMatch, lostItem.title, match.foundTitle));
        }
      } catch (storeErr) {
        console.error('Error storing match:', storeErr.message);
      }
    }

    console.log(`✅ AI matching complete: ${storedMatches.length} matches found`);

    res.json({
      success: true,
      matches: storedMatches,
      count: storedMatches.length,
      lostItemTitle: lostItem.title,
    });
  } catch (error) {
    console.error('Error in AI matching:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/items/match/batch — Batch AI matching for ALL active lost items
 */
router.post('/match/batch', async (req, res) => {
  try {
    const lostItems = await LostItem.find({ status: 'active' });
    const foundItems = await FoundItem.find({ status: 'active' });

    if (lostItems.length === 0 || foundItems.length === 0) {
      return res.json({ success: true, results: [], totalMatches: 0, message: 'Need both lost and found items' });
    }

    console.log(`🤖 Running batch AI match: ${lostItems.length} lost items vs ${foundItems.length} found items`);

    let results = [];
    try {
      results = await aiImageMatcher.batchMatch(lostItems, foundItems);
    } catch (err) {
      console.error('Batch match error:', err.message);
      results = [];
    }

    let totalMatches = 0;
    const allMatches = [];
    for (const result of results) {
      for (const match of (result.matches || [])) {
        totalMatches++;
        try {
          const existing = await Match.findOne({ lostItemId: result.lostItemId, foundItemId: match.foundItemId });
          if (!existing) {
            const newMatch = await Match.create({
              lostItemId: result.lostItemId,
              foundItemId: match.foundItemId,
              confidence: match.confidence,
              matchReason: match.matchReason || '',
              metadataMatch: match.metadataMatch || 0,
              objectMatch: match.objectMatch || 0,
              status: 'pending',
            });
            allMatches.push(newMatch);
          }
        } catch (storeErr) {
          // skip duplicates
        }
      }
    }

    console.log(`✅ Batch matching complete: ${totalMatches} matches found`);
    res.json({ success: true, results, totalMatches });
  } catch (error) {
    console.error('Error in batch matching:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/items/matches — Get ALL matches
 */
router.get('/matches', async (req, res) => {
  try {
    const matches = await Match.find().sort({ createdAt: -1 });
    
    // Enrich with item titles
    const enriched = [];
    for (const match of matches) {
      const lostItem = await LostItem.findById(match.lostItemId);
      const foundItem = await FoundItem.findById(match.foundItemId);
      enriched.push({
        id: match._id.toString(),
        lostItemId: match.lostItemId,
        foundItemId: match.foundItemId,
        confidence: match.confidence,
        matchType: match.confidence >= 85 ? 'hybrid' : match.confidence >= 70 ? 'text' : 'metadata',
        lostTitle: lostItem?.title || 'Unknown',
        foundTitle: foundItem?.title || 'Unknown',
        matchReason: match.matchReason,
        reasons: (match.matchReason || '').split(' • ').filter(Boolean),
        timestamp: match.createdAt,
        status: match.status,
      });
    }

    res.json({ success: true, matches: enriched });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/items/matches/:itemId — Get matches for specific item
 */
router.get('/matches/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const matches = await Match.find({
      $or: [{ lostItemId: itemId }, { foundItemId: itemId }],
    }).sort({ createdAt: -1 });
    res.json({ success: true, matches });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Helper: map Mongoose doc to clean item shape
 */
function mapItem(doc) {
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description || '',
    category: doc.category,
    location: doc.location,
    date: doc.date,
    image: doc.image || '',
    reward: doc.reward || 0,
    userId: doc.userId,
    userName: doc.userName,
    status: doc.status,
    aiGenerated: doc.aiGenerated || false,
    createdAt: doc.createdAt,
  };
}

/**
 * Helper: map match with titles
 */
function mapMatch(doc, lostTitle, foundTitle) {
  return {
    id: doc._id.toString(),
    lostItemId: doc.lostItemId,
    foundItemId: doc.foundItemId,
    confidence: doc.confidence,
    matchType: doc.confidence >= 85 ? 'hybrid' : doc.confidence >= 70 ? 'text' : 'metadata',
    lostTitle: lostTitle || 'Unknown',
    foundTitle: foundTitle || 'Unknown',
    matchReason: doc.matchReason,
    reasons: (doc.matchReason || '').split(' • ').filter(Boolean),
    timestamp: doc.createdAt,
    status: doc.status,
  };
}

module.exports = router;
