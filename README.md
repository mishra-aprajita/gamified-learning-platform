# ⚡ XPify — Frontend

The complete React frontend with the violet/cyan Nova mascot theme and all 19 features.

## Pages

| Page | File | Description |
|---|---|---|
| Landing | `pages/Landing.jsx` | Marketing page — hero, Nova intro, feature grid |
| Auth | `pages/Auth.jsx` | Login / Register with Nova + Google Sign-In |
| Goal Selection | `pages/GoalSelection.jsx` | First-time onboarding — pick focus areas |
| Dashboard | `pages/Dashboard.jsx` | XP gauge, streak grid, leaderboard, Nova greeting |
| Feed | `pages/Feed.jsx` | Post learning updates, like/comment |
| Leaderboard | `pages/Leaderboard.jsx` | Top 3 podium + full rankings |
| Community | `pages/Community.jsx` | Browse/search/filter students |
| Messages | `pages/Messages.jsx` | Real-time chat (Socket.io) |
| Profile | `pages/Profile.jsx` | Edit profile, skills, XP gauge |
| Goals | `pages/Goals.jsx` | Set learning targets, track progress |
| Tasks | `pages/Tasks.jsx` | Daily checklist, resets every day |
| Roadmap | `pages/Roadmap.jsx` | Browse + follow structured learning paths |
| Quiz | `pages/Quiz.jsx` | 5-question daily quiz with review |
| Pomodoro | `pages/Pomodoro.jsx` | 25/5 min focus timer |
| Reports | `pages/Reports.jsx` | Weekly stats across every feature |
| Badges | `pages/Badges.jsx` | 12 achievements with unlock progress |

## Key Components

| Component | Description |
|---|---|
| `Mascot.jsx` | Nova — 5 evolution stages (by level) + 6 mood reactions |
| `NovaChat.jsx` | Floating AI chat widget (powered by OpenAI via backend) |
| `XPGauge.jsx` | Circular XP progress ring |
| `StreakCalendar.jsx` | GitHub-style contribution heatmap |
| `AchievementBadges.jsx` | Compact badge grid (used on Dashboard/Profile) |

## How to run

```bash
npm install
cp .env.example .env
npm start
```

Make sure `levelup-backend` is running on port 5000 first.

## Theme

- **Fonts**: Sora (display) + Inter (body)
- **Colors**: deep indigo background, violet → cyan gradients
- **Mascot**: Nova — SVG character with level-based evolution and mood reactions
- **Dark/light toggle**: click 🌙/☀️ in the topbar
