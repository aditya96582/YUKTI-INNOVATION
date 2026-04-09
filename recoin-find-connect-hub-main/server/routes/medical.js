/**
 * Medical Connect Routes
 */

const express = require('express');
const router = express.Router();
const { db } = require('../data/db');
const ocrService = require('../services/ocrService');
const notificationService = require('../services/notificationService');

/**
 * GET /api/medical
 * Get all medical requests
 */
router.get('/', (req, res) => {
  try {
    if (!db.medicalRequests) db.medicalRequests = [];
    res.json({ success: true, requests: db.medicalRequests });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/medical
 * Create new medical request
 */
router.post('/', (req, res) => {
  try {
    const { medicines, location, userId, userName, prescriptionImage } = req.body;

    if (!medicines || !location || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: medicines, location, userId'
      });
    }

    const request = {
      id: `med_${Date.now()}`,
      medicines,
      location,
      userId,
      userName,
      prescriptionImage,
      status: 'pending',
      pharmacyResponses: [],
      createdAt: new Date().toISOString()
    };

    if (!db.medicalRequests) db.medicalRequests = [];
    db.medicalRequests.push(request);

    res.json({ success: true, request, id: request.id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/medical/ocr/extract
 * Extract medicines from prescription image using OCR
 */
router.post('/ocr/extract', async (req, res) => {
  try {
    const { imageBase64, requestId } = req.body;

    if (!imageBase64 && !requestId) {
      return res.status(400).json({
        success: false,
        error: 'Either imageBase64 or requestId is required'
      });
    }

    // Simulate OCR extraction
    const result = await ocrService.extractMedicines(imageBase64 || 'mock');

    res.json({
      success: true,
      medicines: result.medicines,
      ocrText: result.ocrText
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/medical/:id/notify
 * Notify nearby pharmacies about medical request
 */
router.post('/:id/notify', async (req, res) => {
  try {
    const { id } = req.params;

    if (!db.medicalRequests) db.medicalRequests = [];
    const request = db.medicalRequests.find(r => r.id === id);

    if (!request) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    // Update status
    request.status = 'notified';

    // Simulate notifying pharmacies (in production, this would send real notifications)
    const pharmacyUserIds = ['pharmacy_1', 'pharmacy_2', 'pharmacy_3'];
    
    await notificationService.notifyPharmacies(request, pharmacyUserIds);

    res.json({ success: true, message: 'Pharmacies notified', notifiedCount: pharmacyUserIds.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/medical/:id/respond
 * Pharmacy responds to medical request
 */
router.post('/:id/respond', (req, res) => {
  try {
    const { id } = req.params;
    const { pharmacyName, available, price, estimatedTime } = req.body;

    if (!db.medicalRequests) db.medicalRequests = [];
    const request = db.medicalRequests.find(r => r.id === id);

    if (!request) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    const response = {
      pharmacyName,
      available: available !== false,
      price: price || 0,
      estimatedTime: estimatedTime || '30 minutes',
      respondedAt: new Date().toISOString()
    };

    request.pharmacyResponses.push(response);
    request.status = 'matched';

    res.json({ success: true, response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/medical/:id/accept
 * User accepts a pharmacy response
 */
router.post('/:id/accept', (req, res) => {
  try {
    const { id } = req.params;
    const { pharmacyName, deliveryMode } = req.body;

    if (!db.medicalRequests) db.medicalRequests = [];
    const request = db.medicalRequests.find(r => r.id === id);

    if (!request) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    request.acceptedPharmacy = pharmacyName;
    request.deliveryMode = deliveryMode || 'pickup';
    request.status = 'accepted';

    res.json({ success: true, message: 'Pharmacy accepted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/medical/:id/fulfill
 * Mark medical request as fulfilled
 */
router.post('/:id/fulfill', (req, res) => {
  try {
    const { id } = req.params;

    if (!db.medicalRequests) db.medicalRequests = [];
    const request = db.medicalRequests.find(r => r.id === id);

    if (!request) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    request.status = 'fulfilled';
    request.fulfilledAt = new Date().toISOString();

    res.json({ success: true, message: 'Request fulfilled' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/medical/alternatives/:medicineName
 * Get alternative medicines
 */
router.get('/alternatives/:medicineName', (req, res) => {
  try {
    const { medicineName } = req.params;

    // Mock alternatives (in production, use a real medicine database)
    const alternatives = {
      'paracetamol': ['Crocin', 'Dolo', 'Calpol'],
      'cetirizine': ['Zyrtec', 'Alerid', 'Cetrizet'],
      'amoxicillin': ['Amoxil', 'Moxikind', 'Novamox']
    };

    const alts = alternatives[medicineName.toLowerCase()] || [];

    res.json({ success: true, alternatives: alts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
