/**
 * Image Generation & Analysis Routes
 */

const express = require('express');
const router = express.Router();
const imageGenerator = require('../services/imageGenerator');

/**
 * POST /api/images/generate
 * Generate placeholder image for item
 */
router.post('/generate', async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        error: 'Title and category are required'
      });
    }

    const imageData = await imageGenerator.generateImage({
      title,
      description: description || '',
      category
    });

    res.json({
      success: true,
      image: imageData,
      type: 'generated'
    });
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/images/analyze
 * Analyze uploaded image using Google Gemini
 */
router.post('/analyze', async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        error: 'Image data is required'
      });
    }

    const analysis = await imageGenerator.analyzeImage(image);

    res.json(analysis);
  } catch (error) {
    console.error('Image analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/images/enhance-description
 * Enhance item description using AI
 */
router.post('/enhance-description', async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        error: 'Title, description, and category are required'
      });
    }

    const enhancedDescription = await imageGenerator.enhanceDescription({
      title,
      description,
      category
    });

    res.json({
      success: true,
      originalDescription: description,
      enhancedDescription
    });
  } catch (error) {
    console.error('Description enhancement error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/images/placeholder/:category
 * Get placeholder image for category
 */
router.get('/placeholder/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { title = 'Item' } = req.query;

    const imageData = await imageGenerator.generatePlaceholder({
      title,
      category
    });

    // Return SVG directly
    if (imageData.startsWith('data:image/svg+xml')) {
      const svgData = Buffer.from(imageData.split(',')[1], 'base64').toString();
      res.setHeader('Content-Type', 'image/svg+xml');
      res.send(svgData);
    } else {
      res.json({
        success: true,
        image: imageData
      });
    }
  } catch (error) {
    console.error('Placeholder generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/images/test
 * Test API connection
 */
router.get('/test', async (req, res) => {
  try {
    const result = await imageGenerator.testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
