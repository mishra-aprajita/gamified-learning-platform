#!/usr/bin/env node
/**
 * Run against the same MONGO_URI Render uses:
 *   cd levelup-backend && node scripts/repair-user-indexes.js
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const { repairUserIndexes } = require('../utils/repairUserIndexes');

(async () => {
  if (!process.env.MONGO_URI) {
    console.error('Set MONGO_URI in .env or the environment');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to db:', mongoose.connection.db.databaseName);
  await repairUserIndexes(User);
  const indexes = await User.collection.indexes();
  console.log('users indexes:', JSON.stringify(indexes, null, 2));
  await mongoose.disconnect();
  console.log('Done.');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
