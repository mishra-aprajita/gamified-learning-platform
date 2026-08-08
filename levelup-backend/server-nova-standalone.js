// ─────────────────────────────────────────────────────────────
//  XPify Backend  –  Production-Ready Nova AI Server
//  Single-file implementation for easy deployment and testing
//  Run:  npm run dev   (development)
//        npm start     (production)
// ─────────────────────────────────────────────────────────────
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ─────────────────────────────────────────────────────────────
//  CONFIGURATION
// ─────────────────────────────────────────────────────────────

// IMPORTANT: Using gemini-pro for SDK v1beta compatibility
// SDK version ~0.24.x uses v1beta API, which requires gemini-pro
// gemini-1.5-flash causes 404 errors with current SDK version
const GEMINI_MODEL = 'gemini-pro';

const NOVA_SYSTEM_PROMPT = `You are Nova, a friendly and encouraging study companion inside a student learning app called XPify.
Your job is to give short, practical, motivating study tips and answer learning-related questions
(DSA, web dev, ML, system design, exam prep, focus habits, etc).
Keep replies under 120 words, use a warm and energetic tone, and occasionally use 1-2 emojis.
Never answer questions unrelated to learning, studying, or productivity — gently redirect back to studying instead.`;

// ─────────────────────────────────────────────────────────────
//  GEMINI SERVICE
// ─────────────────────────────────────────────────────────────

let genAI = null;

/**
 * Initialize the Google Generative AI SDK with graceful error handling
 * Returns null if key is missing (graceful degradation)
 */
const initGeminiSDK = () => {
  if (genAI) return genAI;

  const apiKey = process.env.GEMINI_API_KEY;

  // Check for missing or invalid API keys
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    console.warn('[Nova] ⚠️  GEMINI_API_KEY is missing or invalid');
    return null;
  }

  // Check for placeholder values
  const placeholders = [
    'your-gemini-api-key-here',
    'YOUR_GEMINI_API_KEY',
    'your_gemini_api_key_here',
    'AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  ];

  if (placeholders.includes(apiKey)) {
    console.warn('[Nova] ⚠️  GEMINI_API_KEY is still set to placeholder value');
    return null;
  }

  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('[Nova] ✅ Gemini SDK initialized successfully');
    return genAI;
  } catch (error) {
    console.error('[Nova] ❌ Failed to initialize Gemini SDK:', error.message);
    return null;
  }
};

/**
 * Check if Gemini is properly configured
 */
const isGeminiConfigured = () => {
  const key = process.env.GEMINI_API_KEY;
  return typeof key === 'string' && 
         key.length > 0 && 
         key !== 'your-gemini-api-key-here' && 
         key !== 'YOUR_GEMINI_API_KEY' &&
         key !== 'your_gemini_api_key_here' &&
         key !== 'AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
};

/**
 * Generate AI response using Gemini API with strict error handling
 * ALWAYS returns a string (never throws), using fallbacks on any error
 */
const generateNovaResponse = async (message) => {
  try {
    const ai = initGeminiSDK();
    
    if (!ai) {
      console.warn('[Nova] ⚠️  SDK not initialized, using fallback');
      return getFallbackResponse('not_configured');
    }

    const model = ai.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction: NOVA_SYSTEM_PROMPT,
    });

    console.log('[Nova] 📤 Sending request to Gemini API...');
    console.log('[Nova] 📝 Message:', message.substring(0, 100) + (message.length > 100 ? '...' : ''));

    // STRICT SDK FORMAT as required - no deprecated patterns
    const result = await model.generateContent({
      contents: [{ 
        role: "user", 
        parts: [{ text: message }] 
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200,
      },
    });

    const response = await result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      console.warn('[Nova] ⚠️  Empty response from API');
      return getFallbackResponse('empty_response');
    }

    console.log('[Nova] ✅ Successfully generated response');
    console.log('[Nova] 📥 Reply length:', text.length, 'characters');
    
    return text.trim();
    
  } catch (error) {
    const errorMessage = error.message || String(error);
    console.error('[Nova] ❌ API Error:', errorMessage);
    
    // Detect specific error types for user-friendly messages
    if (errorMessage.includes('quota') || 
        errorMessage.includes('rate limit') || 
        errorMessage.includes('429')) {
      console.warn('[Nova] ⚠️  Quota/rate limit exceeded');
      return getFallbackResponse('rate_limit');
    }
    
    if (errorMessage.includes('API key') || 
        errorMessage.includes('authentication') ||
        errorMessage.includes('401') ||
        errorMessage.includes('403')) {
      console.error('[Nova] ⚠️  Authentication error');
      return getFallbackResponse('auth_error');
    }

    if (errorMessage.includes('404') || 
        errorMessage.includes('not found')) {
      console.error('[Nova] ⚠️  Model/API endpoint not found');
      return getFallbackResponse('model_error');
    }

    // Generic error fallback
    return getFallbackResponse('api_error');
  }
};

/**
 * Returns user-friendly fallback messages based on error type
 * Never crashes, always returns a string
 */
const getFallbackResponse = (errorType) => {
  const fallbacks = {
    not_configured: 'Nova is not configured yet. Please check back later!',
    empty_response: 'Nova seems to be lost in thought. Please try again.',
    rate_limit: 'Nova is currently busy. Please try again in a moment.',
    auth_error: 'Nova is having trouble connecting. Please try again.',
    model_error: 'Nova is experiencing technical difficulties. Please try again.',
    api_error: 'Nova is having trouble responding right now. Please try again.',
  };
  
  return fallbacks[errorType] || fallbacks.api_error;
};

// ─────────────────────────────────────────────────────────────
//  EXPRESS SERVER SETUP
// ─────────────────────────────────────────────────────────────

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Parse JSON bodies (CRITICAL for POST /api/nova/chat)
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ─────────────────────────────────────────────────────────────
//  API ROUTES
// ─────────────────────────────────────────────────────────────

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: '⚡ XPify API is running!', 
    timestamp: new Date(),
    nova: {
      configured: isGeminiConfigured(),
      model: GEMINI_MODEL
    }
  });
});

/**
 * Nova AI Chat endpoint
 * POST /api/nova/chat
 * Body: { message: string }
 */
app.post('/api/nova/chat', async (req, res) => {
  // Wrap entire handler in try/catch to prevent ANY crashes
  try {
    console.log('[Nova] 🚀 Received chat request');
    console.log('[Nova] 📦 Request body:', JSON.stringify(req.body));

    const { message } = req.body;

    // Strict input validation
    if (!message || typeof message !== 'string') {
      console.error('[Nova] ❌ Invalid message: missing or not a string');
      return res.status(400).json({ 
        reply: 'Please provide a valid message.' 
      });
    }

    if (message.trim().length === 0) {
      console.error('[Nova] ❌ Invalid message: empty string');
      return res.status(400).json({ 
        reply: 'Please provide a valid message.' 
      });
    }

    if (message.trim().length > 5000) {
      console.error('[Nova] ❌ Invalid message: too long');
      return res.status(400).json({ 
        reply: 'Message is too long. Please keep it under 5000 characters.' 
      });
    }

    const trimmedMessage = message.trim();
    console.log('[Nova] ✅ Message validated successfully');

    // Log API key presence (never log the actual key)
    console.log('[Nova] 🔑 API Key present:', isGeminiConfigured() ? '✅ Yes' : '❌ No');

    // Call Gemini service (handles all errors internally)
    const reply = await generateNovaResponse(trimmedMessage);

    // STRICT RESPONSE FORMAT: { reply: string }
    console.log('[Nova] 📤 Sending response to client');
    return res.status(200).json({ reply });

  } catch (error) {
    // This catch block should never be reached due to service-level error handling
    // But it's here as ultimate safety net
    console.error('[Nova] ❌ UNEXPECTED ERROR in controller:', error.message);
    console.error('[Nova] 📚 Stack trace:', error.stack);
    
    // NEVER crash - always return valid response
    return res.status(500).json({ 
      reply: 'Nova is having trouble responding right now. Please try again.' 
    });
  }
});

// 404 handler
app.use((req, res) => {
  console.log('[Server] ❌ 404 - Route not found:', req.path);
  res.status(404).json({ success: false, message: `Route ${req.path} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server] ❌ Global error handler:', err.message);
  console.error('[Server] 📚 Stack trace:', err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ─────────────────────────────────────────────────────────────
//  START SERVER
// ─────────────────────────────────────────────────────────────

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[Server] ❌ Unhandled Promise Rejection:', err.message);
  console.error('[Server] 📚 Stack trace:', err.stack);
  // Don't crash - log and continue
});

process.on('uncaughtException', (err) => {
  console.error('[Server] ❌ Uncaught Exception:', err.message);
  console.error('[Server] 📚 Stack trace:', err.stack);
  // Don't crash - log and continue
});

// Start listening
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 XPify Nova AI Server - Production Ready');
  console.log('='.repeat(60));
  console.log(`🌐 Server running on: http://localhost:${PORT}`);
  console.log(`🌍 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  console.log(`🤖 Gemini Model: ${GEMINI_MODEL}`);
  console.log(`🔑 API Key Status: ${isGeminiConfigured() ? '✅ Configured' : '❌ Missing/Placeholder'}`);
  console.log(`📦 Node Version: ${process.version}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(60) + '\n');
  
  if (!isGeminiConfigured()) {
    console.warn('⚠️  WARNING: GEMINI_API_KEY is not configured!');
    console.warn('⚠️  Nova will use fallback responses until API key is set.\n');
  }
});

module.exports = app;