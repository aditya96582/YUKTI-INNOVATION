/**
 * Medical Connect Routes — MongoDB Backed
 */

const express = require('express');
const router = express.Router();
const { MedicalRequest } = require('../config/database');
const ocrService = require('../services/ocrService');
const notificationService = require('../services/notificationService');

/**
 * GET /api/medical — Get all medical requests
 */
router.get('/', async (req, res) => {
  try {
    const requests = await MedicalRequest.find().sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/medical — Create new medical request
 */
router.post('/', async (req, res) => {
  try {
    const { medicines, location, userId, userName, prescriptionImage } = req.body;

    if (!medicines || !location || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: medicines, location, userId',
      });
    }

    const request = await MedicalRequest.create({
      medicines,
      location,
      userId,
      userName,
      prescriptionImage: prescriptionImage || '',
      status: 'pending',
      pharmacyResponses: [],
    });

    res.json({ success: true, request, id: request._id.toString() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/medical/ocr/extract — Extract medicines from prescription
 */
router.post('/ocr/extract', async (req, res) => {
  try {
    const { imageBase64, requestId } = req.body;

    if (!imageBase64 && !requestId) {
      return res.status(400).json({
        success: false,
        error: 'Either imageBase64 or requestId is required',
      });
    }

    const result = await ocrService.extractMedicines(imageBase64 || 'mock');

    res.json({
      success: true,
      medicines: result.medicines,
      ocrText: result.ocrText,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/medical/:id/notify — Notify nearby pharmacies
 */
router.post('/:id/notify', async (req, res) => {
  try {
    const { id } = req.params;
    const request = await MedicalRequest.findById(id);

    if (!request) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    request.status = 'notified';
    await request.save();

    const pharmacyUserIds = ['pharmacy_1', 'pharmacy_2', 'pharmacy_3'];
    await notificationService.notifyPharmacies(request, pharmacyUserIds);

    res.json({ success: true, message: 'Pharmacies notified', notifiedCount: pharmacyUserIds.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/medical/:id/respond — Pharmacy responds to request
 */
router.post('/:id/respond', async (req, res) => {
  try {
    const { id } = req.params;
    const { pharmacyName, available, price, estimatedTime } = req.body;

    const request = await MedicalRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    const response = {
      pharmacyName,
      available: available !== false,
      price: price || 0,
      estimatedTime: estimatedTime || '30 minutes',
      respondedAt: new Date(),
    };

    request.pharmacyResponses.push(response);
    request.status = 'matched';
    await request.save();

    res.json({ success: true, response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/medical/:id/accept — User accepts a pharmacy response
 */
router.post('/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;
    const { pharmacyName, deliveryMode } = req.body;

    const request = await MedicalRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    request.acceptedPharmacy = pharmacyName;
    request.deliveryMode = deliveryMode || 'pickup';
    request.status = 'accepted';
    await request.save();

    res.json({ success: true, message: 'Pharmacy accepted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/medical/:id/fulfill — Mark request as fulfilled
 */
router.post('/:id/fulfill', async (req, res) => {
  try {
    const { id } = req.params;

    const request = await MedicalRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    request.status = 'fulfilled';
    await request.save();

    res.json({ success: true, message: 'Request fulfilled' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/medical/alternatives/:medicineName — Get alternatives
 */
router.get('/alternatives/:medicineName', (req, res) => {
  try {
    const { medicineName } = req.params;

    const alternatives = {
      'paracetamol': ['Crocin', 'Dolo', 'Calpol'],
      'cetirizine': ['Zyrtec', 'Alerid', 'Cetrizet'],
      'amoxicillin': ['Amoxil', 'Moxikind', 'Novamox'],
    };

    const alts = alternatives[medicineName.toLowerCase()] || [];
    res.json({ success: true, alternatives: alts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
