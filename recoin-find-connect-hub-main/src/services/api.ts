const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Get stored JWT token
 */
function getToken(): string | null {
  return localStorage.getItem('cc_token');
}

/**
 * Core fetch wrapper with JWT auth headers
 */
async function apiFetch(path: string, options?: RequestInit) {
  try {
    const token = getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${path}`, {
      headers,
      ...options,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Request failed' }));
      console.error(`API Error [${res.status}]:`, errorData);
      throw new Error(errorData.error || `Request failed with status ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error('API Fetch Error:', error);
    throw error;
  }
}

// ─── Auth API ───────────────────────────────────────────────────────────────────
export const authApi = {
  signup: (name: string, email: string, password: string) =>
    apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password }) }),

  login: (email: string, password: string) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  getMe: () => apiFetch('/auth/me'),

  updateProfile: (data: Record<string, any>) =>
    apiFetch('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  searchUsers: (q: string) => apiFetch(`/auth/users/search?q=${encodeURIComponent(q)}`),
};

// ─── Medical API ────────────────────────────────────────────────────────────────
export const medicalApi = {
  getAll: () => apiFetch('/medical'),
  create: (data: { medicines: any[]; location: string; userId: string; userName: string }) =>
    apiFetch('/medical', { method: 'POST', body: JSON.stringify(data) }),
  extractOCR: (imageBase64: string) =>
    apiFetch('/medical/ocr/extract', { method: 'POST', body: JSON.stringify({ imageBase64 }) }),
  notify: (id: string) =>
    apiFetch(`/medical/${id}/notify`, { method: 'POST' }),
  respond: (id: string, data: object) =>
    apiFetch(`/medical/${id}/respond`, { method: 'POST', body: JSON.stringify(data) }),
  accept: (id: string, pharmacyName: string, deliveryMode: 'pickup' | 'delivery') =>
    apiFetch(`/medical/${id}/accept`, { method: 'POST', body: JSON.stringify({ pharmacyName, deliveryMode }) }),
  fulfill: (id: string) =>
    apiFetch(`/medical/${id}/fulfill`, { method: 'POST' }),
  getAlternatives: (name: string) =>
    apiFetch(`/medical/alternatives/${encodeURIComponent(name)}`),
};

// ─── Items API ──────────────────────────────────────────────────────────────────
export const itemsApi = {
  getLost: () => apiFetch('/items/lost'),
  getFound: () => apiFetch('/items/found'),
  createLost: (data: any) =>
    apiFetch('/items/lost', { method: 'POST', body: JSON.stringify(data) }),
  createFound: (data: any) =>
    apiFetch('/items/found', { method: 'POST', body: JSON.stringify(data) }),
  updateItem: (type: string, id: string, data: any) =>
    apiFetch(`/items/${type}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  resolveItem: (type: string, id: string) =>
    apiFetch(`/items/${type}/${id}/resolve`, { method: 'PUT' }),
  deleteItem: (type: string, id: string) =>
    apiFetch(`/items/${type}/${id}`, { method: 'DELETE' }),
  runAIMatch: (lostItemId: string, foundItemIds?: string[]) =>
    apiFetch('/items/match/ai', { method: 'POST', body: JSON.stringify({ lostItemId, foundItemIds }) }),
  runBatchMatch: () =>
    apiFetch('/items/match/batch', { method: 'POST' }),
  getAllMatches: () =>
    apiFetch('/items/matches'),
  getMatches: (itemId: string) =>
    apiFetch(`/items/matches/${itemId}`),
};


// ─── Emergency API ──────────────────────────────────────────────────────────────
export const emergencyApi = {
  getAll: () => apiFetch('/emergencies'),
  create: (data: any) =>
    apiFetch('/emergencies', { method: 'POST', body: JSON.stringify(data) }),
  respond: (id: string, userId: string, userName: string) =>
    apiFetch(`/emergencies/${id}/respond`, { method: 'PUT', body: JSON.stringify({ userId, userName }) }),
  resolve: (id: string) =>
    apiFetch(`/emergencies/${id}/resolve`, { method: 'PUT' }),
};

// ─── Chat API ───────────────────────────────────────────────────────────────────
export const chatApi = {
  getConversations: (userId: string) => apiFetch(`/chat/conversations/${userId}`),
  createConversation: (participants: any[], relatedTo?: any) =>
    apiFetch('/chat/conversations', { method: 'POST', body: JSON.stringify({ participants, relatedTo }) }),
  sendMessage: (conversationId: string, senderId: string, senderName: string, content: string) =>
    apiFetch(`/chat/conversations/${conversationId}/messages`, { method: 'POST', body: JSON.stringify({ senderId, senderName, content }) }),
  addMember: (conversationId: string, participant: { id: string; name: string }) =>
    apiFetch(`/chat/conversations/${conversationId}/members`, { method: 'POST', body: JSON.stringify({ participant }) }),
};

// ─── Redemption API ─────────────────────────────────────────────────────────────
export const redemptionApi = {
  getPartners: () => apiFetch('/redemption/partners'),
  redeem: (userId: string, partnerId: string, coins: number) =>
    apiFetch('/redemption/redeem', { method: 'POST', body: JSON.stringify({ userId, partnerId, coins }) }),
  getHistory: (userId: string) =>
    apiFetch(`/redemption/history/${userId}`),
};

// ─── Pharmacy API ───────────────────────────────────────────────────────────────
export const pharmacyApi = {
  getAll: () => apiFetch('/pharmacies'),
};

// ─── Image API — calls backend directly ─────────────────────────────────────────
export const imageApi = {
  generate: async (title: string, description: string, category: string): Promise<string | null> => {
    try {
      const res = await apiFetch('/images/generate', {
        method: 'POST',
        body: JSON.stringify({ title, description, category }),
      });
      return res?.image ?? null;
    } catch {
      return null;
    }
  },
  analyze: async (imageBase64: string) => {
    try {
      const GEMINI_API_KEY = 'AIzaSyBu3VMrOzUvkzy2dviMTe9LzNBw9iUhenc';
      const base64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [
            { text: 'Analyze this image and describe the item. Include type, color, brand if visible, and distinctive features. Be concise.' },
            { inline_data: { mime_type: 'image/jpeg', data: base64 } },
          ]}],
        }),
      });
      if (!res.ok) return { success: false };
      const data = await res.json();
      return { success: true, description: data.candidates?.[0]?.content?.parts?.[0]?.text || '' };
    } catch {
      return { success: false };
    }
  },
};

// Named exports for backward compatibility
export const createMedicalRequest = medicalApi.create;
export const extractMedicines = (id: string) => apiFetch(`/medical/ocr/extract`, { method: 'POST', body: JSON.stringify({ requestId: id }) });
export const notifyPharmacies = medicalApi.notify;
export const getPharmacyResponses = (id: string) => apiFetch(`/medical/${id}`);
export const acceptPharmacy = medicalApi.accept;
export const fulfillRequest = medicalApi.fulfill;
export const getAlternatives = medicalApi.getAlternatives;
