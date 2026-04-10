/**
 * Emergency Network Routes — MongoDB Backed
 * Handles blood requests, medical help, safety alerts, and community emergencies
 */

const express = require('express');
const router = express.Router();
const { Emergency, User, Notification } = require('../config/database');

/**
 * GET /api/emergencies — Get all emergencies (newest first)
 */
router.get('/', async (req, res) => {
  try {
    const emergencies = await Emergency.find().sort({ createdAt: -1 });
    res.json({ success: true, emergencies });
  } catch (error) {
    console.error('Error getting emergencies:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/emergencies — Create new emergency request
 */
router.post('/', async (req, res) => {
  try {
    const { type, title, description, location, urgency, bloodGroup, userId, userName, contactNumber } = req.body;

    if (!type || !title || !location || !urgency || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type, title, location, urgency, userId',
      });
    }

    const emergency = await Emergency.create({
      type,
      title,
      description: description || '',
      location,
      urgency,
      bloodGroup: bloodGroup || '',
      userId,
      userName: userName || 'Unknown',
      contactNumber: contactNumber || '',
      resolved: false,
      respondents: 0,
      respondentList: [],
    });

    // Create notification for the poster
    await Notification.create({
      userId,
      type: 'emergency',
      title: 'Emergency Request Posted',
      description: `Your emergency "${title}" is now live`,
      actionUrl: '/emergency',
    });

    res.status(201).json({ success: true, emergency });
  } catch (error) {
    console.error('Error creating emergency:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/emergencies/:id/respond — Respond to an emergency
 */
router.put('/:id/respond', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userName } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    const emergency = await Emergency.findById(id);
    if (!emergency) {
      return res.status(404).json({ success: false, error: 'Emergency not found' });
    }

    // Prevent duplicate responses
    if (emergency.respondentList.includes(userId)) {
      return res.status(400).json({ success: false, error: 'You have already responded to this emergency' });
    }

    emergency.respondents += 1;
    emergency.respondentList.push(userId);
    await emergency.save();

    // Award coins to helper
    const helper = await User.findById(userId);
    if (helper) {
      helper.tokens = (helper.tokens || 0) + 20;
      helper.reputation = Math.min(5, (helper.reputation || 0) + 0.3);
      helper.totalHelps = (helper.totalHelps || 0) + 1;
      helper.tokenHistory.push({
        amount: 20,
        reason: `Responded to emergency: ${emergency.title}`,
        earnedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      });
      await helper.save();
    }

    // Notification for helper
    await Notification.create({
      userId,
      type: 'reward',
      title: '+20 Coins Earned!',
      description: 'You helped with an emergency request',
      actionUrl: '/emergency',
    });

    // Notification for poster
    await Notification.create({
      userId: emergency.userId,
      type: 'emergency',
      title: 'Someone Responded!',
      description: `${userName || 'A user'} is on their way to help`,
      actionUrl: '/emergency',
    });

    res.json({
      success: true,
      emergency,
      coinsEarned: 20,
      reputationGained: 0.3,
    });
  } catch (error) {
    console.error('Error responding to emergency:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/emergencies/:id/resolve — Resolve an emergency
 */
router.put('/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;

    const emergency = await Emergency.findById(id);
    if (!emergency) {
      return res.status(404).json({ success: false, error: 'Emergency not found' });
    }

    emergency.resolved = true;
    await emergency.save();

    // Award reputation to poster
    const poster = await User.findById(emergency.userId);
    if (poster) {
      poster.reputation = Math.min(5, (poster.reputation || 0) + 0.5);
      await poster.save();
    }

    // Send completion notification
    await Notification.create({
      userId: emergency.userId,
      type: 'system',
      title: 'Emergency Resolved',
      description: `Your emergency "${emergency.title}" has been resolved`,
      actionUrl: '/emergency',
    });

    res.json({ success: true, emergency });
  } catch (error) {
    console.error('Error resolving emergency:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
