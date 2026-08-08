// services/gemini.js
// ─────────────────────────────────────────────────────────────
//  Centralised Google Gemini AI service for XPify.
//  All AI logic lives here — no duplicated SDK init anywhere.
//
//  SDK:   @google/generative-ai (official Google SDK)
//  Model: gemini-2.0-flash  (stable, fast, cost-effective)
// ─────────────────────────────────────────────────────────────
'use strict';

const path = require('path');
const fs   = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ── Constants ────────────────────────────────────────────────
// Stable models as of 2026-08 per https://ai.google.dev/gemini-api/docs/models
// gemini-2.0-flash → fastest stable; gemini-2.5-flash → most capable stable
const GEMINI_MODEL   = 'gemini-2.0-flash';
const GEMINI_API_VER = 'v1beta';

// ── SDK Instance (lazy init) ─────────────────────────────────
let genAI = null;

/**
 * Initialize the Google Generative AI SDK with the API key from environment.
 * Throws if GEMINI_API_KEY is missing or invalid.
 */
const initSDK = () => {
  if (genAI) return genAI; // Already initialized

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    const err = new Error('GEMINI_API_KEY is missing or invalid');
    err.code = 'MISSING_API_KEY';
    err.source = 'gemini-service';
    throw err;
  }

  if (apiKey === 'your-gemini-api-key-here' || apiKey === 'YOUR_GEMINI_API_KEY') {
    const err = new Error('GEMINI_API_KEY is still set to placeholder value');
    err.code = 'PLACEHOLDER_API_KEY';
    err.source = 'gemini-service';
    throw err;
  }

  try {
    genAI = new GoogleGenerativeAI(apiKey);
    return genAI;
  } catch (error) {
    const err = new Error(`Failed to initialize Gemini SDK: ${error.message}`);
    err.code = 'SDK_INIT_FAILED';
    err.source = 'gemini-service';
    err.originalError = error;
    throw err;
  }
};

// ── Config helpers ───────────────────────────────────────────
/**
 * Returns true when a real, non-placeholder key is present at runtime.
 */
const isConfigured = () => {
  const key = process.env.GEMINI_API_KEY;
  return typeof key === 'string' && key.length > 0 && key !== 'your-gemini-api-key-here' && key !== 'YOUR_GEMINI_API_KEY';
};

/**
 * Returns the SDK/runtime diagnostics object.
 * Secrets are never exposed — only the last 4 chars of the key are shown.
 */
const getDiagnostics = () => {
  const key     = process.env.GEMINI_API_KEY || '';
  const envPath = path.resolve(__dirname, '../.env');
  return {
    sdk:         '@google/generative-ai',
    sdkVersion:  require('@google/generative-ai/package.json').version,
    model:       GEMINI_MODEL,
    apiVersion:  GEMINI_API_VER,
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development',
    envFilePresent: fs.existsSync(envPath),
    keyStatus:   !key
      ? 'missing'
      : key === 'your-gemini-api-key-here' || key === 'YOUR_GEMINI_API_KEY'
        ? 'placeholder'
        : `loaded (ends …${key.slice(-4)})`,
  };
};

// ── Core generator ───────────────────────────────────────────
/**
 * Calls the Gemini generateContent using the official SDK.
 *
 * @param {object} opts
 * @param {string}   opts.systemPrompt - Nova's personality/instructions
 * @param {Array}    opts.contents     - Array of {role, parts:[{text}]} turns
 * @param {number}  [opts.maxTokens]   - maxOutputTokens (default 200)
 * @param {number}  [opts.temperature] - sampling temperature (default 0.7)
 * @returns {Promise<string>}          - the model's text reply
 * @throws  {Error}                    - structured error with `.code` and `.source`
 */
const generate = async ({ systemPrompt, contents, maxTokens = 200, temperature = 0.7 }) => {
  try {
    const ai = initSDK();
    const model = ai.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction: systemPrompt,
    });

    // Convert contents array to SDK format
    const history = contents.slice(0, -1).map((item) => ({
      role: item.role === 'model' ? 'model' : 'user',
      parts: [{ text: item.parts[0].text }],
    }));

    const currentMessage = contents[contents.length - 1].parts[0].text;

    // Start chat with history
    const chat = model.startChat({
      history,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    });

    const result = await chat.sendMessage(currentMessage);
    const response = await result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      const err = new Error('Gemini returned an empty response');
      err.code = 'EMPTY_RESPONSE';
      err.source = 'gemini-service';
      throw err;
    }

    return text.trim();
  } catch (error) {
    // Wrap SDK errors in our standard error format
    if (error.source) {
      throw error; // Already formatted
    }

    const err = new Error(error.message || 'Gemini API request failed');
    err.code = error.code || 'GEMINI_API_ERROR';
    err.source = 'gemini-api';
    err.originalError = error;
    throw err;
  }
};

// ── Exports ──────────────────────────────────────────────────
module.exports = {
  isConfigured,
  getDiagnostics,
  generate,
  GEMINI_MODEL,
  GEMINI_API_VER,
};
