// controllers/novaController.js
const fs = require('fs');
const path = require('path');
const User = require('../models/User');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const isGeminiConfigured = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  return !!(apiKey && apiKey !== 'your-gemini-api-key-here');
};

const sendUnconfiguredError = (res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const isPlaceholder = apiKey === 'your-gemini-api-key-here';
  const isDev = process.env.NODE_ENV !== 'production';

  const envPath = path.resolve(__dirname, '../.env');
  const envLoaded = fs.existsSync(envPath);

  let errorDetail = "GEMINI_API_KEY is missing from runtime environment.";
  if (isPlaceholder) {
    errorDetail = "GEMINI_API_KEY is set to the default placeholder value.";
  }

  return res.status(503).json({
    success: false,
    error: errorDetail,
    message: isDev
      ? "Nova AI chat is not configured yet. Ask your admin to add a valid GEMINI_API_KEY to the backend .env file."
      : "Nova AI chat is not configured yet. Ask your admin to configure a valid GEMINI_API_KEY in the Render dashboard environment variables.",
    source: "backend",
    envLoaded
  });
};

// Nova's personality/instructions — keeps replies short, encouraging, on-topic
const SYSTEM_PROMPT = `You are Nova, a friendly and encouraging study companion inside a student learning app called XPify.
Your job is to give short, practical, motivating study tips and answer learning-related questions
(DSA, web dev, ML, system design, exam prep, focus habits, etc).
Keep replies under 120 words, use a warm and energetic tone, and occasionally use 1-2 emojis.
Never answer questions unrelated to learning, studying, or productivity — gently redirect back to studying instead.`;

// ────────────────────────────────────────────
// @route  POST /api/nova/chat
// @desc   Send a message to Nova and get an AI-generated reply
// @body   { message, history? }   history = [{ role: 'user'|'assistant', content }]
// @access Private
// ────────────────────────────────────────────
exports.chatWithNova = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    if (!isGeminiConfigured()) {
      return sendUnconfiguredError(res);
    }

    // Pull in a little context about the student so Nova's tips feel personal
    const user = await User.findById(req.user._id);
    const contextNote = `Student context: name=${user.name}, level=${user.level}, XP=${user.xp}, streak=${user.streak} days, skills=${(user.skills || []).join(', ') || 'none listed'}.`;

    // Keep the conversation to the last 10 turns to control cost/latency
    // Gemini roles: user, model
    const trimmedHistory = history.slice(-10).map(h => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }],
    }));

    const contents = [
      ...trimmedHistory,
      { role: 'user', parts: [{ text: message }] }
    ];

    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT + '\n' + contextNote }]
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        }
      }),
    });

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      console.error('Gemini API error:', data);
      return res.status(502).json({ success: false, message: data.error?.message || 'Nova could not respond right now' });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Sorry, I couldn't think of a reply — try again? 🙂";

    res.status(200).json({ success: true, reply });
  } catch (err) {
    next(err);
  }
};

// ────────────────────────────────────────────
// @route  GET /api/nova/daily-tip
// @desc   Get one short, personalized study tip for the day (no chat needed)
// @access Private
// ────────────────────────────────────────────
exports.getDailyTip = async (req, res, next) => {
  try {
    if (!isGeminiConfigured()) {
      return res.status(200).json({
        success: true,
        tip: "Consistency beats intensity — even 20 focused minutes today keeps your streak alive! 🔥",
        fallback: true,
      });
    }

    const user = await User.findById(req.user._id);
    const prompt = `Give one short (under 40 words), specific, motivating study tip for a student at level ${user.level} with a ${user.streak}-day streak and these skills: ${(user.skills || []).join(', ') || 'general learning'}. No greeting, just the tip.`;

    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: prompt }] }
        ],
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        },
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 80,
        }
      }),
    });

    const data = await geminiRes.json();
    if (!geminiRes.ok) {
      return res.status(200).json({
        success: true,
        tip: "Break your next task into a 10-minute first step — momentum does the rest. 🚀",
        fallback: true,
      });
    }

    const tip = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    res.status(200).json({ success: true, tip, fallback: false });
  } catch (err) {
    next(err);
  }
};
