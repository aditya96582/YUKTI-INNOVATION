export interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  timestamp: string;
}

export interface TokenEntry {
  amount: number;
  reason: string;
  earnedAt: string;
  expiresAt: string;
}

export interface LostItem {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  image?: string;
  reward: number;
  userId: string;
  userName: string;
  status: 'active' | 'matched' | 'resolved';
  aiGenerated?: boolean;
  reviews?: Review[];
}

export interface FoundItem {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  image?: string;
  userId: string;
  userName: string;
  status: 'active' | 'matched' | 'resolved';
}

export interface EmergencyRequest {
  id: string;
  type: 'blood' | 'sos' | 'accident';
  title: string;
  description: string;
  location: string;
  urgency: 'low' | 'medium' | 'critical';
  bloodType?: string;
  userId: string;
  userName: string;
  timestamp: string;
  status: 'active' | 'responded' | 'resolved';
  responders: number;
}

export interface PharmacyResponse {
  pharmacyName: string;
  available: boolean;
  price?: number;
  contact?: string;
  deliveryAvailable?: boolean;
  estimatedTime?: string;
  respondedAt?: string;
}

export interface MedicalRequest {
  id: string;
  medicines: { name: string; dosage: string; quantity: string }[];
  prescriptionImage?: string;
  location: string;
  userId: string;
  userName: string;
  timestamp: string;
  status: 'pending' | 'notified' | 'matched' | 'fulfilled';
  pharmacyResponses: PharmacyResponse[];
  acceptedPharmacy?: string;
  deliveryMode?: 'pickup' | 'delivery';
}

export interface AIMatch {
  id: string;
  lostItemId: string;
  foundItemId: string;
  confidence: number;
  matchType: 'text' | 'image' | 'hybrid';
  lostTitle: string;
  foundTitle: string;
  reasons: string[];
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'system';
}

export interface ChatConversation {
  id: string;
  participants: { id: string; name: string; avatar?: string }[];
  messages: ChatMessage[];
  relatedTo?: { type: 'lost' | 'found' | 'emergency' | 'medical'; id: string; title: string };
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

export interface Notification {
  id: string;
  type: 'match' | 'message' | 'emergency' | 'medical' | 'reward' | 'system';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  location: string;
  tokens: number;
  reputation: number;
  totalHelps: number;
  badges: string[];
  joinedDate: string;
  tokenHistory?: TokenEntry[];
  bio?: string;
  phone?: string;
}

export const categories = [
  'Electronics', 'Documents', 'Accessories', 'Bags', 'Keys', 'Clothing', 'Books', 'Other'
];

export const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const demoUser: UserProfile = {
  id: 'user1',
  name: 'Aditya Kumar',
  email: 'aditya@campus.edu',
  location: 'Delhi University, North Campus',
  tokens: 85,
  reputation: 4.7,
  totalHelps: 12,
  badges: ['Top Helper', 'Quick Responder'],
  joinedDate: '2025-01-15',
};

export const mockLostItems: LostItem[] = [
  {
    id: 'l1', title: 'MacBook Pro 14"', description: 'Space gray MacBook Pro with stickers on the back. Has a blue laptop sleeve.',
    category: 'Electronics', location: 'Central Library, 2nd Floor', date: '2026-04-06',
    reward: 50, userId: 'user2', userName: 'Priya Sharma', status: 'active',
  },
  {
    id: 'l2', title: 'Gold Ring with Diamond', description: 'Small gold ring with a single diamond. Family heirloom, very sentimental.',
    category: 'Accessories', location: 'Sports Complex', date: '2026-04-07',
    reward: 100, userId: 'user3', userName: 'Rahul Verma', status: 'active',
  },
  {
    id: 'l3', title: 'Black Backpack Nike', description: 'Black Nike backpack with a red swoosh. Contains textbooks and a calculator.',
    category: 'Bags', location: 'Cafeteria Block A', date: '2026-04-05',
    reward: 20, userId: 'user4', userName: 'Sneha Patel', status: 'active', aiGenerated: true,
  },
  {
    id: 'l4', title: 'Samsung Galaxy S24', description: 'Purple Samsung Galaxy S24 with a clear case. Lock screen has a dog photo.',
    category: 'Electronics', location: 'Auditorium', date: '2026-04-07',
    reward: 40, userId: 'user5', userName: 'Arjun Singh', status: 'matched',
  },
];

export const mockFoundItems: FoundItem[] = [
  {
    id: 'f1', title: 'Laptop found near library', description: 'Found a gray laptop in a blue sleeve near the library entrance.',
    category: 'Electronics', location: 'Central Library Entrance', date: '2026-04-07',
    userId: 'user6', userName: 'Meera Joshi', status: 'active',
  },
  {
    id: 'f2', title: 'Gold jewelry found', description: 'Small gold ring found near the running track area.',
    category: 'Accessories', location: 'Sports Complex Track', date: '2026-04-07',
    userId: 'user7', userName: 'Karan Mehta', status: 'active',
  },
  {
    id: 'f3', title: 'Phone found in auditorium', description: 'Samsung phone with purple case found under seat C12.',
    category: 'Electronics', location: 'Main Auditorium', date: '2026-04-07',
    userId: 'user1', userName: 'Aditya Kumar', status: 'matched',
  },
];

export const mockMatches: AIMatch[] = [
  {
    id: 'm1', lostItemId: 'l1', foundItemId: 'f1', confidence: 92,
    matchType: 'hybrid', lostTitle: 'MacBook Pro 14"', foundTitle: 'Laptop found near library',
    reasons: ['Same category: Electronics', 'Location proximity: 50m', 'Description match: gray laptop, blue sleeve'],
    timestamp: '2026-04-07T14:30:00',
  },
  {
    id: 'm2', lostItemId: 'l2', foundItemId: 'f2', confidence: 88,
    matchType: 'text', lostTitle: 'Gold Ring with Diamond', foundTitle: 'Gold jewelry found',
    reasons: ['Same category: Accessories', 'Keyword match: gold ring', 'Location proximity: 100m'],
    timestamp: '2026-04-07T15:00:00',
  },
  {
    id: 'm3', lostItemId: 'l4', foundItemId: 'f3', confidence: 95,
    matchType: 'hybrid', lostTitle: 'Samsung Galaxy S24', foundTitle: 'Phone found in auditorium',
    reasons: ['Same category: Electronics', 'Exact location match', 'Brand match: Samsung', 'Color match: purple'],
    timestamp: '2026-04-07T16:00:00',
  },
];

export const mockEmergencies: EmergencyRequest[] = [
  {
    id: 'e1', type: 'blood', title: 'Urgent: B+ Blood Needed',
    description: 'Patient needs 2 units of B+ blood for emergency surgery at AIIMS.',
    location: 'AIIMS Hospital, Gate 2', urgency: 'critical', bloodType: 'B+',
    userId: 'user8', userName: 'Dr. Ananya Roy', timestamp: '2026-04-08T08:00:00',
    status: 'active', responders: 3,
  },
  {
    id: 'e2', type: 'sos', title: 'SOS: Student Collapsed',
    description: 'A student collapsed near the engineering block. Need immediate medical assistance.',
    location: 'Engineering Block, Ground Floor', urgency: 'critical',
    userId: 'user9', userName: 'Security Guard', timestamp: '2026-04-08T09:30:00',
    status: 'active', responders: 5,
  },
  {
    id: 'e3', type: 'accident', title: 'Minor Road Accident',
    description: 'Two-wheeler accident near campus gate. Rider has minor injuries.',
    location: 'Main Gate, Ring Road', urgency: 'medium',
    userId: 'user10', userName: 'Vikram Raj', timestamp: '2026-04-08T07:15:00',
    status: 'responded', responders: 2,
  },
];

export const mockMedicalRequests: MedicalRequest[] = [
  {
    id: 'med1',
    medicines: [
      { name: 'Paracetamol 500mg', dosage: 'Twice daily', quantity: '10 tablets' },
      { name: 'Amoxicillin 250mg', dosage: 'Thrice daily', quantity: '15 capsules' },
    ],
    location: 'Hostel Block D', userId: 'user11', userName: 'Ravi Gupta',
    timestamp: '2026-04-08T10:00:00', status: 'matched',
    pharmacyResponses: [
      { pharmacyName: 'Campus Pharmacy', available: true, price: 120, contact: '+91-9876543210', deliveryAvailable: true, estimatedTime: '30 min', respondedAt: '2026-04-08T10:10:00' },
      { pharmacyName: 'Jan Aushadhi Kendra', available: true, price: 45, contact: '+91-9123456789', deliveryAvailable: false, estimatedTime: '15 min (pickup)', respondedAt: '2026-04-08T10:12:00' },
    ],
  },
  {
    id: 'med2',
    medicines: [
      { name: 'Insulin Glargine', dosage: 'Once daily', quantity: '1 vial' },
    ],
    location: 'Faculty Quarters', userId: 'user12', userName: 'Prof. Das',
    timestamp: '2026-04-08T06:00:00', status: 'notified',
    pharmacyResponses: [],
  },
];

export const mockConversations: ChatConversation[] = [
  {
    id: 'c1',
    participants: [
      { id: 'user1', name: 'Aditya Kumar' },
      { id: 'user2', name: 'Priya Sharma' },
    ],
    messages: [
      { id: 'msg1', senderId: 'user2', senderName: 'Priya Sharma', content: 'Hi! I think you found my MacBook?', timestamp: '2026-04-07T14:35:00', type: 'text' },
      { id: 'msg2', senderId: 'user1', senderName: 'Aditya Kumar', content: 'Yes! I found a gray MacBook near the library. Can you describe it?', timestamp: '2026-04-07T14:36:00', type: 'text' },
      { id: 'msg3', senderId: 'user2', senderName: 'Priya Sharma', content: 'It has 3 stickers on the back - a Python logo, a React logo, and a cat sticker!', timestamp: '2026-04-07T14:37:00', type: 'text' },
    ],
    relatedTo: { type: 'lost', id: 'l1', title: 'MacBook Pro 14"' },
    lastMessage: 'It has 3 stickers on the back...',
    lastMessageTime: '2026-04-07T14:37:00',
    unreadCount: 1,
  },
];

export const mockNotifications: Notification[] = [
  { id: 'n1', type: 'match', title: '🔥 Possible Match Found!', description: 'AI found a 92% match for "MacBook Pro 14"', timestamp: '2026-04-07T14:30:00', read: false, actionUrl: '/matches' },
  { id: 'n2', type: 'emergency', title: '🚨 Blood Emergency Nearby', description: 'B+ blood urgently needed at AIIMS Hospital', timestamp: '2026-04-08T08:00:00', read: false, actionUrl: '/emergency' },
  { id: 'n3', type: 'medical', title: '💊 Medicine Available', description: 'Jan Aushadhi Kendra has your prescribed medicines', timestamp: '2026-04-08T10:05:00', read: false, actionUrl: '/medical' },
  { id: 'n4', type: 'reward', title: '🎉 +10 Tokens Earned!', description: 'You helped return a lost phone', timestamp: '2026-04-07T16:30:00', read: true },
  { id: 'n5', type: 'message', title: '💬 New Message', description: 'Priya Sharma sent you a message', timestamp: '2026-04-07T14:37:00', read: true, actionUrl: '/chat' },
];

export const badges = [
  { name: 'Top Helper', icon: '🏆', description: 'Helped 10+ people' },
  { name: 'Life Saver', icon: '❤️', description: 'Responded to 5+ emergencies' },
  { name: 'Quick Responder', icon: '⚡', description: 'Average response time under 5 min' },
  { name: 'Trusted Pharmacy', icon: '💊', description: 'Fulfilled 20+ medicine requests' },
  { name: 'Community Star', icon: '⭐', description: 'Reputation score above 4.5' },
];
