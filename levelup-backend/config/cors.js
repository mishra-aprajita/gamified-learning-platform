const DEFAULT_ORIGINS = [
  'https://gamified-learning-platform-ecru.vercel.app',
  'https://gamified-learning-platform-drhf.vercel.app',
  'http://localhost:3000',
];

const normalizeOrigin = (value) => {
  if (!value) return null;
  const trimmed = String(value).trim().replace(/\/$/, '');
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `https://${trimmed}`;
};

const getAllowedOrigins = () => {
  const fromEnv = (process.env.CLIENT_URL || '')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);

  return [...new Set([...fromEnv, ...DEFAULT_ORIGINS])];
};

const corsOriginDelegate = (origin, callback) => {
  if (!origin) return callback(null, true);
  const allowed = getAllowedOrigins();
  if (allowed.includes(origin)) return callback(null, true);
  callback(new Error(`CORS blocked for origin: ${origin}`));
};

module.exports = { getAllowedOrigins, corsOriginDelegate };
