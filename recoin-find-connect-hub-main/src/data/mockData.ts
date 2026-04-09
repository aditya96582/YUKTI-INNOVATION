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
  type: 'blood' | 'medical' | 'safety' | 'other';
  title: string;
  description: string;
  location: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  bloodGroup?: string;
  contactNumber?: string;
  userId: string;
  userName: string;
  timestamp: string;
  createdAt?: string;
  status: 'active' | 'responded' | 'resolved';
  resolved: boolean;
  respondents: number;
  respondentList?: string[];
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

// Mock data is no longer used for initialization — all data comes from MongoDB.
// These are kept only for type definitions and reference.

export const mockLostItems: LostItem[] = [];
export const mockFoundItems: FoundItem[] = [];
export const mockMatches: AIMatch[] = [];
export const mockEmergencies: EmergencyRequest[] = [];
export const mockMedicalRequests: MedicalRequest[] = [];
export const mockConversations: ChatConversation[] = [];
export const mockNotifications: Notification[] = [];

export const badges = [
  { name: 'Top Helper', icon: '🏆', description: 'Helped 10+ people' },
  { name: 'Life Saver', icon: '❤️', description: 'Responded to 5+ emergencies' },
  { name: 'Quick Responder', icon: '⚡', description: 'Average response time under 5 min' },
  { name: 'Trusted Pharmacy', icon: '💊', description: 'Fulfilled 20+ medicine requests' },
  { name: 'Community Star', icon: '⭐', description: 'Reputation score above 4.5' },
];
