/**
 * Lost & Found Items Routes with AI Matching
 */

const express = require('express');
const router = express.Router();
const { db } = require('../data/db');
const aiImageMatcher = require('../services/aiImageMatcher');
const notificationService = require('../services/notificationService');

/**
 * GET /api/items/lost
 * Get all lost items
 */
router.get('/lost', (req, res) => {
  try {
    if (!db.lostItems) db.lostItems = [];
    res.json({ success: true, items: db.lostItems });
  } catch (error) {
    console.error('Error getting lost items:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/items/found
 * Get all found items
 */
router.get('/found', (req, res) => {
  try {
    if (!db.foundItems) db.foundItems = [];
    res.json({ success: true, items: db.foundItems });
  } catch (error) {
    console.error('Error getting found items:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/items/lost
 * Create lost item report
 */
router.post('/lost', async (req, res) => {
  try {
    const { title, description, category, location, date, image, reward, userId, userName } = req.body;

    const lostItem = {
      id: `lost_${Date.now()}`,
      title,
      description,
      category,
      location,
      date,
      image,
      reward: reward || 0,
      userId,
      userName,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    if (!db.lostItems) db.lostItems = [];
    db.lostItems.push(lostItem);

    // Trigger AI matching if image provided
    if (image) {
      setTimeout(() => {
        runAIMatching(lostItem.id);
      }, 1000);
    }

    res.json({ success: true, item: lostItem });
  } catch (error) {
    console.error('Error creating lost item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/items/found
 * Create found item report
 */
router.post('/found', async (req, res) => {
  try {
    const { title, description, category, location, date, image, userId, userName } = req.body;

    const foundItem = {
      id: `found_${Date.now()}`,
      title,
      description,
      category,
      location,
      date,
      image,
      userId,
      userName,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    if (!db.foundItems) db.foundItems = [];
    db.foundItems.push(foundItem);

    // Trigger AI matching if image provided
    if (image) {
      setTimeout(() => {
        runAIMatchingForFound(foundItem.id);
      }, 1000);
    }

    res.json({ success: true, item: foundItem });
  } catch (error) {
    console.error('Error creating found item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/items/match/ai
 * Run AI-powered image matching
 */
router.post('/match/ai', async (req, res) => {
  try {
    const { lostItemId, foundItemIds } = req.body;

    if (!db.lostItems || !db.foundItems) {
      return res.json({ success: true, matches: [] });
    }

    const lostItem = db.lostItems.find(item => item.id === lostItemId);
    if (!lostItem || !lostItem.image) {
      return res.status(400).json({ success: false, error: 'Lost item not found or has no image' });
    }

    let foundItems;
    if (foundItemIds && foundItemIds.length > 0) {
      foundItems = db.foundItems.filter(item => foundItemIds.includes(item.id));
    } else {
      foundItems = db.foundItems.filter(item => item.status === 'active' && item.image);
    }

    // Run AI matching
    const matches = await aiImageMatcher.matchItems(lostItem, foundItems);

    // Store matches
    if (!db.matches) db.matches = [];
    
    for (const match of matches) {
      const matchRecord = {
        id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        lostItemId: lostItem.id,
        foundItemId: match.foundItemId,
        confidence: match.confidence,
        imageSimilarity: match.imageSimilarity,
        objectMatch: match.objectMatch,
        metadataMatch: match.metadataMatch,
        matchReason: match.matchReason,
        detectedObjects: match.detectedObjects,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      db.matches.push(matchRecord);

      // Notify users if confidence >= 98%
      if (match.confidence >= 98) {
        const foundItem = db.foundItems.find(f => f.id === match.foundItemId);
        if (foundItem) {
          await notificationService.notifyAIMatch(
            lostItem.userId,
            foundItem.userId,
            {
              lostItemId: lostItem.id,
              foundItemId: foundItem.id,
              confidence: match.confidence,
              matchReason: match.matchReason
            }
          );
        }
      }
    }

    res.json({ success: true, matches, count: matches.length });
  } catch (error) {
    console.error('Error in AI matching:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/items/match/batch
 * Batch AI matching for all active items
 */
router.post('/match/batch', async (req, res) => {
  try {
    if (!db.lostItems || !db.foundItems) {
      return res.json({ success: true, results: [] });
    }

    const lostItems = db.lostItems.filter(item => item.status === 'active' && item.image);
    const foundItems = db.foundItems.filter(item => item.status === 'active' && item.image);

    const results = await aiImageMatcher.batchMatch(lostItems, foundItems);

    // Store matches and notify
    if (!db.matches) db.matches = [];
    
    let highConfidenceCount = 0;
    
    for (const result of results) {
      const lostItem = lostItems.find(l => l.id === result.lostItemId);
      
      for (const match of result.matches) {
        const matchRecord = {
          id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          lostItemId: result.lostItemId,
          foundItemId: match.foundItemId,
          confidence: match.confidence,
          imageSimilarity: match.imageSimilarity,
          objectMatch: match.objectMatch,
          metadataMatch: match.metadataMatch,
          matchReason: match.matchReason,
          detectedObjects: match.detectedObjects,
          status: 'pending',
          createdAt: new Date().toISOString()
        };

        db.matches.push(matchRecord);

        if (match.confidence >= 98) {
          highConfidenceCount++;
          const foundItem = foundItems.find(f => f.id === match.foundItemId);
          if (foundItem && lostItem) {
            await notificationService.notifyAIMatch(
              lostItem.userId,
              foundItem.userId,
              {
                lostItemId: lostItem.id,
                foundItemId: foundItem.id,
                confidence: match.confidence,
                matchReason: match.matchReason
              }
            );
          }
        }
      }
    }

    res.json({ 
      success: true, 
      results, 
      totalMatches: results.reduce((sum, r) => sum + r.matches.length, 0),
      highConfidenceMatches: highConfidenceCount
    });
  } catch (error) {
    console.error('Error in batch matching:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/items/matches/:itemId
 * Get matches for specific item
 */
router.get('/matches/:itemId', (req, res) => {
  try {
    const { itemId } = req.params;
    
    if (!db.matches) {
      return res.json({ success: true, matches: [] });
    }

    const matches = db.matches.filter(
      m => m.lostItemId === itemId || m.foundItemId === itemId
    );

    res.json({ success: true, matches });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Helper: Run AI matching for a lost item
 */
async function runAIMatching(lostItemId) {
  try {
    const lostItem = db.lostItems.find(item => item.id === lostItemId);
    if (!lostItem || !lostItem.image) return;

    const foundItems = db.foundItems.filter(item => item.status === 'active' && item.image);
    const matches = await aiImageMatcher.matchItems(lostItem, foundItems);

    if (!db.matches) db.matches = [];
    
    for (const match of matches) {
      db.matches.push({
        id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        lostItemId: lostItem.id,
        foundItemId: match.foundItemId,
        confidence: match.confidence,
        matchReason: match.matchReason,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      if (match.confidence >= 98) {
        const foundItem = foundItems.find(f => f.id === match.foundItemId);
        if (foundItem) {
          await notificationService.notifyAIMatch(
            lostItem.userId,
            foundItem.userId,
            { lostItemId: lostItem.id, foundItemId: foundItem.id, confidence: match.confidence, matchReason: match.matchReason }
          );
        }
      }
    }
  } catch (error) {
    console.error('Auto-matching error:', error);
  }
}

/**
 * Helper: Run AI matching for a found item
 */
async function runAIMatchingForFound(foundItemId) {
  try {
    const foundItem = db.foundItems.find(item => item.id === foundItemId);
    if (!foundItem || !foundItem.image) return;

    const lostItems = db.lostItems.filter(item => item.status === 'active' && item.image);
    
    for (const lostItem of lostItems) {
      const matches = await aiImageMatcher.matchItems(lostItem, [foundItem]);
      
      if (!db.matches) db.matches = [];
      
      for (const match of matches) {
        db.matches.push({
          id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          lostItemId: lostItem.id,
          foundItemId: foundItem.id,
          confidence: match.confidence,
          matchReason: match.matchReason,
          status: 'pending',
          createdAt: new Date().toISOString()
        });

        if (match.confidence >= 98) {
          await notificationService.notifyAIMatch(
            lostItem.userId,
            foundItem.userId,
            { lostItemId: lostItem.id, foundItemId: foundItem.id, confidence: match.confidence, matchReason: match.matchReason }
          );
        }
      }
    }
  } catch (error) {
    console.error('Auto-matching error:', error);
  }
}

module.exports = router;
