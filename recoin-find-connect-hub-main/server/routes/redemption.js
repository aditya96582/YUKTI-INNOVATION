/**
 * Coin Redemption Routes
 */

const express = require('express');
const router = express.Router();
const coinRedemptionService = require('../services/coinRedemption');

/**
 * GET /api/redemption/partners
 * Get available redemption partners
 */
router.get('/partners', (req, res) => {
  try {
    const partners = coinRedemptionService.getPartners();
    res.json({ success: true, partners });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/redemption/redeem
 * Redeem coins for partner voucher
 */
router.post('/redeem', async (req, res) => {
  try {
    const { userId, partnerId, coins } = req.body;

    if (!userId || !partnerId || !coins) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: userId, partnerId, coins' 
      });
    }

    const result = await coinRedemptionService.redeemCoins(userId, partnerId, coins);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/redemption/history/:userId
 * Get user redemption history
 */
router.get('/history/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const history = coinRedemptionService.getRedemptionHistory(userId);
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/redemption/stats
 * Get redemption statistics
 */
router.get('/stats', (req, res) => {
  try {
    const stats = coinRedemptionService.getRedemptionStats();
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
