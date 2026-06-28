// utils/seedRoadmaps.js
// ─────────────────────────────────────────────
//  Populates the database with official pre-built roadmaps.
//  Runs automatically on server start if no roadmaps exist yet.
//  Can also be run manually:  node utils/seedRoadmaps.js
// ─────────────────────────────────────────────
const Roadmap = require('../models/Roadmap');

const ROADMAP_SEED_DATA = [
  {
    title: 'DSA Roadmap',
    description: 'Master data structures and algorithms from the ground up — the foundation for every coding interview.',
    category: 'dsa',
    icon: '🧩',
    isOfficial: true,
    steps: [
      { order: 1, title: 'Arrays & Strings',         description: 'Master traversal, two-pointer, and sliding window techniques.', xpReward: 50 },
      { order: 2, title: 'Hashing',                   description: 'Hash maps and sets for O(1) lookups.',                         xpReward: 50 },
      { order: 3, title: 'Linked Lists',              description: 'Singly/doubly linked lists, reversal, cycle detection.',       xpReward: 60 },
      { order: 4, title: 'Stacks & Queues',           description: 'Monotonic stacks, queue-based BFS.',                            xpReward: 60 },
      { order: 5, title: 'Recursion & Backtracking',  description: 'Build intuition for recursive trees and pruning.',              xpReward: 70 },
      { order: 6, title: 'Trees & Binary Search Trees', description: 'Traversals, balancing, BST operations.',                       xpReward: 70 },
      { order: 7, title: 'Graphs (BFS/DFS)',          description: 'Traversal, connected components, topological sort.',           xpReward: 80 },
      { order: 8, title: 'Dynamic Programming',       description: 'Memoization, tabulation, classic DP patterns.',                 xpReward: 100 },
      { order: 9, title: 'Greedy Algorithms',         description: 'Interval scheduling, greedy proofs.',                           xpReward: 70 },
      { order: 10, title: 'Mock Interview Practice',  description: 'Timed problem-solving under interview conditions.',             xpReward: 100 },
    ],
  },
  {
    title: 'Web Development Roadmap',
    description: 'Go from zero to full-stack — HTML to deployed React + Node apps.',
    category: 'web',
    icon: '🌐',
    isOfficial: true,
    steps: [
      { order: 1, title: 'HTML & CSS Fundamentals',   description: 'Semantic HTML, flexbox, grid, responsive design.',  xpReward: 40 },
      { order: 2, title: 'JavaScript Basics',         description: 'Variables, functions, DOM manipulation, events.',  xpReward: 50 },
      { order: 3, title: 'Modern JS (ES6+)',          description: 'Arrow functions, destructuring, async/await.',     xpReward: 50 },
      { order: 4, title: 'Git & GitHub',              description: 'Version control, branching, pull requests.',       xpReward: 40 },
      { order: 5, title: 'React Fundamentals',        description: 'Components, props, state, hooks.',                 xpReward: 70 },
      { order: 6, title: 'React Router & State Mgmt', description: 'Client-side routing, Context API.',                xpReward: 70 },
      { order: 7, title: 'Node.js & Express',         description: 'Build REST APIs, middleware, routing.',            xpReward: 80 },
      { order: 8, title: 'Databases (MongoDB/SQL)',   description: 'Schema design, CRUD operations.',                  xpReward: 80 },
      { order: 9, title: 'Authentication (JWT)',      description: 'Secure login, password hashing, tokens.',          xpReward: 70 },
      { order: 10, title: 'Deploy a Full-Stack App',  description: 'Ship to Vercel/Render with a custom domain.',      xpReward: 100 },
    ],
  },
  {
    title: 'Machine Learning Roadmap',
    description: 'Build a strong foundation in ML — from math basics to deployed models.',
    category: 'ml',
    icon: '🤖',
    isOfficial: true,
    steps: [
      { order: 1, title: 'Python for ML',             description: 'NumPy, Pandas, Matplotlib basics.',                 xpReward: 50 },
      { order: 2, title: 'Statistics & Probability',  description: 'Distributions, hypothesis testing, Bayes theorem.', xpReward: 60 },
      { order: 3, title: 'Linear Algebra & Calculus', description: 'Vectors, matrices, gradients — the ML math base.',  xpReward: 60 },
      { order: 4, title: 'Linear & Logistic Regression', description: 'Your first predictive models.',                 xpReward: 60 },
      { order: 5, title: 'Decision Trees & Ensembles', description: 'Random forests, gradient boosting.',              xpReward: 70 },
      { order: 6, title: 'Neural Network Basics',     description: 'Perceptrons, backpropagation, activation functions.', xpReward: 80 },
      { order: 7, title: 'Deep Learning (CNNs/RNNs)', description: 'Image and sequence models.',                       xpReward: 90 },
      { order: 8, title: 'Model Evaluation & Tuning', description: 'Cross-validation, hyperparameter search.',         xpReward: 70 },
      { order: 9, title: 'Build a Kaggle Project',    description: 'Apply everything to a real competition dataset.',  xpReward: 90 },
      { order: 10, title: 'Deploy an ML Model',       description: 'Serve predictions via a Flask/FastAPI endpoint.',  xpReward: 100 },
    ],
  },
  {
    title: 'System Design Roadmap',
    description: 'Learn to design large-scale systems — a must for senior interviews.',
    category: 'sys',
    icon: '🗄️',
    isOfficial: true,
    steps: [
      { order: 1, title: 'Client-Server Basics',      description: 'HTTP, DNS, load balancers.',                       xpReward: 50 },
      { order: 2, title: 'Scaling Fundamentals',      description: 'Vertical vs horizontal scaling, statelessness.',   xpReward: 60 },
      { order: 3, title: 'Databases at Scale',        description: 'SQL vs NoSQL, indexing, replication.',             xpReward: 70 },
      { order: 4, title: 'Caching Strategies',        description: 'Redis, CDN, cache invalidation.',                  xpReward: 60 },
      { order: 5, title: 'Message Queues',            description: 'Async processing with Kafka/RabbitMQ.',           xpReward: 70 },
      { order: 6, title: 'Sharding & Partitioning',   description: 'Splitting data across nodes.',                     xpReward: 80 },
      { order: 7, title: 'Consistency & CAP Theorem', description: 'Trade-offs between consistency and availability.', xpReward: 80 },
      { order: 8, title: 'Design a URL Shortener',    description: 'Classic system design interview question.',       xpReward: 90 },
      { order: 9, title: 'Design a Chat App',         description: 'Real-time messaging at scale.',                   xpReward: 90 },
      { order: 10, title: 'Design a News Feed',       description: 'Fan-out strategies, ranking algorithms.',         xpReward: 100 },
    ],
  },
];

async function seedRoadmaps() {
  try {
    const count = await Roadmap.countDocuments({ isOfficial: true });
    if (count > 0) {
      console.log(`🗺️  Roadmaps already seeded (${count} found) — skipping`);
      return;
    }
    await Roadmap.insertMany(ROADMAP_SEED_DATA);
    console.log(`🗺️  Seeded ${ROADMAP_SEED_DATA.length} official roadmaps`);
  } catch (err) {
    console.error('❌ Roadmap seeding error:', err.message);
  }
}

module.exports = seedRoadmaps;

// Allow running directly: node utils/seedRoadmaps.js
if (require.main === module) {
  require('dotenv').config();
  const connectDB = require('../config/db');
  connectDB().then(async () => {
    await seedRoadmaps();
    process.exit(0);
  });
}
