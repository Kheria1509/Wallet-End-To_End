const mongoose = require("mongoose");

// Optimized MongoDB connection for serverless environments
const connectDB = async () => {
  try {
    // Check if already connected
    if (mongoose.connections[0].readyState) {
      console.log('Already connected to MongoDB');
      return;
    }

    const mongoOptions = {
      // Connection timeout settings (critical for serverless)
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      connectTimeoutMS: 10000, // 10 seconds connection timeout
      
      // Buffer settings
      bufferMaxEntries: 0, // Disable buffering
      bufferCommands: false, // Disable command buffering
      
      // Connection pool settings for serverless
      maxPoolSize: 10, // Maximum connections in pool
      minPoolSize: 1,  // Minimum connections in pool
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      
      // Retry settings
      retryWrites: true,
      retryReads: true,
      
      // Additional serverless optimizations
      heartbeatFrequencyMS: 10000, // Heartbeat every 10 seconds
      family: 4, // Use IPv4
    };

    console.log('Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(process.env.MONGODB_URI, mongoOptions);
    console.log(`Connected to MongoDB Atlas: ${conn.connection.host}`);
    
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    
    // Log specific error types for debugging
    if (error.name === 'MongoNetworkTimeoutError') {
      console.error('Network timeout - check MongoDB Atlas network access settings');
    } else if (error.name === 'MongoServerSelectionError') {
      console.error('Server selection error - check connection string and cluster status');
    }
    
    // Don't exit process in serverless environment
    // process.exit(1);
    throw error;
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB Atlas');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

// Initialize connection
connectDB();

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minLength: 3,
    maxLength: 30,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  avatar: {
    type: String,
    default: ""
  },
  acceptedTerms: {
    type: Boolean,
    required: true,
    default: false
  },
  resetToken: {
    code: String,
    expiry: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  balance: {
    type: Number,
    required: true,
  },
});

const transactionSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['DEBIT', 'CREDIT']
  },
  amount: {
    type: Number,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const recurringTransferSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  frequency: {
    type: String,
    required: true,
    enum: ['DAILY', 'WEEKLY', 'MONTHLY']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  lastExecuted: {
    type: Date
  },
  description: {
    type: String,
    maxLength: 100
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'PAUSED', 'COMPLETED', 'FAILED'],
    default: 'ACTIVE'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Account = mongoose.model("Account", accountSchema);
const User = mongoose.model("User", userSchema);
const Transaction = mongoose.model("Transaction", transactionSchema);
const Notification = mongoose.model("Notification", notificationSchema);
const RecurringTransfer = mongoose.model("RecurringTransfer", recurringTransferSchema);

module.exports = {
  User,
  Account,
  Transaction,
  Notification,
  RecurringTransfer
};
