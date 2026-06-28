# ⚡ XPify — Full Stack Student Learning Platform

A complete full-stack web app: React frontend + Node.js/Express backend + MongoDB + Socket.io.

---

## 📁 Project Structure

```
xpify-complete-project/
├── levelup-new/        ← React Frontend  (port 3000)
└── levelup-backend/    ← Node.js Backend (port 5000)
```

---

## 🚀 STEP-BY-STEP SETUP

### Step 1 — MongoDB (Atlas cloud OR local)

**Option A: MongoDB Atlas (cloud, recommended)**
1. Go to https://cloud.mongodb.com → create a free M0 cluster
2. Network Access → Add IP Address → "Allow Access From Anywhere"
3. Database Access → create a user + password
4. Connect → Drivers → copy your connection string

**Option B: Local MongoDB**
```
MONGO_URI=mongodb://localhost:27017/xpify
```

### Step 2 — Backend

```bash
cd levelup-backend
npm install
cp .env.example .env
```

Edit `.env`:
```
MONGO_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/xpify?retryWrites=true&w=majority
JWT_SECRET=any_long_random_string_here
PORT=5000
CLIENT_URL=http://localhost:3000

# Optional — only needed for these specific features:
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com   # Google Sign-In
OPENAI_API_KEY=sk-your-openai-key-here                              # Nova AI chat
```

```bash
npm run dev
```

✅ You should see:
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
🗺️  Seeded 4 official roadmaps
❓ Seeded 40 quiz questions
🚀 XPify server running on http://localhost:5000
```

### Step 3 — Frontend

```bash
cd levelup-new
npm install
cp .env.example .env
npm start
```

Browser opens at **http://localhost:3000** — explore the Landing page, register, pick your Goal Selection, and you're in!

---

## 🎮 Full Feature List

| # | Feature | Description |
|---|---|---|
| 1 | **Landing Page** | Marketing page with hero, Nova intro, feature grid, CTAs |
| 2 | **Login/Signup** | Email + password, JWT auth, Google Sign-In |
| 3 | **Goal Selection** | First-time onboarding — pick focus areas (DSA, Coding, Aptitude, Placement, Communication) with weekly target % |
| 4 | **Learning Goals** | Open-ended goal tracker — set custom targets, track progress, +150 XP on completion |
| 5 | **Daily Tasks** | 4 auto-generated daily tasks, +50 XP bonus for completing all |
| 6 | **XP System** | Earned via posts, likes, comments, tasks, quizzes, pomodoro, goals, roadmap steps |
| 7 | **Levels** | Beginner → Explorer → Builder → Hacker → Architect |
| 8 | **Streaks** | Daily posting streak + separate quiz streak, auto-reset at midnight |
| 9 | **Badges** | 12 achievements (bronze/silver/gold), hover tooltips, unlock animation toggle |
| 10 | **Dashboard** | XP gauge, streak calendar, leaderboard, feed preview, Nova greeting |
| 11 | **Learning Roadmap** | 4 pre-built paths (DSA, Web, ML, System Design), +300 XP on completion |
| 12 | **Daily Quiz Challenge** | 5 daily questions, +15 XP/correct, +50 perfect bonus, separate quiz streak |
| 13 | **Pomodoro Timer** | 25/5 min work-break cycles, +25 XP per session, weekly chart |
| 14 | **Weekly Reports** | Aggregated stats across all features, week-over-week comparison |
| 15 | **Nova Mascot** | 5 visual evolution stages tied to level + 6 mood reactions (celebrate, excited, sad, thinking, sleepy, happy) |
| 16 | **Nova AI Chat** | Floating chat widget powered by OpenAI — personalized study tips |
| 17 | **Community** | Browse/search/filter students, mentor badges |
| 18 | **Messages** | Real-time chat via Socket.io |
| 19 | **Profile** | Edit bio/skills, XP gauge, streak calendar, post history |

---

## 🔌 Full API Reference

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | /api/auth/register | Create account | No |
| POST | /api/auth/login | Login | No |
| POST | /api/auth/google | Google Sign-In | No |
| GET | /api/auth/me | Get my profile | ✅ |
| PUT | /api/auth/update | Update profile | ✅ |
| PUT | /api/auth/focus-areas | Save Goal Selection choices | ✅ |
| GET | /api/posts | Get all posts | No |
| POST | /api/posts | Create post (+XP) | ✅ |
| PUT | /api/posts/:id/like | Like/unlike post | ✅ |
| POST | /api/posts/:id/comments | Add comment | ✅ |
| GET | /api/users | Get all students | No |
| GET | /api/users/leaderboard | Get leaderboard | No |
| GET | /api/users/:id | Get user profile | No |
| PUT | /api/users/:id/follow | Follow/unfollow | ✅ |
| GET | /api/messages | Get conversations | ✅ |
| GET/POST | /api/messages/:userId | Get/send messages | ✅ |
| GET/POST | /api/goals | Get/create goals | ✅ |
| PUT | /api/goals/:id/progress | Update progress (+XP) | ✅ |
| GET | /api/tasks/today | Get today's tasks | ✅ |
| PUT | /api/tasks/:id/complete | Toggle task (+XP) | ✅ |
| GET | /api/roadmaps | Browse roadmaps | No |
| GET | /api/roadmaps/mine | My roadmap progress | ✅ |
| POST | /api/roadmaps/:id/start | Start a roadmap | ✅ |
| PUT | /api/roadmaps/:id/steps/:stepId/toggle | Complete step (+XP) | ✅ |
| GET | /api/quiz/today | Get today's quiz | ✅ |
| POST | /api/quiz/submit | Submit answers (+XP) | ✅ |
| POST | /api/pomodoro/complete | Log a focus session (+XP) | ✅ |
| GET | /api/pomodoro/stats | Weekly session chart | ✅ |
| GET | /api/reports/weekly | Full weekly report | ✅ |
| GET | /api/reports/monthly | 6-month XP trend | ✅ |
| POST | /api/nova/chat | Chat with Nova (AI) | ✅ |
| GET | /api/nova/daily-tip | Get a personalized tip | ✅ |

---

## 🎮 XP Reference

| Action | XP |
|---|---|
| Create a post | +50 |
| Daily streak bonus | +30 |
| 7-day streak | +100 bonus |
| 30-day streak | +500 bonus |
| Someone likes your post | +10 |
| Write a comment | +15 |
| Complete a goal | +150 |
| Complete a daily task | +10 to +25 |
| Complete all daily tasks | +50 bonus |
| Complete a roadmap step | +40 to +100 |
| Complete a full roadmap | +300 bonus |
| Correct quiz answer | +15 |
| Perfect quiz score (5/5) | +50 bonus |
| 7-day quiz streak | +100 bonus |
| Pomodoro focus session | +25 |

### Level Thresholds
| Level | XP Required |
|---|---|
| Beginner | 0 |
| Explorer | 500 |
| Builder | 1,500 |
| Hacker | 3,500 |
| Architect | 7,000 |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, custom CSS (violet/cyan dark theme), Sora + Inter fonts |
| Backend | Node.js, Express 4 |
| Database | MongoDB + Mongoose |
| Auth | JWT + Google Sign-In |
| AI | OpenAI (gpt-4o-mini) for Nova chat |
| Real-time | Socket.io |
| Scheduler | node-cron |

---

## 🌍 Deploy to Production

**Frontend → Vercel** — `npm run build`, set `REACT_APP_API_URL` to your backend URL
**Backend → Render** — connect repo, build: `npm install`, start: `node server.js`, add all `.env` vars
**Database** — same MongoDB Atlas URI works in production
