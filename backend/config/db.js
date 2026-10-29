const mongoose = require('mongoose');

let mongoMemoryServer = null;
let cachedPromise = null;

const connectDB = async () => {
  // Return immediately if already connected
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Reuse in-flight connection promise to avoid redundant connection attempts
  if (cachedPromise) {
    return cachedPromise;
  }

  cachedPromise = (async () => {
    const isVercel = Boolean(process.env.VERCEL);
    const mongoUri = process.env.MONGODB_URI;

    // Cloud MongoDB Atlas or external MongoDB URI
    const isCloudUri = mongoUri && (mongoUri.startsWith('mongodb+srv://') || mongoUri.includes('.mongodb.net'));

    if (isCloudUri || (isVercel && mongoUri)) {
      try {
        console.log('📡 Connecting to Cloud MongoDB Atlas...');
        const conn = await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 10000,
        });
        console.log(`✅ MongoDB Atlas Connected Successfully: ${conn.connection.host}`);
        return conn;
      } catch (cloudErr) {
        console.error(`❌ Cloud MongoDB Connection Error: ${cloudErr.message}`);
        throw cloudErr;
      }
    }

    // Guard on Vercel if MONGODB_URI is not set
    if (isVercel && !mongoUri) {
      const err = new Error(
        'MONGODB_URI is not configured in Vercel. Please add your MongoDB Atlas connection string in Vercel Project Settings > Environment Variables.'
      );
      console.error(`❌ ${err.message}`);
      throw err;
    }

    // Local development fallback
    const localUri = mongoUri || 'mongodb://127.0.0.1:27017/cyclic_recruitment_portal';

    try {
      const conn = await mongoose.connect(localUri, {
        family: 4,
        directConnection: true,
        serverSelectionTimeoutMS: 2000,
      });
      console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
      return conn;
    } catch (localError) {
      console.warn(`⚠️ Standard MongoDB not reachable at ${localUri}.`);
      console.log(`⚡ Launching in-memory MongoDB Server for development...`);

      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();

      const conn = await mongoose.connect(memoryUri, {
        family: 4,
      });
      console.log(`✅ In-Memory MongoDB Server Started & Connected at: ${memoryUri}`);
      return conn;
    }
  })();

  try {
    const conn = await cachedPromise;
    return conn;
  } catch (err) {
    cachedPromise = null;
    throw err;
  }
};

const closeDB = async () => {
  try {
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
      mongoMemoryServer = null;
    }
    cachedPromise = null;
  } catch (err) {
    console.error('Error closing DB:', err.message);
  }
};

module.exports = { connectDB, closeDB };

