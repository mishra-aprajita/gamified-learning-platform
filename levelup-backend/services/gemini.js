// services/gemini.js
// ─────────────────────────────────────────────────────────────
//  Production-ready Google Gemini AI service for XPify.
//  Crash-proof, rate-limit aware, strict error handling.
//
//  SDK:   @google/generative-ai (official Google SDK)
//  Model: gemini-1.5-flash (stable, production-safe)
// ─────────────────────────────────────────────────────────────
'use strict';

const { GoogleGenerativeAI } = require('@google/generative-ai');

// ── Constants ────────────────────────────────────────────────
// IMPORTANT: Using gemini-pro for SDK v1beta compatibility
// SDK version ~0.24.x uses v1beta API, which requires gemini-pro
// gemini-1.5-flash causes 404 errors with current SDK version
const GEMINI_MODEL = 'gemini-pro';

// ── SDK Instance (lazy init) ─────────────────────────────────
let genAI = null;

/**
 * Initialize the Google Generative AI SDK with the API key from environment.
 * Returns null if key is missing (graceful degradation).
 */
const initSDK = () => {
  if (genAI) return genAI; // Already initialized

  const apiKey = process.env.GEMINI_API_KEY;
  
  // Graceful handling of missing/invalid keys
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    console.warn('[Gemini] GEMINI_API_KEY is missing or invalid');
    return null;
  }

  if (apiKey === 'your-gemini-api-key-here' || 
      apiKey === 'YOUR_GEMINI_API_KEY' ||
      apiKey === 'your_gemini_api_key_here') {
    console.warn('[Gemini] GEMINI_API_KEY is still set to placeholder value');
    return null;
  }

  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('[Gemini] SDK initialized successfully');
    return genAI;
  } catch (error) {
    console.error('[Gemini] Failed to initialize SDK:', error.message);
    return null;
  }
};

// ── Config helpers ───────────────────────────────────────────
/**
 * Returns true when a real, non-placeholder key is present at runtime.
 */
const isConfigured = () => {
  const key = process.env.GEMINI_API_KEY;
  return typeof key === 'string' && 
         key.length > 0 && 
         key !== 'your-gemini-api-key-here' && 
         key !== 'YOUR_GEMINI_API_KEY' &&
         key !== 'your_gemini_api_key_here';
};

// ── Core generator ───────────────────────────────────────────
/**
 * Calls the Gemini generateContent using the official SDK with strict format.
 * Always returns a string (never throws), using fallbacks on any error.
 *
 * @param {object} opts
 * @param {string}   opts.systemPrompt - Nova's personality/instructions
 * @param {string}   opts.message      - Current user message
 * @param {number}  [opts.maxTokens]   - maxOutputTokens (default 200)
 * @param {number}  [opts.temperature] - sampling temperature (default 0.7)
 * @returns {Promise<string>}          - the model's text reply or fallback
 */
const generate = async ({ systemPrompt, message, maxTokens = 200, temperature = 0.7 }) => {
  try {
    const ai = initSDK();
    if (!ai) {
      console.warn('[Gemini] SDK not initialized, using fallback');
      return getFallbackResponse('not_configured');
    }

    const model = ai.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction: systemPrompt,
    });

    // Strict SDK format as required: generateContent with contents array
    const result = await model.generateContent({
      contents: [{ 
        role: "user", 
        parts: [{ text: message }] 
      }],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    });

    const response = await result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      console.warn('[Gemini] Empty response from API');
      return getFallbackResponse('empty_response');
    }

    console.log('[Gemini] Successfully generated response');
    return text.trim();
    
  } catch (error) {
    // Handle specific error types
    const errorMessage = error.message || String(error);
    
    if (errorMessage.includes('quota') || 
        errorMessage.includes('rate limit') || 
        errorMessage.includes('429')) {
      console.warn('[Gemini] Quota/rate limit exceeded:', errorMessage);
      return getFallbackResponse('rate_limit');
    }
    
    if (errorMessage.includes('API key') || 
        errorMessage.includes('authentication') ||
        errorMessage.includes('401') ||
        errorMessage.includes('403')) {
      console.error('[Gemini] Authentication error:', errorMessage);
      return getFallbackResponse('auth_error');
    }
    
    // Generic error
    console.error('[Gemini] API error:', errorMessage);
    return getFallbackResponse('api_error');
  }
};

/**
 * Returns appropriate fallback messages based on error type.
 * Never crashes, always returns a user-friendly string.
 */
const getFallbackResponse = (errorType) => {
  const fallbacks = {
    not_configured: 'Nova is not configured yet. Please check back later!',
    empty_response: 'Nova seems to be lost in thought. Please try again.',
    rate_limit: 'Nova is currently busy. Please try again in a moment.',
    auth_error: 'Nova is having trouble connecting. Please try again.',
    api_error: 'Nova is having trouble responding right now. Please try again.',
  };
  
  return fallbacks[errorType] || fallbacks.api_error;
};

// ── Exports ──────────────────────────────────────────────────
module.exports = {
  isConfigured,
  generate,
  GEMINI_MODEL,
};
