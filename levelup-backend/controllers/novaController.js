// controllers/novaController.js
// ─────────────────────────────────────────────────────────────
//  Nova AI Chat controller — delegates all LLM logic to
//  services/gemini.js.  Zero AI code lives in this file.
// ─────────────────────────────────────────────────────────────
'use strict';

const User   = require('../models/User');
const gemini = require('../services/gemini');

// ── Shared system prompt ──────────────────────────────────────
// Nova's personality — referenced by both chatWithNova and getDailyTip
const NOVA_SYSTEM_PROMPT = `You are Nova, a friendly and encouraging study companion inside a student learning app called XPify.
Your job is to give short, practical, motivating study tips and answer learning-related questions
(DSA, web dev, ML, system design, exam prep, focus habits, etc).
Keep replies under 120 words, use a warm and energetic tone, and occasionally use 1-2 emojis.
Never answer questions unrelated to learning, studying, or productivity — gently redirect back to studying instead.`;

// ── Error response helpers ────────────────────────────────────
const isDev = () => process.env.NODE_ENV !== 'production';

/**
 * Sends a structured 503 when GEMINI_API_KEY is missing or is a placeholder.
 * In development: includes full diagnostics.
 * In production:  returns a safe, generic admin instruction only.
 */
const sendUnconfiguredError = (res) => {
  const diag = gemini.getDiagnostics();
  return res.status(503).json({
    success: false,
    error:   `GEMINI_API_KEY ${diag.keyStatus}.`,
    message: isDev()
      ? 'Nova AI chat is not configured. Add a valid GEMINI_API_KEY to the backend .env file.'
      : 'Nova AI chat is not configured. Ask your admin to configure GEMINI_API_KEY in the Render dashboard.',
    source:  'backend',
    ...(isDev() ? { diagnostics: diag } : {}),
  });
};

/**
 * Maps an error thrown by services/gemini.js to an HTTP response.
 * Exposes full details in development; redacts in production.
 */
const sendGeminiError = (res, err) => {
  console.error('[Nova] Gemini API error:', err.message, err.code || '');
  return res.status(502).json({
    success: false,
    message: isDev()
      ? err.message
      : 'Nova could not respond right now. Please try again.',
    ...(isDev() ? {
      source:   err.source  || 'gemini-api',
      code:     err.code    || null,
      status:   err.status  || null,
      model:    gemini.GEMINI_MODEL,
      apiVer:   gemini.GEMINI_API_VER,
    } : {}),
  });
};

// ─────────────────────────────────────────────────────────────
// @route  POST /api/nova/chat
// @desc   Send a user message to Nova; receive an AI-generated reply.
// @body   { message: string, history?: Array<{role, content}> }
// @access Private
// ─────────────────────────────────────────────────────────────
exports.chatWithNova = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    if (!gemini.isConfigured()) {
      return sendUnconfiguredError(res);
    }

    // Pull student context so Nova's replies feel personal
    const user        = await User.findById(req.user._id);
    const contextNote = `Student context: name=${user.name}, level=${user.level}, XP=${user.xp}, streak=${user.streak} days, skills=${(user.skills || []).join(', ') || 'none listed'}.`;

    // Build contents array in Gemini format (roles: 'user' | 'model')
    // Trim history to last 10 turns to control cost and latency
    const trimmedHistory = history.slice(-10).map((h) => ({
      role:  h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(h.content) }],
    }));

    const contents = [
      ...trimmedHistory,
      { role: 'user', parts: [{ text: message.trim() }] },
    ];

    const reply = await gemini.generate({
      systemPrompt: `${NOVA_SYSTEM_PROMPT}\n${contextNote}`,
      contents,
      maxTokens:    200,
      temperature:  0.7,
    });

    return res.status(200).json({ success: true, reply });
  } catch (err) {
    // Gemini service errors have err.source === 'gemini-api'
    if (err.source === 'gemini-api' || err.source === 'gemini-service') {
      return sendGeminiError(res, err);
    }
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// @route  GET /api/nova/daily-tip
// @desc   Returns one short personalised study tip.
//         Falls back to a hardcoded tip when AI is unconfigured.
// @access Private
// ─────────────────────────────────────────────────────────────
exports.getDailyTip = async (req, res, next) => {
  try {
    // Graceful fallback — app stays usable without the API key
    if (!gemini.isConfigured()) {
      return res.status(200).json({
        success:  true,
        tip:      'Consistency beats intensity — even 20 focused minutes today keeps your streak alive! 🔥',
        fallback: true,
      });
    }

    const user   = await User.findById(req.user._id);
    const prompt = `Give one short (under 40 words), specific, motivating study tip for a student at level ${user.level} with a ${user.streak}-day streak and these skills: ${(user.skills || []).join(', ') || 'general learning'}. No greeting, just the tip.`;

    const tip = await gemini.generate({
      systemPrompt: NOVA_SYSTEM_PROMPT,
      contents:     [{ role: 'user', parts: [{ text: prompt }] }],
      maxTokens:    80,
      temperature:  0.8,
    });

    return res.status(200).json({ success: true, tip, fallback: false });
  } catch (err) {
    // On any Gemini error, serve fallback tip — never break the dashboard
    console.error('[Nova] getDailyTip error, serving fallback:', err.message);
    return res.status(200).json({
      success:  true,
      tip:      'Break your next task into a 10-minute first step — momentum does the rest. 🚀',
      fallback: true,
    });
  }
};
