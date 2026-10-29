const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cyclic_recruitment_portal';
    
    try {
      const conn = await mongoose.connect(mongoUri, {
        family: 4,
        directConnection: true,
        serverSelectionTimeoutMS: 1500,
      });
      console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
      return conn;
    } catch (localError) {
      console.warn(`⚠️ Standard MongoDB not reachable at ${mongoUri}.`);
      console.log(`⚡ Initializing in-memory MongoDB Server for zero-configuration execution...`);
      
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      
      const conn = await mongoose.connect(memoryUri, {
        family: 4,
      });
      console.log(`✅ In-Memory MongoDB Server Connected at: ${memoryUri}`);
      return conn;
    }
  } catch (error) {
    console.error(`❌ Error connecting to database: ${error.message}`);
    process.exit(1);
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
  } catch (err) {
    console.error('Error closing DB:', err.message);
  }
};

module.exports = { connectDB, closeDB };
