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

// ─────────────────────────────────────────────────────────────
//  CONFIGURATION
// ─────────────────────────────────────────────────────────────

// Using stable gemini-1.5-flash model with v1 API endpoint
const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_API_VERSION = 'v1';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com';

const NOVA_SYSTEM_PROMPT = `You are Nova, a friendly and encouraging study companion inside a student learning app called XPify.
Your job is to give short, practical, motivating study tips and answer learning-related questions
(DSA, web dev, ML, system design, exam prep, focus habits, etc).
Keep replies under 120 words, use a warm and energetic tone, and occasionally use 1-2 emojis.
Never answer questions unrelated to learning, studying, or productivity — gently redirect back to studying instead.`;

// ─────────────────────────────────────────────────────────────
//  GEMINI SERVICE (Direct REST API - No SDK)
// ─────────────────────────────────────────────────────────────

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
 * Build the complete REST API URL for Gemini
 */
const buildApiUrl = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  return `${GEMINI_BASE_URL}/${GEMINI_API_VERSION}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
};

/**
 * Generate AI response using direct REST API call (no SDK)
 * ALWAYS returns a string (never throws), using fallbacks on any error
 */
const generateNovaResponse = async (message) => {
  try {
    // Check API key
    if (!isGeminiConfigured()) {
      console.warn('[Nova] ⚠️  GEMINI_API_KEY is missing or invalid');
      return getFallbackResponse('not_configured');
    }

    const url = buildApiUrl();
    
    console.log('[Nova] 📤 Sending REST request to Gemini API...');
    console.log('[Nova] 📝 Message:', message.substring(0, 100) + (message.length > 100 ? '...' : ''));
    console.log('[Nova] 🔗 URL:', `${GEMINI_BASE_URL}/${GEMINI_API_VERSION}/models/${GEMINI_MODEL}:generateContent?key=***`);

    // Build request body according to Gemini REST API specification
    const requestBody = {
      contents: [{
        role: "user",
        parts: [{ text: message }]
      }],
      systemInstruction: {
        parts: [{ text: NOVA_SYSTEM_PROMPT }]
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200
      }
    };

    // Make direct REST API call using native fetch
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const responseData = await response.json();

    // Handle HTTP errors
    if (!response.ok) {
      const errorMessage = responseData?.error?.message || `HTTP ${response.status}`;
      console.error('[Nova] ❌ API HTTP Error:', response.status, errorMessage);
      
      // Detect specific error types
      if (response.status === 429 || errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
        return getFallbackResponse('rate_limit');
      }
      if (response.status === 401 || response.status === 403 || errorMessage.includes('API key')) {
        return getFallbackResponse('auth_error');
      }
      if (response.status === 404 || errorMessage.includes('not found')) {
        return getFallbackResponse('model_error');
      }
      
      return getFallbackResponse('api_error');
    }

    // Extract text from Gemini response structure
    const text = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text || text.trim().length === 0) {
      console.warn('[Nova] ⚠️  Empty response from API');
      console.log('[Nova] 📦 Response structure:', JSON.stringify(responseData).substring(0, 200));
      return getFallbackResponse('empty_response');
    }

    console.log('[Nova] ✅ Successfully generated response');
    console.log('[Nova] 📥 Reply length:', text.length, 'characters');
    
    return text.trim();
    
  } catch (error) {
    const errorMessage = error.message || String(error);
    console.error('[Nova] ❌ Request Error:', errorMessage);
    console.error('[Nova] 📚 Stack trace:', error.stack);
    
    // Detect specific error types
    if (errorMessage.includes('quota') || 
        errorMessage.includes('rate limit') || 
        errorMessage.includes('429')) {
      return getFallbackResponse('rate_limit');
    }
    
    if (errorMessage.includes('API key') || 
        errorMessage.includes('authentication') ||
        errorMessage.includes('401') ||
        errorMessage.includes('403')) {
      return getFallbackResponse('auth_error');
    }

    if (errorMessage.includes('ENOTFOUND') || 
        errorMessage.includes('ECONNREFUSED')) {
      return getFallbackResponse('network_error');
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
  console.log(`🤖 Gemini Model: ${GEMINI_MODEL} (${GEMINI_API_VERSION} API)`);
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