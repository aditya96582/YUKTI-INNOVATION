/**
 * In-Memory Database
 * Simple JSON-based database for development
 * Replace with MongoDB in production
 */

const db = {
  users: [],
  lostItems: [],
  foundItems: [],
  matches: [],
  emergencies: [],
  medicalRequests: [],
  notifications: [],
  conversations: [],
  redemptions: []
};

// Initialize with some mock data
function initializeMockData() {
  // Mock users
  db.users = [
    {
      id: 'user_1',
      name: 'Arjun Mehta',
      email: 'arjun.mehta@iitd.ac.in',
      location: 'IIT Delhi, Hauz Khas',
      tokens: 340,
      reputation: 87,
      totalHelps: 23,
      badges: ['Top Helper', 'Early Adopter'],
      createdAt: new Date().toISOString()
    }
  ];

  // Mock lost items
  db.lostItems = [
    {
      id: 'lost_1',
      title: 'Black Nike Backpack',
      description: 'Large black backpack with Nike logo, contains laptop',
      category: 'bags',
      location: 'Library, 2nd Floor',
      date: '2026-04-08',
      reward: 50,
      userId: 'user_1',
      userName: 'Arjun Mehta',
      status: 'active',
      image: null
    }
  ];

  // Mock found items
  db.foundItems = [
    {
      id: 'found_1',
      title: 'Blue Water Bottle',
      description: 'Stainless steel water bottle, blue color',
      category: 'other',
      location: 'Cafeteria',
      date: '2026-04-08',
      userId: 'user_1',
      userName: 'Arjun Mehta',
      status: 'active',
      image: null
    }
  ];

  // Mock emergencies
  db.emergencies = [
    {
      id: 'emg_1',
      type: 'blood',
      title: 'Urgent: B+ Blood Needed',
      description: 'Patient needs B+ blood urgently at AIIMS',
      location: 'AIIMS Hospital',
      bloodGroup: 'B+',
      urgency: 'critical',
      userId: 'user_1',
      userName: 'Arjun Mehta',
      status: 'active',
      respondents: [],
      createdAt: new Date().toISOString()
    }
  ];

  // Mock medical requests
  db.medicalRequests = [
    {
      id: 'med_1',
      medicines: [
        { name: 'Paracetamol 500mg', dosage: 'Twice daily', quantity: '10 tablets' }
      ],
      location: 'IIT Delhi Campus',
      userId: 'user_1',
      userName: 'Arjun Mehta',
      status: 'pending',
      pharmacyResponses: [],
      createdAt: new Date().toISOString()
    }
  ];
}

// Initialize on first load
initializeMockData();

module.exports = { db };
