const cron = require('node-cron');
const User = require('../models/User');

/**
 * Runs every day at midnight (00:00)
 * Resets streak to 0 for any user who didn't post yesterday
 */
const startStreakCron = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('⏰ Running daily streak reset job...');
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const endOfYesterday = new Date(yesterday);
      endOfYesterday.setHours(23, 59, 59, 999);

      // Find users whose lastPostDate is NOT from today or yesterday
      // i.e., they missed a day → reset streak
      const result = await User.updateMany(
        {
          streak: { $gt: 0 },
          $or: [
            { lastPostDate: null },
            { lastPostDate: { $lt: yesterday } },
          ],
        },
        { $set: { streak: 0 } }
      );

      console.log(`✅ Streak reset: ${result.modifiedCount} users affected`);
    } catch (err) {
      console.error('❌ Streak cron error:', err.message);
    }
  }, {
    timezone: 'Asia/Kolkata', // Change to your timezone
  });

  console.log('📅 Streak cron job scheduled (runs daily at midnight IST)');
};

module.exports = startStreakCron;
