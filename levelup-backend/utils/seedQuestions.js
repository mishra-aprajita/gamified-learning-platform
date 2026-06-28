// utils/seedQuestions.js
// ─────────────────────────────────────────────
//  Populates the database with a starter question bank.
//  Runs automatically on server start if no questions exist yet.
//  Can also be run manually:  node utils/seedQuestions.js
// ─────────────────────────────────────────────
const Question = require('../models/Question');

const QUESTION_SEED_DATA = [
  // ── DSA ──────────────────────────────────
  { category: 'dsa', difficulty: 'easy',   questionText: 'What is the time complexity of binary search on a sorted array?', options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], correctIndex: 1, explanation: 'Binary search halves the search space each step, giving O(log n).' },
  { category: 'dsa', difficulty: 'easy',   questionText: 'Which data structure uses LIFO (Last In First Out) order?', options: ['Queue', 'Stack', 'Linked List', 'Heap'], correctIndex: 1, explanation: 'A stack pushes/pops from the same end, giving LIFO order.' },
  { category: 'dsa', difficulty: 'medium', questionText: 'What is the average time complexity of inserting into a hash map?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n^2)'], correctIndex: 2, explanation: 'Hash maps give O(1) average insertion due to direct indexing via hash.' },
  { category: 'dsa', difficulty: 'medium', questionText: 'Which traversal visits a binary tree in the order: left, root, right?', options: ['Preorder', 'Inorder', 'Postorder', 'Level order'], correctIndex: 1, explanation: 'Inorder traversal visits left subtree, then root, then right subtree.' },
  { category: 'dsa', difficulty: 'medium', questionText: 'What technique solves problems by storing results of subproblems to avoid recomputation?', options: ['Greedy', 'Dynamic Programming', 'Backtracking', 'Divide and Conquer'], correctIndex: 1, explanation: 'Dynamic Programming caches subproblem results (memoization/tabulation).' },
  { category: 'dsa', difficulty: 'hard',   questionText: 'What is the time complexity of Dijkstra\'s algorithm using a min-heap?', options: ['O(V)', 'O(V + E)', 'O((V + E) log V)', 'O(V^2)'], correctIndex: 2, explanation: 'With a min-heap, Dijkstra runs in O((V+E) log V).' },
  { category: 'dsa', difficulty: 'hard',   questionText: 'Which pattern is best for finding the longest substring without repeating characters?', options: ['Two Pointers', 'Sliding Window', 'Binary Search', 'Union Find'], correctIndex: 1, explanation: 'Sliding window expands/shrinks a window while tracking seen characters.' },
  { category: 'dsa', difficulty: 'easy',   questionText: 'What does Big-O notation describe?', options: ['Exact runtime', 'Memory address', 'Upper bound of growth rate', 'Number of lines of code'], correctIndex: 2, explanation: 'Big-O describes the upper bound on how runtime/space grows with input size.' },
  { category: 'dsa', difficulty: 'medium', questionText: 'A self-balancing binary search tree that maintains O(log n) operations is called?', options: ['Linked List', 'AVL Tree', 'Array', 'Hash Set'], correctIndex: 1, explanation: 'AVL trees rebalance on insert/delete to guarantee O(log n) height.' },
  { category: 'dsa', difficulty: 'easy',   questionText: 'Which of these is NOT a typical use of a queue?', options: ['BFS traversal', 'Task scheduling', 'Function call stack', 'Print job management'], correctIndex: 2, explanation: 'The function call stack uses a Stack (LIFO), not a Queue (FIFO).' },

  // ── Web Development ─────────────────────
  { category: 'web', difficulty: 'easy',   questionText: 'Which HTML tag is used to link an external CSS file?', options: ['<style>', '<script>', '<link>', '<css>'], correctIndex: 2, explanation: '<link rel="stylesheet"> connects an external CSS file to the HTML page.' },
  { category: 'web', difficulty: 'easy',   questionText: 'In React, what hook is used to manage state in a functional component?', options: ['useEffect', 'useState', 'useRef', 'useContext'], correctIndex: 1, explanation: 'useState returns a state variable and a setter function.' },
  { category: 'web', difficulty: 'medium', questionText: 'What does CSS flexbox property "justify-content" control?', options: ['Vertical alignment', 'Horizontal alignment on main axis', 'Font size', 'Border radius'], correctIndex: 1, explanation: 'justify-content aligns flex items along the main axis.' },
  { category: 'web', difficulty: 'medium', questionText: 'Which HTTP method is idempotent and used to update an entire resource?', options: ['POST', 'PUT', 'PATCH', 'DELETE'], correctIndex: 1, explanation: 'PUT replaces the entire resource and is idempotent (same result if repeated).' },
  { category: 'web', difficulty: 'medium', questionText: 'What does JWT stand for?', options: ['Java Web Token', 'JSON Web Token', 'JavaScript Web Tool', 'Joint Web Transfer'], correctIndex: 1, explanation: 'JWT (JSON Web Token) is a compact way to securely transmit claims between parties.' },
  { category: 'web', difficulty: 'hard',   questionText: 'What is the main benefit of using React\'s virtual DOM?', options: ['Faster server response', 'Reduces direct DOM manipulation for better performance', 'Improves SEO automatically', 'Removes need for CSS'], correctIndex: 1, explanation: 'The virtual DOM batches and minimizes expensive real DOM updates.' },
  { category: 'web', difficulty: 'hard',   questionText: 'In Node.js, what does the event loop allow JavaScript to do?', options: ['Run multiple threads simultaneously', 'Handle async operations without blocking the single thread', 'Compile code faster', 'Directly access the filesystem'], correctIndex: 1, explanation: 'The event loop lets Node.js handle async I/O without blocking, despite being single-threaded.' },
  { category: 'web', difficulty: 'easy',   questionText: 'Which CSS unit is relative to the viewport width?', options: ['px', 'em', 'vw', 'pt'], correctIndex: 2, explanation: 'vw (viewport width) is a percentage of the browser viewport\'s width.' },
  { category: 'web', difficulty: 'medium', questionText: 'What is the purpose of package.json in a Node.js project?', options: ['Stores compiled code', 'Lists dependencies and project metadata', 'Stores environment secrets', 'Runs the server'], correctIndex: 1, explanation: 'package.json tracks dependencies, scripts, and metadata for the project.' },
  { category: 'web', difficulty: 'easy',   questionText: 'Which React hook lets you run code after the component renders?', options: ['useState', 'useEffect', 'useMemo', 'useCallback'], correctIndex: 1, explanation: 'useEffect runs side effects after render, optionally on dependency changes.' },

  // ── Machine Learning ─────────────────────
  { category: 'ml', difficulty: 'easy',   questionText: 'What type of learning uses labeled data to train a model?', options: ['Unsupervised learning', 'Supervised learning', 'Reinforcement learning', 'Semi-random learning'], correctIndex: 1, explanation: 'Supervised learning trains on input-output pairs (labeled data).' },
  { category: 'ml', difficulty: 'easy',   questionText: 'Which library is most commonly used for numerical computing in Python ML?', options: ['NumPy', 'Django', 'Flask', 'Express'], correctIndex: 0, explanation: 'NumPy provides fast array operations that underpin most ML libraries.' },
  { category: 'ml', difficulty: 'medium', questionText: 'What does "overfitting" mean in machine learning?', options: ['Model performs well on both train and test data', 'Model memorizes training data but fails on new data', 'Model trains too slowly', 'Model has too few parameters'], correctIndex: 1, explanation: 'Overfitting means the model fits noise in training data, hurting generalization.' },
  { category: 'ml', difficulty: 'medium', questionText: 'Which technique helps reduce overfitting by randomly dropping neurons during training?', options: ['Batch Normalization', 'Dropout', 'Gradient Clipping', 'One-Hot Encoding'], correctIndex: 1, explanation: 'Dropout randomly disables neurons each step, preventing over-reliance on specific paths.' },
  { category: 'ml', difficulty: 'medium', questionText: 'What does the "k" in k-Nearest Neighbors (k-NN) represent?', options: ['Number of features', 'Number of nearest data points considered', 'Number of clusters', 'Learning rate'], correctIndex: 1, explanation: 'k-NN classifies a point based on the majority class among its k nearest neighbors.' },
  { category: 'ml', difficulty: 'hard',   questionText: 'In a neural network, what does backpropagation compute?', options: ['Forward pass output', 'Gradients of the loss with respect to weights', 'The dataset size', 'The number of layers'], correctIndex: 1, explanation: 'Backpropagation uses the chain rule to compute gradients for weight updates.' },
  { category: 'ml', difficulty: 'hard',   questionText: 'Which evaluation metric is best for an imbalanced classification dataset?', options: ['Accuracy', 'F1-score', 'Mean Squared Error', 'R-squared'], correctIndex: 1, explanation: 'F1-score balances precision and recall, which accuracy fails to do on imbalanced data.' },
  { category: 'ml', difficulty: 'easy',   questionText: 'What is the goal of linear regression?', options: ['Classify data into categories', 'Predict a continuous numeric value', 'Cluster similar points', 'Reduce dimensionality'], correctIndex: 1, explanation: 'Linear regression fits a line to predict a continuous target variable.' },
  { category: 'ml', difficulty: 'medium', questionText: 'What does PCA (Principal Component Analysis) primarily do?', options: ['Increases dataset size', 'Reduces dimensionality while preserving variance', 'Labels unlabeled data', 'Removes all outliers'], correctIndex: 1, explanation: 'PCA projects data onto fewer dimensions that capture the most variance.' },
  { category: 'ml', difficulty: 'easy',   questionText: 'Which activation function outputs values between 0 and 1?', options: ['ReLU', 'Sigmoid', 'Tanh', 'Linear'], correctIndex: 1, explanation: 'Sigmoid squashes any input into the range (0, 1), often used for binary classification.' },

  // ── System Design ────────────────────────
  { category: 'sys', difficulty: 'easy',   questionText: 'What does a load balancer primarily do?', options: ['Stores data permanently', 'Distributes incoming traffic across multiple servers', 'Encrypts passwords', 'Compiles code'], correctIndex: 1, explanation: 'Load balancers spread requests across servers to avoid overload and improve availability.' },
  { category: 'sys', difficulty: 'easy',   questionText: 'What is the main benefit of caching?', options: ['Increases data accuracy', 'Reduces latency by serving repeated requests faster', 'Encrypts data', 'Increases storage cost'], correctIndex: 1, explanation: 'Caching stores frequently accessed data closer to the consumer for faster retrieval.' },
  { category: 'sys', difficulty: 'medium', questionText: 'What does horizontal scaling mean?', options: ['Adding more power (CPU/RAM) to one server', 'Adding more servers to handle load', 'Reducing server count', 'Compressing data'], correctIndex: 1, explanation: 'Horizontal scaling adds more machines, as opposed to vertical scaling (bigger machine).' },
  { category: 'sys', difficulty: 'medium', questionText: 'In the CAP theorem, what does the "P" stand for?', options: ['Performance', 'Partition tolerance', 'Persistence', 'Parallelism'], correctIndex: 1, explanation: 'CAP = Consistency, Availability, Partition tolerance — you can only fully guarantee 2 of 3.' },
  { category: 'sys', difficulty: 'medium', questionText: 'What is the purpose of a message queue like Kafka or RabbitMQ?', options: ['Store user passwords', 'Enable asynchronous communication between services', 'Render HTML pages', 'Compile source code'], correctIndex: 1, explanation: 'Message queues decouple services, allowing async, reliable communication.' },
  { category: 'sys', difficulty: 'hard',   questionText: 'What is database sharding?', options: ['Backing up a database', 'Splitting a database across multiple machines by key ranges', 'Encrypting database fields', 'Merging two databases'], correctIndex: 1, explanation: 'Sharding partitions data across nodes to scale storage and throughput.' },
  { category: 'sys', difficulty: 'hard',   questionText: 'Which consistency model guarantees that all nodes see the same data at the same time?', options: ['Eventual consistency', 'Strong consistency', 'Causal consistency', 'Read-your-writes consistency'], correctIndex: 1, explanation: 'Strong consistency ensures every read reflects the latest write, immediately, everywhere.' },
  { category: 'sys', difficulty: 'easy',   questionText: 'What does a CDN (Content Delivery Network) help with?', options: ['Database backups', 'Serving static content from servers closer to users', 'User authentication', 'Compiling code'], correctIndex: 1, explanation: 'CDNs cache content at edge locations near users to reduce latency.' },
  { category: 'sys', difficulty: 'medium', questionText: 'What problem does rate limiting solve?', options: ['Prevents abuse/overload by capping requests per user/time', 'Speeds up database writes', 'Encrypts API responses', 'Reduces server cost to zero'], correctIndex: 0, explanation: 'Rate limiting protects services from being overwhelmed by too many requests.' },
  { category: 'sys', difficulty: 'easy',   questionText: 'What is the role of DNS in a web request?', options: ['Encrypts the connection', 'Translates domain names into IP addresses', 'Stores user sessions', 'Compresses images'], correctIndex: 1, explanation: 'DNS resolves human-readable domains (like google.com) into IP addresses.' },
];

async function seedQuestions() {
  try {
    const count = await Question.countDocuments();
    if (count > 0) {
      console.log(`❓ Question bank already seeded (${count} found) — skipping`);
      return;
    }
    await Question.insertMany(QUESTION_SEED_DATA);
    console.log(`❓ Seeded ${QUESTION_SEED_DATA.length} quiz questions`);
  } catch (err) {
    console.error('❌ Question seeding error:', err.message);
  }
}

module.exports = seedQuestions;

// Allow running directly: node utils/seedQuestions.js
if (require.main === module) {
  require('dotenv').config();
  const connectDB = require('../config/db');
  connectDB().then(async () => {
    await seedQuestions();
    process.exit(0);
  });
}
