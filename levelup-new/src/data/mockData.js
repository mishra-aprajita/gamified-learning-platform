export const currentUser = {
  name: "Arjun Sharma",
  initials: "AS",
  level: 3,
  levelName: "Builder",
  xp: 2840,
  xpNext: 3500,
  xpPrev: 1500,
  streak: 14,
  posts: 47,
  followers: 128,
  following: 64,
  bio: "Full-stack dev in progress 🚀 | DSA grinder | Building cool stuff daily",
  skills: ["DSA", "React", "Node.js", "Python"],
  rank: 12,
};

export const posts = [
  {
    id: 1, author: "Priya Singh", initials: "PS", level: "Hacker", xp: 5200, time: "2h ago",
    content: "Just cracked the sliding window pattern after struggling for 3 days 🎉 The key insight: maintain a valid window and shrink from left when constraint breaks. Solved Longest Substring Without Repeating Characters in O(n)! Who's also grinding Leetcode this week?",
    tags: ["dsa"], likes: 24, comments: 8,
  },
  {
    id: 2, author: "Rahul Mehta", initials: "RM", level: "Explorer", xp: 980, time: "4h ago",
    content: "Shipped my first full-stack project! Built a task manager with React + Node + MongoDB. Authentication, CRUD, real-time updates with Socket.io — all working 🔥 Check the GitHub link in my profile. Feedback welcome!",
    tags: ["project", "web"], likes: 41, comments: 15,
  },
  {
    id: 3, author: "Ananya Das", initials: "AD", level: "Architect", xp: 8100, time: "6h ago",
    content: "System design tip 🔑: When asked to design a URL shortener, think about: base62 encoding, hash collisions, database choice (SQL vs NoSQL), caching strategy with Redis, and CDN for redirects. Start with clarifying questions, not solutions!",
    tags: ["sys"], likes: 67, comments: 22,
  },
  {
    id: 4, author: "Vikram Patel", initials: "VP", level: "Builder", xp: 2100, time: "8h ago",
    content: "Finished Andrew Ng's ML course today 🧠 Key takeaways: gradient descent intuition, regularization to prevent overfitting, and why feature scaling matters so much. Starting hands-on projects next — planning a house price predictor.",
    tags: ["ml"], likes: 18, comments: 6,
  },
  {
    id: 5, author: "Sneha Kumar", initials: "SK", level: "Hacker", xp: 4800, time: "1d ago",
    content: "CSS tip that took me way too long to learn: Stop fighting flexbox, start thinking in 'main axis' and 'cross axis'. Once that clicks, align-items vs justify-content becomes obvious. Here's a mini visual I made to remember it:",
    tags: ["web"], likes: 89, comments: 31,
  },
];

export const leaderboard = [
  { rank: 1,  name: "Ananya Das",    initials: "AD",  level: "Architect", xp: 8100, streak: 42, change: 0  },
  { rank: 2,  name: "Rohan Verma",   initials: "RV",  level: "Architect", xp: 7680, streak: 28, change: 1  },
  { rank: 3,  name: "Priya Singh",   initials: "PS",  level: "Hacker",    xp: 5200, streak: 21, change: -1 },
  { rank: 4,  name: "Sneha Kumar",   initials: "SK",  level: "Hacker",    xp: 4800, streak: 35, change: 2  },
  { rank: 5,  name: "Karan Joshi",   initials: "KJ",  level: "Hacker",    xp: 4200, streak: 14, change: 0  },
  { rank: 6,  name: "Divya Nair",    initials: "DN",  level: "Builder",   xp: 3100, streak: 9,  change: 3  },
  { rank: 7,  name: "Aditya Shah",   initials: "AS2", level: "Builder",   xp: 2950, streak: 7,  change: -2 },
  { rank: 8,  name: "Meera Iyer",    initials: "MI",  level: "Builder",   xp: 2920, streak: 11, change: 1  },
  { rank: 9,  name: "Siddharth Rao", initials: "SR",  level: "Builder",   xp: 2880, streak: 5,  change: 0  },
  { rank: 10, name: "Pooja Bhatt",   initials: "PB",  level: "Builder",   xp: 2860, streak: 8,  change: -1 },
  { rank: 11, name: "Nikhil Gupta",  initials: "NG",  level: "Builder",   xp: 2850, streak: 6,  change: 2  },
  { rank: 12, name: "Arjun Sharma",  initials: "AS",  level: "Builder",   xp: 2840, streak: 14, change: 1, isMe: true },
];

export const students = [
  { name: "Priya Singh",  initials: "PS", level: "Hacker",    xp: 5200, streak: 21, bio: "DSA enthusiast | Top 5% on LeetCode | Helping beginners crack patterns",             skills: ["DSA","Python","Algorithms"],     posts: 89,  followers: 312, isMentor: true  },
  { name: "Ananya Das",   initials: "AD", level: "Architect", xp: 8100, streak: 42, bio: "SWE @ Google | System design | Open source contributor | Teaching is learning",       skills: ["System Design","Java","Cloud"],  posts: 134, followers: 891, isMentor: true  },
  { name: "Rahul Mehta",  initials: "RM", level: "Explorer",  xp: 980,  streak: 6,  bio: "CS fresher | Building projects to learn | React is my new best friend",               skills: ["React","HTML","CSS"],            posts: 12,  followers: 28,  isMentor: false },
  { name: "Vikram Patel", initials: "VP", level: "Builder",   xp: 2100, streak: 8,  bio: "ML enthusiast | Kaggle competitor | Always experimenting with data",                   skills: ["ML","Python","Data"],            posts: 41,  followers: 156, isMentor: false },
  { name: "Sneha Kumar",  initials: "SK", level: "Hacker",    xp: 4800, streak: 35, bio: "Frontend wizard 🪄 | Open source | CSS animations lover",                              skills: ["React","CSS","UI/UX"],           posts: 76,  followers: 445, isMentor: true  },
  { name: "Karan Joshi",  initials: "KJ", level: "Hacker",    xp: 4200, streak: 14, bio: "Backend dev | Node.js + Go | Building scalable systems",                               skills: ["Node.js","Go","MongoDB"],        posts: 58,  followers: 234, isMentor: true  },
];

export const conversations = [
  { id: 1, name: "Priya Singh",  initials: "PS", preview: "Sure! The two-pointer approach is...",          time: "2m", online: true,  unread: 2 },
  { id: 2, name: "Ananya Das",   initials: "AD", preview: "I can send you the system design roadmap",      time: "1h", online: true,  unread: 0 },
  { id: 3, name: "Rahul Mehta",  initials: "RM", preview: "Thanks for the React tips! 🙏",                 time: "3h", online: false, unread: 0 },
  { id: 4, name: "Karan Joshi",  initials: "KJ", preview: "Node.js Event Loop — think of it like...",      time: "1d", online: false, unread: 0 },
];

export const chatMessages = [
  { id: 1, from: "Priya Singh", initials: "PS", text: "Hey! I saw your question about sliding window in the feed 👋",                                                                                      time: "10:30 AM", mine: false },
  { id: 2, from: "me",          initials: "AS", text: "Yes! I've been struggling with it. How do you approach these problems?",                                                                             time: "10:31 AM", mine: true  },
  { id: 3, from: "Priya Singh", initials: "PS", text: "Great question! The key is to think about what makes a window 'valid' first. Then you expand right, and shrink left when it becomes invalid.",      time: "10:33 AM", mine: false },
  { id: 4, from: "me",          initials: "AS", text: "That's a really clean mental model. Can you give an example?",                                                                                      time: "10:34 AM", mine: true  },
  { id: 5, from: "Priya Singh", initials: "PS", text: "Sure! Illustrated with 'Minimum Window Substring'. Your condition: all required chars present. Shrink when satisfied to minimize. Expand when not.", time: "10:36 AM", mine: false },
  { id: 6, from: "Priya Singh", initials: "PS", text: "Try implementing it and share your code — I can review it 😊",                                                                                      time: "10:37 AM", mine: false },
];

export const notifications = [
  { icon: "🔥", text: "Your 14-day streak is on fire! Keep going!",                 time: "Just now" },
  { icon: "⬆️", text: "Priya Singh liked your post on React hooks",                 time: "15m ago"  },
  { icon: "💬", text: "Ananya Das replied to your comment",                          time: "1h ago"   },
  { icon: "🏆", text: "You moved up to Rank #12 on the leaderboard!",               time: "3h ago"   },
  { icon: "👋", text: "Rahul Mehta started following you",                           time: "5h ago"   },
];

export const weeklyXP   = [120, 280, 190, 340, 410, 260, 380];
export const weekDays   = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
export const levelColors = {
  Beginner: "#4A6080",
  Explorer: "#00E5A0",
  Builder:  "#00D4FF",
  Hacker:   "#9B6DFF",
  Architect:"#FFD23F",
};
