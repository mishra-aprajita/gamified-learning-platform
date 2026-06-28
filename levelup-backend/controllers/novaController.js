// controllers/novaController.js
const User = require('../models/User');

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL    = 'gpt-4o-mini'; // fast + cheap, good enough for short study tips

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

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: 'Nova AI chat is not configured yet. Ask your admin to add OPENAI_API_KEY to the backend .env file.',
      });
    }

    // Pull in a little context about the student so Nova's tips feel personal
    const user = await User.findById(req.user._id);
    const contextNote = `Student context: name=${user.name}, level=${user.level}, XP=${user.xp}, streak=${user.streak} days, skills=${(user.skills || []).join(', ') || 'none listed'}.`;

    // Keep the conversation to the last 10 turns to control cost/latency
    const trimmedHistory = history.slice(-10).map(h => ({
      role: h.role === 'assistant' ? 'assistant' : 'user',
      content: h.content,
    }));

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT + '\n' + contextNote },
      ...trimmedHistory,
      { role: 'user', content: message },
    ];

    const openaiRes = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages,
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    const data = await openaiRes.json();

    if (!openaiRes.ok) {
      console.error('OpenAI API error:', data);
      return res.status(502).json({ success: false, message: data.error?.message || 'Nova could not respond right now' });
    }

    const reply = data.choices?.[0]?.message?.content?.trim() || "Sorry, I couldn't think of a reply — try again? 🙂";

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
    if (!process.env.OPENAI_API_KEY) {
      return res.status(200).json({
        success: true,
        tip: "Consistency beats intensity — even 20 focused minutes today keeps your streak alive! 🔥",
        fallback: true,
      });
    }

    const user = await User.findById(req.user._id);
    const prompt = `Give one short (under 40 words), specific, motivating study tip for a student at level ${user.level} with a ${user.streak}-day streak and these skills: ${(user.skills || []).join(', ') || 'general learning'}. No greeting, just the tip.`;

    const openaiRes = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        max_tokens: 80,
        temperature: 0.8,
      }),
    });

    const data = await openaiRes.json();
    if (!openaiRes.ok) {
      return res.status(200).json({
        success: true,
        tip: "Break your next task into a 10-minute first step — momentum does the rest. 🚀",
        fallback: true,
      });
    }

    const tip = data.choices?.[0]?.message?.content?.trim();
    res.status(200).json({ success: true, tip, fallback: false });
  } catch (err) {
    next(err);
  }
};
