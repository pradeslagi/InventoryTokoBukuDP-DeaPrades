import { MongoClient } from 'mongodb';

// Configuration
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'tokobuku';

// Connection options
const options = {
  maxPoolSize: 10,
  minPoolSize: 5,
  retryWrites: true,
  w: 'majority'
};

// Connection handling
let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add MONGODB_URI to .env file');
}

// Development vs Production connection handling
if (process.env.NODE_ENV === 'development') {
  // In development, use global variable to preserve connection across HMR
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect()
      .catch(err => {
        console.error('MongoDB connection error:', err);
        throw err;
      });
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create new connection
  client = new MongoClient(uri, options);
  clientPromise = client.connect()
    .catch(err => {
      console.error('MongoDB connection error:', err);
      throw err;
    });
}

// Main connection function
export async function connectDB() {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);

    // Test connection
    await db.command({ ping: 1 });
    console.log('MongoDB connection successful');

    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

// Additional utility functions
export async function closeConnection() {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Named export only, do NOT use default export
export { clientPromise };