// controllers/novaController.js
// ─────────────────────────────────────────────────────────────
//  Production-ready Nova AI Chat controller.
//  Crash-proof, strict response format, comprehensive error handling.
// ─────────────────────────────────────────────────────────────
'use strict';

const gemini = require('../services/gemini');

// ── System prompt ──────────────────────────────────────────────
const NOVA_SYSTEM_PROMPT = `You are Nova, a friendly and encouraging study companion inside a student learning app called XPify.
Your job is to give short, practical, motivating study tips and answer learning-related questions
(DSA, web dev, ML, system design, exam prep, focus habits, etc).
Keep replies under 120 words, use a warm and energetic tone, and occasionally use 1-2 emojis.
Never answer questions unrelated to learning, studying, or productivity — gently redirect back to studying instead.`;

// ── Logging helpers ───────────────────────────────────────────
const logRequest = (req, message) => {
  console.log(`[Nova API] ${req.method} ${req.path} | Message: "${message}" | IP: ${req.ip}`);
};

const logSuccess = (replyLength) => {
  console.log(`[Nova API] ✅ Success | Reply length: ${replyLength} chars`);
};

const logError = (error, context) => {
  console.error(`[Nova API] ❌ Error | Context: ${context} | Error: ${error.message || error}`);
};

// ── Validation helpers ────────────────────────────────────────
const isValidMessage = (message) => {
  return message && 
         typeof message === 'string' && 
         message.trim().length > 0 &&
         message.trim().length <= 5000; // Prevent abuse
};

// ─────────────────────────────────────────────────────────────
// @route  POST /api/nova/chat
// @desc   Send a user message to Nova; receive an AI-generated reply.
// @body   { message: string }
// @access Private (requires authentication)
// ─────────────────────────────────────────────────────────────
exports.chatWithNova = async (req, res) => {
  // Wrap entire handler in try/catch to prevent ANY crashes
  try {
    const { message } = req.body;

    // Validate input
    if (!isValidMessage(message)) {
      logError(new Error('Invalid message'), 'validation');
      return res.status(400).json({ 
        reply: 'Please provide a valid message (1-5000 characters).' 
      });
    }

    const trimmedMessage = message.trim();
    logRequest(req, trimmedMessage);

    // Call Gemini service (handles all errors internally)
    const reply = await gemini.generate({
      systemPrompt: NOVA_SYSTEM_PROMPT,
      message: trimmedMessage,
      maxTokens: 200,
      temperature: 0.7,
    });

    // Always return strict { reply: string } format
    logSuccess(reply.length);
    return res.status(200).json({ reply });

  } catch (error) {
    // This catch block should never be reached due to service-level error handling
    // But it's here as ultimate safety net
    logError(error, 'unexpected');
    
    // Never crash - always return valid response
    return res.status(500).json({ 
      reply: 'Nova is having trouble responding right now. Please try again.' 
    });
  }
};
