// services/gemini.js
// ─────────────────────────────────────────────────────────────
//  Centralised Google Gemini AI service for XPify.
//  All AI logic lives here — no duplicated SDK init anywhere.
//
//  SDK:   native fetch (Node 18+) — no 3rd-party Gemini SDK
//  Model: gemini-2.0-flash  (stable, fast, cost-effective)
//  API:   Google Generative Language REST API v1beta
// ─────────────────────────────────────────────────────────────
'use strict';

const path = require('path');
const fs   = require('fs');

// ── Constants ────────────────────────────────────────────────
// Stable models as of 2026-08 per https://ai.google.dev/gemini-api/docs/models
// gemini-2.0-flash → fastest stable; gemini-2.5-flash → most capable stable
const GEMINI_MODEL   = 'gemini-2.0-flash';
const GEMINI_API_VER = 'v1beta';
const GEMINI_BASE    = 'https://generativelanguage.googleapis.com';

// ── Config helpers ───────────────────────────────────────────
/**
 * Returns true when a real, non-placeholder key is present at runtime.
 */
const isConfigured = () => {
  const key = process.env.GEMINI_API_KEY;
  return typeof key === 'string' && key.length > 0 && key !== 'your-gemini-api-key-here';
};

/**
 * Builds the full REST endpoint URL for generateContent.
 * Pattern: /v1beta/models/{model}:generateContent?key={apiKey}
 */
const buildUrl = () =>
  `${GEMINI_BASE}/${GEMINI_API_VER}/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;

/**
 * Returns the SDK/runtime diagnostics object.
 * Secrets are never exposed — only the last 4 chars of the key are shown.
 */
const getDiagnostics = () => {
  const key     = process.env.GEMINI_API_KEY || '';
  const envPath = path.resolve(__dirname, '../.env');
  return {
    sdk:         'native-fetch',
    sdkVersion:  'N/A (no SDK)',
    model:       GEMINI_MODEL,
    apiVersion:  GEMINI_API_VER,
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development',
    envFilePresent: fs.existsSync(envPath),
    keyStatus:   !key
      ? 'missing'
      : key === 'your-gemini-api-key-here'
        ? 'placeholder'
        : `loaded (ends …${key.slice(-4)})`,
  };
};

// ── Core generator ───────────────────────────────────────────
/**
 * Calls the Gemini generateContent REST endpoint.
 *
 * @param {object} opts
 * @param {string}   opts.systemPrompt - Nova's personality/instructions
 * @param {Array}    opts.contents     - Array of {role, parts:[{text}]} turns
 * @param {number}  [opts.maxTokens]   - maxOutputTokens (default 200)
 * @param {number}  [opts.temperature] - sampling temperature (default 0.7)
 * @returns {Promise<string>}          - the model's text reply
 * @throws  {Error}                    - structured error with `.code` and `.details`
 */
const generate = async ({ systemPrompt, contents, maxTokens = 200, temperature = 0.7 }) => {
  const url  = buildUrl();
  const body = {
    contents,
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  };

  const res  = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    // Surface the exact Gemini error message to the caller
    const err     = new Error(data?.error?.message || 'Gemini API request failed');
    err.code      = data?.error?.code    || res.status;
    err.status    = data?.error?.status  || 'UNKNOWN';
    err.details   = data?.error?.details || [];
    err.source    = 'gemini-api';
    throw err;
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    const err   = new Error('Gemini returned an empty response');
    err.code    = 'EMPTY_RESPONSE';
    err.source  = 'gemini-service';
    throw err;
  }

  return text.trim();
};

// ── Exports ──────────────────────────────────────────────────
module.exports = {
  isConfigured,
  getDiagnostics,
  generate,
  GEMINI_MODEL,
  GEMINI_API_VER,
};
