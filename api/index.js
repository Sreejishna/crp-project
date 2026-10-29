const { app } = require('../backend/server');
const { connectDB } = require('../backend/config/db');
const seedDatabase = require('../backend/utils/seedData');

let isDbInitialized = false;

module.exports = async (req, res) => {
  try {
    await connectDB();

    // Auto-seed on first run if database is empty
    if (!isDbInitialized) {
      try {
        const User = require('../backend/models/User');
        const userCount = await User.countDocuments();
        if (userCount === 0) {
          console.log('⚡ Empty database detected on Vercel. Running initial demo data seeder...');
          await seedDatabase();
        }
      } catch (seedErr) {
        console.warn('⚠️ Seeding check skipped/failed:', seedErr.message);
      }
      isDbInitialized = true;
    }

    return app(req, res);
  } catch (err) {
    console.error('Vercel serverless error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Database connection error.',
      hint: 'Ensure MONGODB_URI is configured in Vercel Project Settings > Environment Variables.'
    });
  }
};
