const mongoose = require('mongoose');
const User = require('../models/User');
const { repairUserIndexes } = require('../utils/repairUserIndexes');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    const dbName = conn.connection.db.databaseName;
    console.log(`✅ MongoDB Connected: ${conn.connection.host} (db: ${dbName})`);

    await repairUserIndexes(User);
    console.log('✅ User collection indexes synced');
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1); // Stop server if DB fails
  }
};

module.exports = connectDB;
