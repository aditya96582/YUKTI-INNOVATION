/**
 * Database Configuration
 * Supports MongoDB for production and in-memory for development
 */

const mongoose = require('mongoose');

const DATABASE_URL = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusconnect';
const USE_MONGODB = process.env.USE_MONGODB === 'true';

// MongoDB Schemas
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  location: String,
  phone: String,
  bio: String,
  tokens: { type: Number, default: 0 },
  reputation: { type: Number, default: 0 },
  helps: { type: Number, default: 0 },
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution' },
  role: { type: String, enum: ['user', 'pharmacy', 'admin'], default: 'user' },
  pushToken: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const InstitutionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['college', 'university', 'school', 'corporate', 'government'], required: true },
  location: String,
  adminEmail: String,
  settings: {
    aiMatchThreshold: { type: Number, default: 85 },
    rewardMultiplier: { type: Number, default: 1 },
    enableEmergency: { type: Boolean, default: true },
    enableMedical: { type: Boolean, default: true }
  },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const LostItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: Date, required: true },
  image: String,
  imageFeatures: [Number], // AI feature vector
  reward: { type: Number, default: 0 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution' },
  status: { type: String, enum: ['active', 'matched', 'resolved'], default: 'active' },
  matchedWith: { type: mongoose.Schema.Types.ObjectId, ref: 'FoundItem' },
  createdAt: { type: Date, default: Date.now }
});

const FoundItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: Date, required: true },
  image: String,
  imageFeatures: [Number], // AI feature vector
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution' },
  status: { type: String, enum: ['active', 'matched', 'resolved'], default: 'active' },
  matchedWith: { type: mongoose.Schema.Types.ObjectId, ref: 'LostItem' },
  createdAt: { type: Date, default: Date.now }
});

const MatchSchema = new mongoose.Schema({
  lostItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'LostItem', required: true },
  foundItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoundItem', required: true },
  confidence: { type: Number, required: true },
  imageSimilarity: Number,
  objectMatch: Number,
  metadataMatch: Number,
  matchReason: String,
  detectedObjects: [String],
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const RedemptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  partnerId: { type: String, required: true },
  partnerName: { type: String, required: true },
  coinsRedeemed: { type: Number, required: true },
  redemptionValue: { type: Number, required: true },
  voucherCode: String,
  voucherUrl: String,
  expiryDate: Date,
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

// Models
let User, Institution, LostItem, FoundItem, Match, Redemption;

if (USE_MONGODB) {
  User = mongoose.model('User', UserSchema);
  Institution = mongoose.model('Institution', InstitutionSchema);
  LostItem = mongoose.model('LostItem', LostItemSchema);
  FoundItem = mongoose.model('FoundItem', FoundItemSchema);
  Match = mongoose.model('Match', MatchSchema);
  Redemption = mongoose.model('Redemption', RedemptionSchema);
}

/**
 * Connect to MongoDB
 */
async function connectDatabase() {
  if (!USE_MONGODB) {
    console.log('📦 Using in-memory database (development mode)');
    return;
  }

  try {
    await mongoose.connect(DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 */
async function disconnectDatabase() {
  if (USE_MONGODB) {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

module.exports = {
  connectDatabase,
  disconnectDatabase,
  models: {
    User,
    Institution,
    LostItem,
    FoundItem,
    Match,
    Redemption
  },
  USE_MONGODB
};
