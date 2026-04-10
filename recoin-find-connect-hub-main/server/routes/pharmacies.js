/**
 * Pharmacies Routes
 */

const express = require('express');
const router = express.Router();


/**
 * GET /api/pharmacies
 * Get all pharmacies
 */
router.get('/', (req, res) => {
  try {
    // Mock pharmacy data
    const pharmacies = [
      {
        id: 'pharmacy_1',
        name: 'Jan Aushadhi Kendra',
        location: 'Main Campus, Block A',
        distance: '0.5 km',
        rating: 4.5,
        phone: '+91-9876543210',
        hours: '9:00 AM - 9:00 PM',
        services: ['Prescription', 'OTC', 'Home Delivery']
      },
      {
        id: 'pharmacy_2',
        name: 'Apollo Pharmacy',
        location: 'Near Gate 2',
        distance: '1.2 km',
        rating: 4.3,
        phone: '+91-9876543211',
        hours: '24/7',
        services: ['Prescription', 'OTC', 'Home Delivery', 'Online Consultation']
      },
      {
        id: 'pharmacy_3',
        name: 'MedPlus',
        location: 'Campus Market',
        distance: '0.8 km',
        rating: 4.4,
        phone: '+91-9876543212',
        hours: '8:00 AM - 10:00 PM',
        services: ['Prescription', 'OTC', 'Home Delivery']
      },
      {
        id: 'pharmacy_4',
        name: 'Wellness Forever',
        location: 'Student Center',
        distance: '0.3 km',
        rating: 4.6,
        phone: '+91-9876543213',
        hours: '9:00 AM - 8:00 PM',
        services: ['Prescription', 'OTC', 'Health Checkup']
      }
    ];

    res.json({ success: true, pharmacies });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/pharmacies/:id
 * Get pharmacy by ID
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;

    // Mock pharmacy data
    const pharmacy = {
      id,
      name: 'Jan Aushadhi Kendra',
      location: 'Main Campus, Block A',
      distance: '0.5 km',
      rating: 4.5,
      phone: '+91-9876543210',
      hours: '9:00 AM - 9:00 PM',
      services: ['Prescription', 'OTC', 'Home Delivery'],
      inventory: [
        { name: 'Paracetamol 500mg', available: true, price: 10 },
        { name: 'Cetirizine 10mg', available: true, price: 15 },
        { name: 'Amoxicillin 250mg', available: false, price: 50 }
      ]
    };

    res.json({ success: true, pharmacy });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/pharmacies/:id/check-availability
 * Check medicine availability at pharmacy
 */
router.post('/:id/check-availability', (req, res) => {
  try {
    const { id } = req.params;
    const { medicines } = req.body;

    if (!medicines || !Array.isArray(medicines)) {
      return res.status(400).json({
        success: false,
        error: 'medicines array is required'
      });
    }

    // Mock availability check
    const availability = medicines.map(med => ({
      name: med.name || med,
      available: Math.random() > 0.3, // 70% chance available
      price: Math.floor(Math.random() * 100) + 10,
      stock: Math.floor(Math.random() * 50) + 1
    }));

    res.json({
      success: true,
      pharmacyId: id,
      availability,
      totalPrice: availability.reduce((sum, item) => sum + (item.available ? item.price : 0), 0)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
