const BASE = 'http://localhost:5000/api';

async function apiFetch(path: string, options?: RequestInit) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
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

// Medical API
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

// Items API
export const itemsApi = {
  getLost: () => apiFetch('/items/lost'),
  getFound: () => apiFetch('/items/found'),
  createLost: (data: any) =>
    apiFetch('/items/lost', { method: 'POST', body: JSON.stringify(data) }),
  createFound: (data: any) =>
    apiFetch('/items/found', { method: 'POST', body: JSON.stringify(data) }),
  runAIMatch: (lostItemId: string, foundItemIds?: string[]) =>
    apiFetch('/items/match/ai', { method: 'POST', body: JSON.stringify({ lostItemId, foundItemIds }) }),
  runBatchMatch: () =>
    apiFetch('/items/match/batch', { method: 'POST' }),
  getMatches: (itemId: string) =>
    apiFetch(`/items/matches/${itemId}`),
};

// Redemption API
export const redemptionApi = {
  getPartners: () => apiFetch('/redemption/partners'),
  redeem: (userId: string, partnerId: string, coins: number) =>
    apiFetch('/redemption/redeem', { method: 'POST', body: JSON.stringify({ userId, partnerId, coins }) }),
  getHistory: (userId: string) =>
    apiFetch(`/redemption/history/${userId}`),
};

// Pharmacy API
export const pharmacyApi = {
  getAll: () => apiFetch('/pharmacies'),
};

// Image Generation API — calls Supabase Edge Function which uses Gemini API
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const imageApi = {
  generate: async (title: string, description: string, category: string): Promise<string | null> => {
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'apikey': SUPABASE_KEY,
        },
        body: JSON.stringify({ title, description, category }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data?.imageUrl ?? null;
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
            { inline_data: { mime_type: 'image/jpeg', data: base64 } }
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
