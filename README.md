# ✦ XPify — Turn Your Learning Into Momentum

XPify is a **gamified learning platform** built for engineering students preparing for placements. Instead of passively tracking progress, XPify turns studying, coding practice, and skill-building into a game you actually want to play — track your XP, keep your streak alive, and climb the leaderboard with students just like you.

> Built as a full-stack college project — from user research to deployment.

---

## 🎯 The Problem

A survey of 40+ engineering students revealed:
- **82%** get distracted by social media while studying
- **74%** struggle with procrastination
- **60%** can't maintain a consistent study routine
- **68%** find traditional learning platforms boring and unmotivating

Existing platforms like Duolingo are great — but built for language learning, not for DSA, coding, aptitude, and placement prep.

## 💡 The Solution

XPify applies **behavioral gamification** to real academic learning:
- Every study session, solved question, and completed task earns **XP**
- XP levels you up, unlocks **titles** (Beginner → Explorer → Learner → Achiever → Scholar → Expert → Mentor)
- **Nova**, an evolving crystal mascot, grows more radiant as you level up — a visual reward that keeps you coming back
- **Streaks**, **badges**, and a **leaderboard** reinforce consistency, not just one-off effort

---

## ✨ Features

### Core (MVP)
- 🔐 **Authentication** — Email/Password + Google OAuth
- 🎯 **Goal Selection** — choose DSA, Web Dev, Aptitude, Placement Prep, or Communication Skills as your focus
- ⚡ **XP & Level System** — effort-based XP, not just click-based
- 🔥 **Streak Tracking** — calendar heatmap of consistent learning days
- ✅ **Daily Tasks** — small, achievable daily goals with XP rewards
- 🗺️ **Learning Roadmap** — structured topic-by-topic paths (DSA, Web Dev, etc.)
- 🏅 **Achievement Badges** — Bronze → Silver → Gold → Legendary tiers
- 📊 **Weekly Progress Report** — XP earned, streak performance, goal completion
- 💎 **Nova Mascot** — a living crystal companion with 5 evolution stages tied to your level
- 🧭 **Practice Hub** — curated external resources (Flexbox Froggy, CSS Battle, DSA/JS/Python/React practice links)

### Community (Phase 2)
- 📰 Learning Feed — share daily progress with peers
- 👥 Community — discover other students by skill/level
- 💬 Messages — 1:1 chat with real-time updates (Socket.io)
- 🏆 Leaderboard — XP and streak-based rankings

---

## 🧠 XP Rules

| Action | XP Earned |
|---|---|
| 30 min study session | +15 XP |
| Easy question solved | +5 XP |
| Medium question solved | +10 XP |
| Hard question solved | +20 XP |
| Project task completed | +50 XP |
| 7-day streak bonus | +25 XP |

**Level Formula:** `Level = floor(Total XP / 100) + 1`

| Level | Title |
|---|---|
| 1 | Beginner |
| 2 | Explorer |
| 3 | Learner |
| 4 | Achiever |
| 5 | Scholar |
| 6 | Expert |
| 7+ | Mentor |

---

## 💎 Nova — The Evolving Mascot

Nova is a crystal companion whose appearance evolves with your level — a visual motivation loop inspired by habit-formation psychology.

| Level Range | Stage | Look |
|---|---|---|
| 1–4 | Rough Crystal | Small, dull, gray-purple, no glow |
| 5–9 | Awakened Crystal | Purple glow, sparkle particles |
| 10–14 | Radiant Nova | One slowly spinning ring |
| 15–19 | Stellar Nova | Two rings + orbiting gems |
| 20+ | Cosmic Nova | Crown, three rings, lightning accents |

---

## 🛠️ Tech Stack

**Frontend**
- React.js
- React Router
- CSS (custom dark cosmic theme)
- Socket.io Client (real-time messaging)

**Backend**
- Node.js + Express.js
- MongoDB Atlas + Mongoose
- JWT Authentication
- bcryptjs (password hashing)
- Google OAuth 2.0
- Socket.io (real-time)
- node-cron (daily streak checks)

**Tools & Infrastructure**
- MongoDB Atlas — cloud database
- Vercel — frontend hosting
- Render — backend hosting
- Figma — UI/UX design
- GitHub — version control

---

## 📁 Project Structure

```
xpify/
├── xpify-frontend/          # React app
│   └── src/
│       ├── pages/           # Dashboard, Feed, Goals, Tasks, Roadmap, etc.
│       ├── components/      # Nova, XPBar, LevelBadge, AchievementBadges, etc.
│       ├── context/         # AuthContext (global auth state)
│       ├── layout/          # Sidebar, Topbar
│       └── services/        # API calls
│
└── xpify-backend/           # Node + Express API
    ├── models/               # User, Progress, Message, etc.
    ├── controllers/          # Route logic
    ├── routes/               # API endpoints
    ├── middleware/           # Auth middleware
    └── server.js
```

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
- Node.js installed
- MongoDB Atlas account (free tier works)

### 1. Clone the repository
```bash
git clone https://github.com/mishra-aprajita/gamified-learning-platform.git
cd gamified-learning-platform
```

### 2. Backend Setup
```bash
cd xpify-backend
npm install
```

Create a `.env` file in `xpify-backend/`:
```
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_random_secret_string
CLIENT_URL=http://localhost:3000
PORT=5000
```

Run the backend:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd ../xpify-frontend
npm install
```

Create a `.env` file in `xpify-frontend/`:
```
REACT_APP_API_URL=http://localhost:5000
```

Run the frontend:
```bash
npm start
```

The app will be available at `http://localhost:3000`.

---

## 🌐 Live Deployment

- **Frontend:** [Vercel](https://gamified-learning-platform-ecru.vercel.app)
- **Backend:** Hosted on Render

---

## 📊 Research Behind XPify

This project began with real user research, not assumptions:
- 40-student survey on study habits, distractions, and motivation
- Competitive analysis against Duolingo, Coursera, and Udemy
- Figma wireframes for every core screen before any code was written
- Iterative design of the XP/level/streak system based on behavioral psychology principles (positive reinforcement, habit loops, visible progress)

---

## 🗺️ Roadmap (What's Next)

- [ ] AI-powered study assistant
- [ ] Peer challenges & study groups
- [ ] Resume/skill tracker for placement prep
- [ ] AI-generated personalized learning plans
- [ ] More interactive coding practice modules

---



*XPify — Everything you need to level up.*