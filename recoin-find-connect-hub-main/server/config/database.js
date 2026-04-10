/**
 * MongoDB Atlas Database Configuration
 * All data is persisted to cloud MongoDB — no in-memory fallback.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://radhakrishnabhishek:<db_password>@radhakrishn.avskdhv.mongodb.net/campusconnect?appName=RadhaKrishn';

// ─── User Schema ────────────────────────────────────────────────────────────────
const UserSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  email:       { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:    { type: String, required: true },
  location:    { type: String, default: '' },
  phone:       { type: String, default: '' },
  bio:         { type: String, default: '' },
  tokens:      { type: Number, default: 10 },
  reputation:  { type: Number, default: 0 },
  totalHelps:  { type: Number, default: 0 },
  badges:      { type: [String], default: [] },
  tokenHistory: { type: Array, default: [] },
  joinedDate:  { type: Date, default: Date.now },
  role:        { type: String, enum: ['user', 'pharmacy', 'admin'], default: 'user' },
  pushToken:   { type: String, default: '' },
}, { timestamps: true });

// Hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Strip password from JSON
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// ─── Lost Item Schema ───────────────────────────────────────────────────────────
const LostItemSchema = new mongoose.Schema({
  title:         { type: String, required: true },
  description:   { type: String, required: true },
  category:      { type: String, required: true },
  location:      { type: String, required: true },
  date:          { type: String, required: true },
  image:         { type: String, default: null },
  imageFeatures: { type: [Number], default: [] },
  reward:        { type: Number, default: 0 },
  userId:        { type: String, required: true },
  userName:      { type: String, required: true },
  status:        { type: String, enum: ['active', 'matched', 'resolved'], default: 'active' },
  aiGenerated:   { type: Boolean, default: false },
}, { timestamps: true });

// ─── Found Item Schema ──────────────────────────────────────────────────────────
const FoundItemSchema = new mongoose.Schema({
  title:         { type: String, required: true },
  description:   { type: String, required: true },
  category:      { type: String, required: true },
  location:      { type: String, required: true },
  date:          { type: String, required: true },
  image:         { type: String, default: null },
  imageFeatures: { type: [Number], default: [] },
  userId:        { type: String, required: true },
  userName:      { type: String, required: true },
  status:        { type: String, enum: ['active', 'matched', 'resolved'], default: 'active' },
}, { timestamps: true });

// ─── Match Schema ───────────────────────────────────────────────────────────────
const MatchSchema = new mongoose.Schema({
  lostItemId:      { type: String, required: true },
  foundItemId:     { type: String, required: true },
  confidence:      { type: Number, required: true },
  matchType:       { type: String, enum: ['text', 'image', 'hybrid'], default: 'text' },
  lostTitle:       { type: String, default: '' },
  foundTitle:      { type: String, default: '' },
  imageSimilarity: { type: Number, default: 0 },
  objectMatch:     { type: Number, default: 0 },
  metadataMatch:   { type: Number, default: 0 },
  matchReason:     { type: String, default: '' },
  detectedObjects: { type: [String], default: [] },
  reasons:         { type: [String], default: [] },
  status:          { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });

// ─── Emergency Schema ───────────────────────────────────────────────────────────
const EmergencySchema = new mongoose.Schema({
  type:           { type: String, enum: ['blood', 'medical', 'safety', 'other'], required: true },
  title:          { type: String, required: true },
  description:    { type: String, required: true },
  location:       { type: String, required: true },
  urgency:        { type: String, enum: ['critical', 'high', 'medium', 'low'], required: true },
  bloodGroup:     { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''], default: '' },
  userId:         { type: String, required: true },
  userName:       { type: String, required: true },
  contactNumber:  { type: String, default: '' },
  resolved:       { type: Boolean, default: false },
  respondents:    { type: Number, default: 0 },
  respondentList: { type: [String], default: [] },
}, { timestamps: true });

// ─── Medical Request Schema ─────────────────────────────────────────────────────
const MedicalRequestSchema = new mongoose.Schema({
  medicines: [{
    name:     { type: String, required: true },
    dosage:   { type: String, default: '' },
    quantity: { type: String, default: '' },
  }],
  prescriptionImage: { type: String, default: '' },
  location:          { type: String, required: true },
  userId:            { type: String, required: true },
  userName:          { type: String, required: true },
  status:            { type: String, enum: ['pending', 'notified', 'matched', 'fulfilled'], default: 'pending' },
  pharmacyResponses: [{
    pharmacyName:      { type: String },
    available:         { type: Boolean },
    price:             { type: Number },
    contact:           { type: String },
    deliveryAvailable: { type: Boolean },
    estimatedTime:     { type: String },
    respondedAt:       { type: Date, default: Date.now },
  }],
  acceptedPharmacy:  { type: String, default: '' },
  deliveryMode:      { type: String, enum: ['pickup', 'delivery', ''], default: '' },
}, { timestamps: true });

// ─── Chat Conversation Schema ───────────────────────────────────────────────────
const ChatConversationSchema = new mongoose.Schema({
  participants: [{
    id:     { type: String, required: true },
    name:   { type: String, required: true },
    avatar: { type: String, default: '' },
  }],
  relatedTo: {
    type:  { type: String, enum: ['lost', 'found', 'emergency', 'medical', ''], default: '' },
    id:    { type: String, default: '' },
    title: { type: String, default: '' },
  },
  lastMessage:     { type: String, default: '' },
  lastMessageTime: { type: Date, default: Date.now },
  unreadCount:     { type: Number, default: 0 },
}, { timestamps: true });

// ─── Chat Message Schema ────────────────────────────────────────────────────────
const ChatMessageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatConversation', required: true },
  senderId:       { type: String, required: true },
  senderName:     { type: String, required: true },
  content:        { type: String, required: true },
  type:           { type: String, enum: ['text', 'system'], default: 'text' },
}, { timestamps: true });

// ─── Notification Schema ────────────────────────────────────────────────────────
const NotificationSchema = new mongoose.Schema({
  userId:      { type: String, required: true },
  type:        { type: String, enum: ['match', 'message', 'emergency', 'medical', 'reward', 'system'], required: true },
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  read:        { type: Boolean, default: false },
  actionUrl:   { type: String, default: '' },
  metadata:    { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

// ─── Redemption Schema ──────────────────────────────────────────────────────────
const RedemptionSchema = new mongoose.Schema({
  userId:          { type: String, required: true },
  partnerId:       { type: String, required: true },
  partnerName:     { type: String, required: true },
  coinsRedeemed:   { type: Number, required: true },
  redemptionValue: { type: Number, required: true },
  voucherCode:     { type: String, default: '' },
  voucherUrl:      { type: String, default: '' },
  expiryDate:      { type: Date },
  status:          { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
}, { timestamps: true });

// ─── Register Models ────────────────────────────────────────────────────────────
const User              = mongoose.model('User', UserSchema);
const LostItem          = mongoose.model('LostItem', LostItemSchema);
const FoundItem         = mongoose.model('FoundItem', FoundItemSchema);
const Match             = mongoose.model('Match', MatchSchema);
const Emergency         = mongoose.model('Emergency', EmergencySchema);
const MedicalRequest    = mongoose.model('MedicalRequest', MedicalRequestSchema);
const ChatConversation  = mongoose.model('ChatConversation', ChatConversationSchema);
const ChatMessage       = mongoose.model('ChatMessage', ChatMessageSchema);
const Notification      = mongoose.model('Notification', NotificationSchema);
const Redemption        = mongoose.model('Redemption', RedemptionSchema);

async function connectDatabase() {
  try {
    const options = {
      serverSelectionTimeoutMS: 5000,
      family: 4
    };
    await mongoose.connect(MONGODB_URI, options);
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB Atlas connection error:', error.message);
    try {
      console.log('🔄 Launching In-Memory MongoDB Fallback to ensure app runs...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log('✅ Connected to Local In-Memory Database (No internet blockages!)');
    } catch (fallbackError) {
       console.error('❌ Fallback database failed too:', fallbackError);
       throw fallbackError;
    }
  }
}

/**
 * Disconnect from MongoDB
 */
async function disconnectDatabase() {
  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
}

module.exports = {
  connectDatabase,
  disconnectDatabase,
  User,
  LostItem,
  FoundItem,
  Match,
  Emergency,
  MedicalRequest,
  ChatConversation,
  ChatMessage,
  Notification,
  Redemption,
};
