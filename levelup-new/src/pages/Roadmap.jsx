// src/pages/Roadmap.jsx
// ─────────────────────────────────────────────────────────────────
//  Learning Roadmap — each roadmap shows curated real websites
//  organized by phase (Beginner → Intermediate → Advanced).
//  Clicking a resource opens the actual website directly.
//  No static text steps — only real, usable learning resources.
// ─────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { roadmapAPI } from '../services/api';
import Mascot from '../components/Mascot';

// ── Roadmap metadata ─────────────────────────────────────────────
const ROADMAP_META = {
  dsa: {
    color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)',
    icon: '🧩', gradient: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
  },
  web: {
    color: '#06B6D4', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.2)',
    icon: '🌐', gradient: 'linear-gradient(135deg, #06B6D4, #0891B2)',
  },
  ml: {
    color: '#10B981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)',
    icon: '🤖', gradient: 'linear-gradient(135deg, #10B981, #059669)',
  },
  sys: {
    color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)',
    icon: '🏗️', gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
  },
  general: {
    color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)',
    icon: '🗺️', gradient: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
  },
};

// ── Curated resources for each roadmap ──────────────────────────
// Each resource is a REAL website students can visit immediately.
const ROADMAP_RESOURCES = {
  dsa: [
    {
      phase: 'Phase 1 — Foundations',
      phaseDesc: 'Build your core understanding of data structures',
      phaseColor: '#10B981',
      resources: [
        {
          title: 'CS50 by Harvard',
          desc: 'The most famous free CS course in the world. Start here — covers arrays, memory, algorithms with incredible clarity.',
          url: 'https://cs50.harvard.edu/x/',
          tags: ['Free', 'Video', 'Beginner'],
          type: 'Course',
          typeColor: '#10B981',
          time: '10–12 weeks',
          icon: '🏛️',
        },
        {
          title: 'VisuAlgo',
          desc: 'Visualize data structures and algorithms in action — see exactly how sorting, trees, graphs, and heaps work step-by-step.',
          url: 'https://visualgo.net/en',
          tags: ['Free', 'Visual', 'Interactive'],
          type: 'Tool',
          typeColor: '#06B6D4',
          time: 'Reference',
          icon: '👁️',
        },
        {
          title: 'Data Structures Easy to Advanced — freeCodeCamp',
          desc: '8-hour YouTube course covering every fundamental data structure from arrays to trees with code implementations.',
          url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM',
          tags: ['Free', 'YouTube', 'Comprehensive'],
          type: 'Video',
          typeColor: '#EF4444',
          time: '8 hours',
          icon: '📺',
        },
        {
          title: 'Big-O Cheat Sheet',
          desc: 'The definitive reference for time and space complexity of every common data structure and algorithm. Bookmark this.',
          url: 'https://www.bigocheatsheet.com',
          tags: ['Free', 'Reference', 'Quick'],
          type: 'Reference',
          typeColor: '#8B5CF6',
          time: '30 min',
          icon: '📋',
        },
      ],
    },
    {
      phase: 'Phase 2 — Core Algorithms',
      phaseDesc: 'Master the patterns that appear in every interview',
      phaseColor: '#F59E0B',
      resources: [
        {
          title: 'Neetcode.io',
          desc: 'The best free DSA roadmap on the internet. Organized by pattern (two pointers, sliding window, DP) with free video explanations for every problem.',
          url: 'https://neetcode.io/roadmap',
          tags: ['Free', 'Roadmap', 'Patterns'],
          type: 'Roadmap',
          typeColor: '#8B5CF6',
          time: '3–6 months',
          icon: '🗺️',
        },
        {
          title: 'Recursion — Reducible (YouTube)',
          desc: 'The clearest explanation of recursion and recursive thinking on YouTube. Watch before attempting any tree or graph problem.',
          url: 'https://www.youtube.com/watch?v=IJDJ0kBx2LM',
          tags: ['Free', 'YouTube', 'Conceptual'],
          type: 'Video',
          typeColor: '#EF4444',
          time: '2 hours',
          icon: '📺',
        },
        {
          title: 'Sorting Algorithms Visualized',
          desc: 'Watch bubble sort, merge sort, quicksort, and heap sort animate in real time. Understand why O(n log n) matters.',
          url: 'https://www.sortvisualizer.com',
          tags: ['Free', 'Visual', 'Interactive'],
          type: 'Tool',
          typeColor: '#06B6D4',
          time: '1 hour',
          icon: '🔢',
        },
        {
          title: 'Graph Theory — William Fiset',
          desc: 'The most complete free graph theory course on YouTube. Covers BFS, DFS, Dijkstra, Bellman-Ford, Floyd-Warshall with animations.',
          url: 'https://www.youtube.com/playlist?list=PLDV1Zeh2NRsDGO4--qE8yH72HFL1Km93P',
          tags: ['Free', 'YouTube', 'Advanced'],
          type: 'Video',
          typeColor: '#EF4444',
          time: '7 hours',
          icon: '🕸️',
        },
      ],
    },
    {
      phase: 'Phase 3 — Dynamic Programming',
      phaseDesc: 'Conquer the hardest topic in DSA',
      phaseColor: '#EF4444',
      resources: [
        {
          title: 'DP for Beginners — Aditya Verma',
          desc: 'The most loved DP playlist in India. Explains the pattern-based approach to DP that makes every problem feel approachable.',
          url: 'https://www.youtube.com/playlist?list=PL_z_8CaSLPWekqhdCPmFohncHwz8TY2Go',
          tags: ['Free', 'YouTube', 'Hindi'],
          type: 'Video',
          typeColor: '#EF4444',
          time: '20 hours',
          icon: '🔥',
        },
        {
          title: 'DP Patterns — LeetCode Discuss',
          desc: 'Community-written guide covering every DP pattern: 0/1 knapsack, unbounded, LCS, longest subsequence, partition — with worked examples.',
          url: 'https://leetcode.com/discuss/general-discussion/458695/dynamic-programming-patterns',
          tags: ['Free', 'Article', 'Patterns'],
          type: 'Article',
          typeColor: '#F59E0B',
          time: '3 hours',
          icon: '📄',
        },
        {
          title: 'AlgoMonster',
          desc: 'Structured interview prep with a focus on pattern recognition. The DP section is especially well organized for cracking interviews.',
          url: 'https://algo.monster/problems/stats',
          tags: ['Freemium', 'Structured', 'Interview'],
          type: 'Practice',
          typeColor: '#06B6D4',
          time: 'Ongoing',
          icon: '🎯',
        },
      ],
    },
    {
      phase: 'Phase 4 — Interview Prep',
      phaseDesc: 'Get interview-ready with mock practice',
      phaseColor: '#8B5CF6',
      resources: [
        {
          title: 'Pramp — Mock Interviews',
          desc: 'Free peer-to-peer mock technical interviews. Practice with real people, get feedback, build confidence before the real thing.',
          url: 'https://www.pramp.com',
          tags: ['Free', 'Mock Interview', 'Peer'],
          type: 'Practice',
          typeColor: '#06B6D4',
          time: '1 hr/session',
          icon: '🤝',
        },
        {
          title: 'Interviewing.io',
          desc: 'Practice technical interviews with engineers from top companies (Google, Meta, etc.) anonymously. Great for real feedback.',
          url: 'https://interviewing.io',
          tags: ['Free', 'Mock Interview', 'Premium'],
          type: 'Practice',
          typeColor: '#06B6D4',
          time: '1 hr/session',
          icon: '💼',
        },
        {
          title: 'Tech Interview Handbook',
          desc: 'Curated guide to the technical interview process — system design, behavioral, coding, negotiation. Maintained by Yangshun Tay (ex-Meta).',
          url: 'https://www.techinterviewhandbook.org',
          tags: ['Free', 'Guide', 'Comprehensive'],
          type: 'Article',
          typeColor: '#F59E0B',
          time: '5 hours',
          icon: '📚',
        },
      ],
    },
  ],

  web: [
    {
      phase: 'Phase 1 — HTML & CSS',
      phaseDesc: 'Build the visual foundation of the web',
      phaseColor: '#EF4444',
      resources: [
        {
          title: 'The Odin Project',
          desc: 'The best free full-stack curriculum on the internet. Starts from zero and takes you to employable. Start with the Foundations path.',
          url: 'https://www.theodinproject.com',
          tags: ['Free', 'Full Curriculum', 'Project-based'],
          type: 'Course',
          typeColor: '#10B981',
          time: '6–12 months',
          icon: '⚔️',
        },
        {
          title: 'Flexbox Froggy',
          desc: 'Learn CSS Flexbox by guiding a frog to its lily pad. 24 levels covering every flexbox property. The most fun way to learn layout.',
          url: 'https://flexboxfroggy.com',
          tags: ['Free', 'Game', 'Interactive'],
          type: 'Game',
          typeColor: '#8B5CF6',
          time: '2 hours',
          icon: '🐸',
        },
        {
          title: 'CSS Grid Garden',
          desc: 'Water your garden using CSS Grid properties. 28 levels that teach grid-template-columns, rows, areas — everything you need.',
          url: 'https://cssgridgarden.com',
          tags: ['Free', 'Game', 'Interactive'],
          type: 'Game',
          typeColor: '#8B5CF6',
          time: '2 hours',
          icon: '🌱',
        },
        {
          title: 'Kevin Powell — CSS YouTube',
          desc: 'The best CSS teacher on YouTube. Every video is clear, practical, and focused on real techniques used in production. Subscribe immediately.',
          url: 'https://www.youtube.com/@KevinPowell',
          tags: ['Free', 'YouTube', 'Expert'],
          type: 'Video',
          typeColor: '#EF4444',
          time: 'Ongoing',
          icon: '📺',
        },
      ],
    },
    {
      phase: 'Phase 2 — JavaScript',
      phaseDesc: 'Make the web interactive and dynamic',
      phaseColor: '#F59E0B',
      resources: [
        {
          title: 'JavaScript.info',
          desc: 'The most comprehensive and well-written JS reference/tutorial on the internet. Covers everything from basics to async/await, Promises, and the DOM.',
          url: 'https://javascript.info',
          tags: ['Free', 'Text', 'Comprehensive'],
          type: 'Course',
          typeColor: '#10B981',
          time: '40–60 hours',
          icon: '📘',
        },
        {
          title: 'Eloquent JavaScript',
          desc: 'The classic free JS book — challenging but rewarding. Read chapters 1–6 for solid fundamentals, then return to it as you grow.',
          url: 'https://eloquentjavascript.net',
          tags: ['Free', 'Book', 'In-depth'],
          type: 'Book',
          typeColor: '#F59E0B',
          time: '30 hours',
          icon: '📕',
        },
        {
          title: 'JavaScript30 — Wes Bos',
          desc: '30 projects in 30 days using vanilla JS — no frameworks, no libraries. The best way to build confidence with real projects.',
          url: 'https://javascript30.com',
          tags: ['Free', 'Projects', 'Practical'],
          type: 'Course',
          typeColor: '#10B981',
          time: '30 hours',
          icon: '🏗️',
        },
        {
          title: 'JSRobot',
          desc: 'Write JavaScript to move a robot through obstacle courses. Teaches loops, arrays, and functions through direct, physical feedback.',
          url: 'https://lab.reaal.me/jsrobot',
          tags: ['Free', 'Game', 'Interactive'],
          type: 'Game',
          typeColor: '#8B5CF6',
          time: '3 hours',
          icon: '🤖',
        },
      ],
    },
    {
      phase: 'Phase 3 — React',
      phaseDesc: 'Build modern, component-driven UIs',
      phaseColor: '#06B6D4',
      resources: [
        {
          title: 'React Official Docs (react.dev)',
          desc: 'The completely rewritten official React docs with interactive examples. Start with "Learn React" — the best React learning resource period.',
          url: 'https://react.dev/learn',
          tags: ['Free', 'Official', 'Interactive'],
          type: 'Docs',
          typeColor: '#06B6D4',
          time: '20 hours',
          icon: '⚛️',
        },
        {
          title: 'React.gg',
          desc: 'Visual, interactive React course that shows component trees updating in real time as you code. No setup needed.',
          url: 'https://react.gg',
          tags: ['Freemium', 'Visual', 'Interactive'],
          type: 'Course',
          typeColor: '#10B981',
          time: '15 hours',
          icon: '✨',
        },
        {
          title: 'Scrimba — React Course',
          desc: 'Pause the video and edit the instructor code directly inside the screen. The React path covers everything from components to routing.',
          url: 'https://scrimba.com/learn/learnreact',
          tags: ['Freemium', 'Interactive Video', 'Practical'],
          type: 'Course',
          typeColor: '#10B981',
          time: '25 hours',
          icon: '🎬',
        },
      ],
    },
    {
      phase: 'Phase 4 — Backend & Deployment',
      phaseDesc: 'Complete the full-stack picture',
      phaseColor: '#8B5CF6',
      resources: [
        {
          title: 'Node.js & Express — freeCodeCamp',
          desc: 'Complete free course on building REST APIs with Node and Express. Covers routing, middleware, authentication, and MongoDB integration.',
          url: 'https://www.youtube.com/watch?v=Oe421EPjeBE',
          tags: ['Free', 'YouTube', 'Practical'],
          type: 'Video',
          typeColor: '#EF4444',
          time: '8 hours',
          icon: '🖥️',
        },
        {
          title: 'MongoDB University',
          desc: 'Free official MongoDB courses — from basic CRUD to aggregation pipelines and performance tuning. Earn a free certificate.',
          url: 'https://learn.mongodb.com',
          tags: ['Free', 'Official', 'Certificate'],
          type: 'Course',
          typeColor: '#10B981',
          time: '10 hours',
          icon: '🍃',
        },
        {
          title: 'Roadmap.sh — Full Stack',
          desc: 'The community-maintained visual roadmap for full-stack development. Use it as a checklist to see what you know and what to learn next.',
          url: 'https://roadmap.sh/full-stack',
          tags: ['Free', 'Visual', 'Reference'],
          type: 'Reference',
          typeColor: '#8B5CF6',
          time: 'Reference',
          icon: '🗺️',
        },
      ],
    },
  ],

  ml: [
    {
      phase: 'Phase 1 — Math & Python Foundations',
      phaseDesc: 'Build the mathematical and coding base for ML',
      phaseColor: '#10B981',
      resources: [
        {
          title: '3Blue1Brown — Linear Algebra',
          desc: 'The most beautiful math series ever made. "Essence of Linear Algebra" — visualizes vectors, matrices, and transformations in a way that actually makes sense.',
          url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab',
          tags: ['Free', 'YouTube', 'Visual'],
          type: 'Video',
          typeColor: '#EF4444',
          time: '5 hours',
          icon: '📐',
        },
        {
          title: '3Blue1Brown — Calculus',
          desc: '"Essence of Calculus" — understand derivatives and integrals visually before you need them for gradient descent. Watch this first.',
          url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr',
          tags: ['Free', 'YouTube', 'Visual'],
          type: 'Video',
          typeColor: '#EF4444',
          time: '4 hours',
          icon: '📉',
        },
        {
          title: 'Statistics for ML — StatQuest',
          desc: 'Josh Starmer explains every statistical concept used in ML — probability, distributions, hypothesis testing, Bayes theorem — with brilliant clarity.',
          url: 'https://www.youtube.com/@statquest',
          tags: ['Free', 'YouTube', 'Statistics'],
          type: 'Video',
          typeColor: '#EF4444',
          time: 'Ongoing',
          icon: '📊',
        },
        {
          title: 'Python for ML — Fast.ai',
          desc: 'Learn Python specifically in the context of ML and data science. Practical first approach — you build models before you fully understand the math.',
          url: 'https://www.fast.ai',
          tags: ['Free', 'Practical', 'Top-down'],
          type: 'Course',
          typeColor: '#10B981',
          time: '30 hours',
          icon: '🐍',
        },
      ],
    },
    {
      phase: 'Phase 2 — Core Machine Learning',
      phaseDesc: 'Understand the algorithms that power AI',
      phaseColor: '#F59E0B',
      resources: [
        {
          title: 'ML Crash Course — Google',
          desc: 'Google\'s own free ML course. Clear explanations of linear regression, neural networks, feature engineering, and training. Highly practical.',
          url: 'https://developers.google.com/machine-learning/crash-course',
          tags: ['Free', 'Official', 'Practical'],
          type: 'Course',
          typeColor: '#10B981',
          time: '15 hours',
          icon: '🔍',
        },
        {
          title: 'Scikit-learn User Guide',
          desc: 'The official sklearn docs are actually excellent tutorials. Work through the examples — classification, regression, clustering, model selection.',
          url: 'https://scikit-learn.org/stable/user_guide.html',
          tags: ['Free', 'Official', 'Hands-on'],
          type: 'Docs',
          typeColor: '#06B6D4',
          time: '20 hours',
          icon: '⚙️',
        },
        {
          title: 'ML from Scratch — Sentdex',
          desc: 'Build ML algorithms from scratch in Python without any ML libraries. The best way to truly understand what is happening inside the black box.',
          url: 'https://www.youtube.com/playlist?list=PLQVvvaa0QuDfKTOs3Keq_kaG2P55YRn5v',
          tags: ['Free', 'YouTube', 'From Scratch'],
          type: 'Video',
          typeColor: '#EF4444',
          time: '15 hours',
          icon: '🔨',
        },
        {
          title: 'Kaggle Learn',
          desc: 'Free micro-courses on Pandas, ML, deep learning, NLP, and more. Each course is 4–8 hours with interactive notebooks you run in the browser.',
          url: 'https://www.kaggle.com/learn',
          tags: ['Free', 'Interactive', 'Certificate'],
          type: 'Course',
          typeColor: '#10B981',
          time: '4–8 hrs each',
          icon: '🏅',
        },
      ],
    },
    {
      phase: 'Phase 3 — Deep Learning',
      phaseDesc: 'Neural networks, CNNs, transformers, and beyond',
      phaseColor: '#8B5CF6',
      resources: [
        {
          title: 'Deep Learning Specialization — deeplearning.ai',
          desc: 'Andrew Ng\'s iconic course — the best structured deep learning curriculum. Audit free on Coursera. Covers DNNs, CNNs, RNNs, sequence models.',
          url: 'https://www.coursera.org/specializations/deep-learning',
          tags: ['Freemium', 'Coursera', 'Certificate'],
          type: 'Course',
          typeColor: '#10B981',
          time: '3 months',
          icon: '🧠',
        },
        {
          title: 'PyTorch Tutorials — Official',
          desc: 'The official PyTorch tutorials are genuinely excellent. Work through the 60-minute blitz first, then go deeper into whatever you need.',
          url: 'https://pytorch.org/tutorials/',
          tags: ['Free', 'Official', 'Hands-on'],
          type: 'Docs',
          typeColor: '#06B6D4',
          time: '20 hours',
          icon: '🔥',
        },
        {
          title: 'Andrej Karpathy — Neural Nets from Zero',
          desc: 'The most legendary ML tutorial series — Karpathy builds a neural network, then a GPT-2 from absolute scratch. Essential viewing for any serious ML student.',
          url: 'https://www.youtube.com/@AndrejKarpathy',
          tags: ['Free', 'YouTube', 'Expert'],
          type: 'Video',
          typeColor: '#EF4444',
          time: '10 hours',
          icon: '⚡',
        },
      ],
    },
    {
      phase: 'Phase 4 — Projects & Deployment',
      phaseDesc: 'Build real ML projects and ship them',
      phaseColor: '#EF4444',
      resources: [
        {
          title: 'Hugging Face — Model Hub',
          desc: 'Use pre-trained transformer models for NLP, computer vision, audio — all with 3 lines of Python. Build impressive projects immediately.',
          url: 'https://huggingface.co',
          tags: ['Free', 'Models', 'NLP'],
          type: 'Platform',
          typeColor: '#F59E0B',
          time: 'Reference',
          icon: '🤗',
        },
        {
          title: 'Weights & Biases — MLOps',
          desc: 'Track your ML experiments, visualize training curves, compare models. Free for students. Used by researchers at top labs worldwide.',
          url: 'https://wandb.ai',
          tags: ['Free for students', 'MLOps', 'Tracking'],
          type: 'Tool',
          typeColor: '#06B6D4',
          time: 'Reference',
          icon: '📈',
        },
        {
          title: 'Streamlit — Deploy ML Apps',
          desc: 'Build and deploy ML web apps in pure Python — no HTML, CSS, or JS needed. The fastest way to show your ML project to the world.',
          url: 'https://streamlit.io',
          tags: ['Free', 'Deployment', 'Python'],
          type: 'Tool',
          typeColor: '#06B6D4',
          time: '3 hours',
          icon: '🚀',
        },
      ],
    },
  ],

  sys: [
    {
      phase: 'Phase 1 — Fundamentals',
      phaseDesc: 'Understand how computers and networks actually work',
      phaseColor: '#10B981',
      resources: [
        {
          title: 'CS75 Scalability — Harvard',
          desc: 'David Malan\'s legendary scalability lecture from 2012 — still the single best intro to system design concepts. Watch this first, always.',
          url: 'https://www.youtube.com/watch?v=-W9F__D3oY4',
          tags: ['Free', 'YouTube', 'Classic'],
          type: 'Video',
          typeColor: '#EF4444',
          time: '1.5 hours',
          icon: '🎓',
        },
        {
          title: 'Computer Networking — Khan Academy',
          desc: 'Understand HTTP, DNS, TCP/IP, and how the internet works. You can\'t design systems without knowing how data moves.',
          url: 'https://www.khanacademy.org/computing/computers-and-internet',
          tags: ['Free', 'Video', 'Beginner'],
          type: 'Course',
          typeColor: '#10B981',
          time: '6 hours',
          icon: '🌐',
        },
        {
          title: 'Linux Journey',
          desc: 'Free interactive Linux tutorial in the browser. Understand the OS your servers run on — file systems, processes, permissions, networking.',
          url: 'https://linuxjourney.com',
          tags: ['Free', 'Interactive', 'Linux'],
          type: 'Course',
          typeColor: '#10B981',
          time: '10 hours',
          icon: '🐧',
        },
        {
          title: 'How Does the Internet Work?',
          desc: 'Mozilla\'s clear, authoritative explanation of how the web works underneath. Read this before designing anything that touches the internet.',
          url: 'https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Web_mechanics/How_does_the_Internet_work',
          tags: ['Free', 'Article', 'Quick'],
          type: 'Article',
          typeColor: '#F59E0B',
          time: '1 hour',
          icon: '📄',
        },
      ],
    },
    {
      phase: 'Phase 2 — System Design Concepts',
      phaseDesc: 'Learn the building blocks of large-scale systems',
      phaseColor: '#F59E0B',
      resources: [
        {
          title: 'System Design Primer — GitHub',
          desc: 'The most starred system design resource on GitHub. Covers load balancers, CDNs, caching, databases, consistency, CAP theorem — everything.',
          url: 'https://github.com/donnemartin/system-design-primer',
          tags: ['Free', 'GitHub', 'Comprehensive'],
          type: 'Reference',
          typeColor: '#8B5CF6',
          time: '20+ hours',
          icon: '⭐',
        },
        {
          title: 'ByteByteGo Newsletter & YouTube',
          desc: 'Alex Xu\'s visual system design explanations — the author of "System Design Interview" books. Best visual system design content available free.',
          url: 'https://www.youtube.com/@ByteByteGo',
          tags: ['Free', 'YouTube', 'Visual'],
          type: 'Video',
          typeColor: '#EF4444',
          time: 'Ongoing',
          icon: '📺',
        },
        {
          title: 'High Scalability Blog',
          desc: 'Real architecture case studies — how Twitter, Netflix, Uber, WhatsApp, and others actually built their systems. Invaluable real-world context.',
          url: 'http://highscalability.com',
          tags: ['Free', 'Case Studies', 'Real-world'],
          type: 'Article',
          typeColor: '#F59E0B',
          time: 'Ongoing',
          icon: '📰',
        },
        {
          title: 'Designing Data-Intensive Apps — DDIA',
          desc: 'The bible of distributed systems by Martin Kleppmann. Read Chapter 1 free online. One of the most important tech books of the last decade.',
          url: 'https://dataintensive.net',
          tags: ['Paid Book', 'In-depth', 'Advanced'],
          type: 'Book',
          typeColor: '#F59E0B',
          time: '40 hours',
          icon: '📚',
        },
      ],
    },
    {
      phase: 'Phase 3 — Databases & Distributed Systems',
      phaseDesc: 'Master data storage, consistency, and distributed patterns',
      phaseColor: '#8B5CF6',
      resources: [
        {
          title: 'CMU Database Course — Andy Pavlo',
          desc: 'Carnegie Mellon\'s full database course free on YouTube. Covers everything from B-trees to concurrency control to distributed transactions.',
          url: 'https://www.youtube.com/playlist?list=PLSE8ODhjZXjbohkNBWQs_otTrBTrjyohi',
          tags: ['Free', 'YouTube', 'University'],
          type: 'Course',
          typeColor: '#10B981',
          time: '25 hours',
          icon: '🗄️',
        },
        {
          title: 'SQL Murder Mystery',
          desc: 'Solve a murder mystery using only SQL. Learn joins, subqueries, and aggregations while feeling like a detective. Seriously fun.',
          url: 'https://mystery.knightlab.com',
          tags: ['Free', 'Game', 'SQL'],
          type: 'Game',
          typeColor: '#8B5CF6',
          time: '2 hours',
          icon: '🔍',
        },
        {
          title: 'Redis University',
          desc: 'Free official Redis courses covering caching strategies, pub/sub, streams, and use cases. Caching is in every system design interview.',
          url: 'https://university.redis.com',
          tags: ['Free', 'Official', 'Certificate'],
          type: 'Course',
          typeColor: '#10B981',
          time: '8 hours',
          icon: '⚡',
        },
      ],
    },
    {
      phase: 'Phase 4 — Interview Practice',
      phaseDesc: 'Practice real system design interview questions',
      phaseColor: '#EF4444',
      resources: [
        {
          title: 'Exponent — System Design',
          desc: 'Structured system design interview prep with video walkthroughs of real questions: Design Twitter, Design YouTube, Design Uber.',
          url: 'https://www.tryexponent.com/courses/system-design-interview',
          tags: ['Freemium', 'Interview', 'Structured'],
          type: 'Course',
          typeColor: '#10B981',
          time: '10 hours',
          icon: '🎯',
        },
        {
          title: 'Pramp — System Design Mock',
          desc: 'Free mock system design interviews with peers. Practice explaining your architecture out loud, which is the actual skill the interview tests.',
          url: 'https://www.pramp.com/#/system-design',
          tags: ['Free', 'Mock Interview', 'Peer'],
          type: 'Practice',
          typeColor: '#06B6D4',
          time: '1 hr/session',
          icon: '🤝',
        },
        {
          title: 'Grokking System Design — Educative',
          desc: 'The classic system design prep course. Covers URL shortener, Instagram, Twitter, Netflix, Uber with diagrams and capacity estimations.',
          url: 'https://www.educative.io/courses/grokking-the-system-design-interview',
          tags: ['Paid', 'Structured', 'Industry standard'],
          type: 'Course',
          typeColor: '#10B981',
          time: '15 hours',
          icon: '📋',
        },
      ],
    },
  ],
};

// ── Color for resource type badge ───────────────────────────────
const TYPE_COLORS = {
  Course:    { bg: 'rgba(16,185,129,0.12)',  color: '#34D399', border: 'rgba(16,185,129,0.2)'  },
  Video:     { bg: 'rgba(239,68,68,0.12)',   color: '#FCA5A5', border: 'rgba(239,68,68,0.2)'   },
  Game:      { bg: 'rgba(139,92,246,0.12)',  color: '#C4B5FD', border: 'rgba(139,92,246,0.2)'  },
  Article:   { bg: 'rgba(245,158,11,0.12)',  color: '#FCD34D', border: 'rgba(245,158,11,0.2)'  },
  Book:      { bg: 'rgba(245,158,11,0.12)',  color: '#FCD34D', border: 'rgba(245,158,11,0.2)'  },
  Reference: { bg: 'rgba(139,92,246,0.12)',  color: '#C4B5FD', border: 'rgba(139,92,246,0.2)'  },
  Practice:  { bg: 'rgba(6,182,212,0.12)',   color: '#67E8F9', border: 'rgba(6,182,212,0.2)'   },
  Docs:      { bg: 'rgba(6,182,212,0.12)',   color: '#67E8F9', border: 'rgba(6,182,212,0.2)'   },
  Tool:      { bg: 'rgba(6,182,212,0.12)',   color: '#67E8F9', border: 'rgba(6,182,212,0.2)'   },
  Platform:  { bg: 'rgba(245,158,11,0.12)',  color: '#FCD34D', border: 'rgba(245,158,11,0.2)'  },
  Roadmap:   { bg: 'rgba(139,92,246,0.12)',  color: '#C4B5FD', border: 'rgba(139,92,246,0.2)'  },
};

// ── XP reward on completion ──────────────────────────────────────
const ROADMAP_COMPLETE_BONUS_XP = 300;

export default function Roadmap() {
  const { user, updateUser } = useAuth();
  const [roadmaps,    setRoadmaps]    = useState([]);
  const [myRoadmaps,  setMyRoadmaps]  = useState([]);
  const [activeId,    setActiveId]    = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [starting,    setStarting]    = useState(null);
  const [toast,       setToast]       = useState(null);
  const [visited,     setVisited]     = useState(() => {
    try { return JSON.parse(localStorage.getItem('xpify_roadmap_visited') || '{}'); } catch { return {}; }
  });

  const loadAll = useCallback(() => {
    setLoading(true);
    Promise.all([roadmapAPI.getAll(), roadmapAPI.getMine()])
      .then(([allRes, mineRes]) => {
        setRoadmaps(allRes.roadmaps);
        setMyRoadmaps(mineRes.userRoadmaps);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const myProgressFor = (roadmapId) =>
    myRoadmaps.find(ur => ur.roadmap?._id === roadmapId);

  const handleStart = async (roadmap) => {
    setStarting(roadmap._id);
    try {
      await roadmapAPI.start(roadmap._id);
      await loadAll();
      setActiveId(roadmap._id);
    } catch (e) { console.error(e); }
    finally { setStarting(null); }
  };

  const handleLeave = async (roadmapId) => {
    try {
      await roadmapAPI.leave(roadmapId);
      setMyRoadmaps(prev => prev.filter(ur => ur.roadmap?._id !== roadmapId));
      setActiveId(null);
    } catch (e) { console.error(e); }
  };

  // Track when user opens a resource link
  const handleOpenResource = (roadmapId, resourceTitle, url) => {
    const key = `${roadmapId}_${resourceTitle}`;
    const newVisited = { ...visited, [key]: true };
    setVisited(newVisited);
    localStorage.setItem('xpify_roadmap_visited', JSON.stringify(newVisited));
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast('🚀 Opening resource...');
  };

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  const getCategoryKey = (roadmap) => {
    return roadmap?.category || 'general';
  };

  const getResources = (roadmap) => {
    const cat = getCategoryKey(roadmap);
    return ROADMAP_RESOURCES[cat] || [];
  };

  const countVisited = (roadmapId, catKey) => {
    const phases = ROADMAP_RESOURCES[catKey] || [];
    const total = phases.reduce((sum, p) => sum + p.resources.length, 0);
    const done  = phases.reduce((sum, p) =>
      sum + p.resources.filter(r =>
        visited[`${roadmapId}_${r.title}`]
      ).length, 0);
    return { done, total };
  };

  if (loading) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>
      <Mascot size={80} mood="sleepy" level={user?.level} />
      <div style={{ color: 'var(--text2)', marginTop: 16 }}>Nova is mapping your learning path...</div>
    </div>
  );

  // ── DETAIL VIEW ──────────────────────────────────────────────
  const activeRoadmap = roadmaps.find(r => r._id === activeId);
  if (activeRoadmap) {
    const catKey    = getCategoryKey(activeRoadmap);
    const meta      = ROADMAP_META[catKey] || ROADMAP_META.general;
    const phases    = getResources(activeRoadmap);
    const progress  = myProgressFor(activeRoadmap._id);
    const { done, total } = countVisited(activeRoadmap._id, catKey);
    const pct = total ? Math.round((done / total) * 100) : 0;

    return (
      <div className="page" style={{ maxWidth: 860, margin: '0 auto' }}>
        {toast && (
          <div style={{
            position: 'fixed', top: 20, right: 20, zIndex: 300,
            background: 'linear-gradient(135deg, var(--violet), var(--violet2))',
            color: '#fff', padding: '12px 20px', borderRadius: 14,
            fontWeight: 700, fontSize: 13, boxShadow: 'var(--shadow-glow)',
          }}>{toast}</div>
        )}

        {/* Back button */}
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }} onClick={() => setActiveId(null)}>
          ← Back to Roadmaps
        </button>

        {/* Header */}
        <div style={{
          background: 'var(--card)', border: `1px solid ${meta.border}`,
          borderRadius: 20, padding: 28, marginBottom: 24,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: `radial-gradient(circle, ${meta.color}18, transparent 70%)`, pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: meta.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
              {meta.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{activeRoadmap.title}</div>
              <div style={{ color: 'var(--text2)', fontSize: 13 }}>{activeRoadmap.description}</div>
            </div>
          </div>

          {/* Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
            <div style={{ flex: 1, height: 7, background: 'var(--surface4)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: meta.gradient, borderRadius: 99, transition: 'width 0.7s ease' }} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: meta.color, flexShrink: 0 }}>
              {done}/{total} resources visited
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>
            Click "Open Resource" to visit a site — it will be marked as visited automatically
          </div>
        </div>

        {/* Phases */}
        {phases.map((phase, phaseIdx) => (
          <div key={phaseIdx} style={{ marginBottom: 28 }}>
            {/* Phase header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: `${phase.phaseColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: phase.phaseColor, flexShrink: 0, border: `1px solid ${phase.phaseColor}30` }}>
                {phaseIdx + 1}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>{phase.phase}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>{phase.phaseDesc}</div>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text3)' }}>
                {phase.resources.filter(r => visited[`${activeRoadmap._id}_${r.title}`]).length}/{phase.resources.length} visited
              </div>
            </div>

            {/* Resource cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 8 }}>
              {phase.resources.map((res, resIdx) => {
                const key     = `${activeRoadmap._id}_${res.title}`;
                const isVisited = visited[key];
                const typeStyle = TYPE_COLORS[res.type] || TYPE_COLORS.Article;

                return (
                  <div key={resIdx} style={{
                    background: 'var(--card)',
                    border: `1px solid ${isVisited ? `${meta.color}30` : 'var(--border)'}`,
                    borderRadius: 16, padding: '16px 18px',
                    display: 'flex', alignItems: 'flex-start', gap: 14,
                    transition: 'all 0.2s',
                    opacity: isVisited ? 0.8 : 1,
                    position: 'relative', overflow: 'hidden',
                  }}>
                    {/* Visited indicator stripe */}
                    {isVisited && (
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: meta.color, borderRadius: '0 0 0 0' }} />
                    )}

                    {/* Icon */}
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${meta.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, border: `1px solid ${meta.color}20` }}>
                      {res.icon}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span style={{ fontWeight: 800, fontSize: 14 }}>{res.title}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, ...typeStyle }}>
                          {res.type}
                        </span>
                        {isVisited && (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: `${meta.color}15`, color: meta.color }}>
                            ✓ Visited
                          </span>
                        )}
                      </div>
                      <div style={{ color: 'var(--text2)', fontSize: 12.5, lineHeight: 1.55, marginBottom: 10 }}>
                        {res.desc}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        {res.tags.map(tag => (
                          <span key={tag} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: 'var(--surface3)', color: 'var(--text3)', border: '1px solid var(--border)' }}>
                            {tag}
                          </span>
                        ))}
                        <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 'auto' }}>⏱️ {res.time}</span>
                      </div>
                    </div>

                    {/* Open button */}
                    <button
                      onClick={() => handleOpenResource(activeRoadmap._id, res.title, res.url)}
                      style={{
                        padding: '8px 16px', borderRadius: 10,
                        background: isVisited ? 'var(--surface3)' : meta.gradient,
                        color: isVisited ? 'var(--text2)' : '#fff',
                        border: isVisited ? '1px solid var(--border)' : 'none',
                        fontWeight: 700, fontSize: 12.5, cursor: 'pointer',
                        flexShrink: 0, transition: 'all 0.18s',
                        boxShadow: isVisited ? 'none' : `0 4px 14px ${meta.color}30`,
                      }}
                    >
                      {isVisited ? 'Open Again' : 'Open Resource →'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Leave roadmap */}
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--text3)' }} onClick={() => handleLeave(activeRoadmap._id)}>
            Leave this roadmap
          </button>
        </div>
      </div>
    );
  }

  // ── BROWSE VIEW ──────────────────────────────────────────────
  return (
    <div className="page">
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 300,
          background: 'linear-gradient(135deg, var(--violet), var(--violet2))',
          color: '#fff', padding: '12px 20px', borderRadius: 14,
          fontWeight: 700, fontSize: 13, boxShadow: 'var(--shadow-glow)',
        }}>{toast}</div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div className="section-title" style={{ fontSize: 22, marginBottom: 4 }}>Learning Roadmaps</div>
        <div style={{ color: 'var(--text2)', fontSize: 13 }}>
          Pick a structured path — each roadmap links directly to the best real websites for that skill 🗺️
        </div>
      </div>

      {/* My active roadmaps */}
      {myRoadmaps.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div className="section-title" style={{ fontSize: 14, marginBottom: 14 }}>Continue Learning</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {myRoadmaps.map(ur => {
              const catKey = getCategoryKey(ur.roadmap);
              const meta   = ROADMAP_META[catKey] || ROADMAP_META.general;
              const { done, total } = countVisited(ur.roadmap._id, catKey);
              const pct = total ? Math.round((done / total) * 100) : 0;
              return (
                <div key={ur._id} className="card card-interactive" onClick={() => setActiveId(ur.roadmap._id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: meta.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{meta.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>{ur.roadmap?.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text2)' }}>{done}/{total} resources visited</div>
                    </div>
                  </div>
                  <div style={{ height: 5, background: 'var(--surface4)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: meta.gradient, borderRadius: 99, transition: 'width 0.7s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All roadmaps */}
      <div className="section-title" style={{ fontSize: 14, marginBottom: 14 }}>All Roadmaps</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 16 }}>
        {roadmaps.map(r => {
          const catKey  = getCategoryKey(r);
          const meta    = ROADMAP_META[catKey] || ROADMAP_META.general;
          const phases  = ROADMAP_RESOURCES[catKey] || [];
          const total   = phases.reduce((s, p) => s + p.resources.length, 0);
          const progress = myProgressFor(r._id);
          const { done } = progress ? countVisited(r._id, catKey) : { done: 0 };

          return (
            <div key={r._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: meta.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, boxShadow: `0 4px 14px ${meta.color}30` }}>
                  {meta.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{r.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{phases.length} phases · {total} resources</div>
                </div>
              </div>
              <div style={{ color: 'var(--text2)', fontSize: 12.5, lineHeight: 1.55 }}>{r.description}</div>

              {/* Phase tags */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {phases.map((p, i) => (
                  <span key={i} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, background: `${p.phaseColor}12`, color: p.phaseColor, border: `1px solid ${p.phaseColor}20`, fontWeight: 600 }}>
                    {p.phase.split(' — ')[1] || p.phase}
                  </span>
                ))}
              </div>

              {progress ? (
                <>
                  <div style={{ height: 5, background: 'var(--surface4)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${total ? Math.round((done/total)*100) : 0}%`, background: meta.gradient, borderRadius: 99 }} />
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => setActiveId(r._id)}>
                    Continue →
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleStart(r)}
                  disabled={starting === r._id}
                  style={{ background: meta.gradient }}
                >
                  {starting === r._id ? '⏳ Starting...' : `Start ${r.title.split(' ')[0]} Path →`}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}