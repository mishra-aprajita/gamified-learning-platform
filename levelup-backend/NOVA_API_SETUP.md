# Nova AI Chat API - Setup Guide

## Overview
Production-ready Google Gemini API integration for the Nova AI assistant in XPify.

## 1. Final Working Backend Code

### Technology Stack
- **Framework**: Express.js
- **AI SDK**: `@google/generative-ai` (official Google SDK)
- **Model**: `gemini-2.0-flash` (stable, fast, cost-effective)
- **Deployment**: Render (backend), Vercel (frontend)

### Files Modified
1. `services/gemini.js` - Core Gemini service using official SDK
2. `controllers/novaController.js` - API endpoint handlers with error handling
3. `package.json` - Added `@google/generative-ai` dependency
4. `.env.example` - Updated environment variable documentation

### API Endpoint Details
- **Route**: `POST /api/nova/chat`
- **Authentication**: Required (JWT token via `protect` middleware)
- **Request Body**:
  ```json
  {
    "message": "user message",
    "history": [] // Optional chat history array
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "reply": "AI response text"
  }
  ```

## 2. Required npm install command

```bash
cd levelup-backend
npm install @google/generative-ai
```

Or if you want to reinstall all dependencies:
```bash
cd levelup-backend
rm -rf node_modules package-lock.json
npm install
```

## 3. Example .env file

```bash
# ─────────────────────────────────────────────
#  XPify Backend  –  Environment Variables
# ─────────────────────────────────────────────

# MongoDB Atlas connection string
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/levelup?retryWrites=true&w=majority

# JWT secret key
JWT_SECRET=levelup_super_secret_jwt_key_change_this_in_production_2024

# JWT token expiry
JWT_EXPIRE=7d

# Port the server runs on
PORT=5000

# Frontend URL (for CORS) – your Vercel URL
CLIENT_URL=gamified-learning-platform-2t1yqqwg6.vercel.app

# Google Sign-In Client ID (optional)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# ⭐ IMPORTANT: Google Gemini API Key for Nova AI
# Get it from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### How to get Gemini API Key:
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it in your `.env` file
5. **Never commit `.env` to git!**

## 4. Example Frontend Fetch Request

```javascript
// Example frontend code to call Nova API
const callNova = async (message, chatHistory = []) => {
  try {
    const token = localStorage.getItem('token'); // Your JWT token
    
    const response = await fetch('https://your-backend.onrender.com/api/nova/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message: message,
        history: chatHistory // Optional: array of {role, content} objects
      })
    });

    const data = await response.json();

    if (data.success) {
      return data.reply;
    } else {
      console.error('Nova error:', data.message);
      return 'Nova is having trouble responding right now. Please try again.';
    }
  } catch (error) {
    console.error('Network error:', error);
    return 'Nova is having trouble responding right now. Please try again.';
  }
};

// Usage example:
const reply = await callNova("How can I improve my focus while studying?");
```

### React Component Example

```jsx
import React, { useState } from 'react';

const NovaChat = () => {
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/nova/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });

      const data = await response.json();
      
      if (data.success) {
        setReply(data.reply);
      } else {
        setReply('Nova is having trouble responding right now. Please try again.');
      }
    } catch (error) {
      setReply('Nova is having trouble responding right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nova-chat">
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask Nova anything about studying..."
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </form>
      {reply && <div className="nova-reply">{reply}</div>}
    </div>
  );
};

export default NovaChat;
```

## 5. Common Deployment Mistakes Checklist (Render-Specific)

### ✅ Pre-Deployment Checklist

- [ ] **Environment Variables Set in Render Dashboard**
  - Go to Render Dashboard → Your Service → Environment
  - Add `GEMINI_API_KEY` with your actual key (NOT placeholder)
  - Add `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, etc.
  - Click "Save Changes"

- [ ] **No .env File Committed to Git**
  - Ensure `.env` is in `.gitignore`
  - Never commit `.env` with real API keys
  - Use `.env.example` for reference only

- [ ] **Correct Client URL for CORS**
  - Set `CLIENT_URL` to your actual Vercel frontend URL
  - Example: `https://gamified-learning-platform.vercel.app`
  - Don't use `localhost` in production

- [ ] **MongoDB Atlas IP Whitelist**
  - Go to MongoDB Atlas → Network Access
  - Add Render's IP ranges or allow 0.0.0.0/0 (not recommended for prod)
  - Better: Add specific Render region IPs

- [ ] **Build Script Correct**
  - Ensure `package.json` has `"start": "node server.js"`
  - Render uses this to start your server

### ❌ Common Mistakes to Avoid

1. **Using Placeholder API Key**
   - ❌ `GEMINI_API_KEY=your_gemini_api_key_here`
   - ✅ `GEMINI_API_KEY=AIzaSyD...` (actual key)

2. **Wrong Environment Variable Name**
   - ❌ `OPENAI_API_KEY` (old, wrong)
   - ✅ `GEMINI_API_KEY` (correct)

3. **Missing Dependencies**
   - ❌ Forgetting to run `npm install @google/generative-ai`
   - ✅ Install before deploying or add to package.json

4. **CORS Issues**
   - ❌ `CLIENT_URL=http://localhost:3000` in production
   - ✅ `CLIENT_URL=https://your-app.vercel.app`

5. **Not Restarting After Env Changes**
   - ❌ Changing env vars but not redeploying
   - ✅ Render auto-restarts on env var changes, but verify

6. **Database Connection Issues**
   - ❌ MongoDB Atlas blocking Render IPs
   - ✅ Whitelist Render's IP ranges in Atlas

### 🔍 Debugging 502 Bad Gateway Errors

If you still get 502 errors after deployment:

1. **Check Render Logs**
   - Go to Render Dashboard → Logs
   - Look for "GEMINI_API_KEY missing" or SDK errors
   - Check for any uncaught exceptions

2. **Verify API Key Format**
   - Gemini keys start with `AIzaSyD...`
   - Should be ~39 characters long
   - No extra spaces or quotes

3. **Test API Key Locally**
   ```bash
   # Test your key works
   curl -X POST \
     'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_KEY' \
     -H 'Content-Type: application/json' \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
   ```

4. **Check Model Availability**
   - `gemini-2.0-flash` should be available
   - If issues, try `gemini-1.5-flash` as fallback

5. **Monitor Rate Limits**
   - Free tier: 15 requests per minute
   - Consider upgrading if hitting limits

### 🚀 Deployment Steps

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Migrate Nova to Gemini SDK"
   git push origin main
   ```

2. **Configure Render Environment**
   - Go to Render Dashboard
   - Add all environment variables from `.env`
   - Especially `GEMINI_API_KEY`

3. **Deploy**
   - Render auto-deploys on push
   - Monitor build logs for errors

4. **Test**
   ```bash
   # Test health endpoint
   curl https://your-backend.onrender.com/api/health

   # Test Nova endpoint (with auth token)
   curl -X POST \
     https://your-backend.onrender.com/api/nova/chat \
     -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
     -H 'Content-Type: application/json' \
     -d '{"message":"Hello Nova"}'
   ```

## 🎯 Key Features Implemented

✅ **Official Google Gemini SDK** - Using `@google/generative-ai`  
✅ **Proper Error Handling** - Try/catch with structured error responses  
✅ **Fallback Messages** - "Nova is having trouble responding right now"  
✅ **CORS Support** - Configured for Vercel frontend  
✅ **Environment Validation** - Checks for missing/placeholder API keys  
✅ **Production Ready** - Secure logging, no secrets exposed  
✅ **Stable Model** - Using `gemini-2.0-flash` for reliability  
✅ **Graceful Degradation** - Daily tips fallback if API fails  

## 📞 Support

If you encounter issues:
1. Check Render logs first
2. Verify environment variables in dashboard
3. Test API key locally
4. Check MongoDB Atlas network access
5. Review CORS configuration

The backend is now robust, production-ready, and fully migrated to Google Gemini API! 🚀