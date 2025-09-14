const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Initialize Gemini AI
const ai = new GoogleGenAI({}); // picks API key from GEMINI_API_KEY env var

/**
 * Gemini AI Chat Routes
 */

// Gemini Chat endpoint using official @google/genai SDK
router.post('/chat',
  asyncHandler(async (req, res) => {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        reply: 'Message required'
      });
    }

    // Use Gemini 2.5 Flash model for fastest responses
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      // Optionally, for speed/cost, you could disable "thinking" here
      // config: { thinkingConfig: { thinkingBudget: 0 } }
    });

    res.json({
      success: true,
      reply: response.text
    });
  })
);

module.exports = router;