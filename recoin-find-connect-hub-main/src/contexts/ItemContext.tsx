import React, { createContext, useContext, useState, useEffect } from "react";
import { itemsApi } from "@/services/api";
import { LostItem, FoundItem, AIMatch, EmergencyRequest, MedicalRequest } from "@/data/mockData";

interface ItemContextType {
  lostItems: LostItem[];
  foundItems: FoundItem[];
  matches: AIMatch[];
  emergencies: EmergencyRequest[];
  medicalRequests: MedicalRequest[];
  addLostItem: (item: Omit<LostItem, "id" | "status">) => Promise<void>;
  addFoundItem: (item: Omit<FoundItem, "id" | "status">) => Promise<void>;
  resolveItem: (type: "lost" | "found", id: string) => Promise<void>;
  addEmergency: (e: Omit<EmergencyRequest, "id" | "status" | "responders">) => Promise<void>;
  respondToEmergency: (id: string) => Promise<void>;
  addMedicalRequest: (m: Omit<MedicalRequest, "id" | "status" | "pharmacyResponses">) => Promise<void>;
  respondToMedical: (id: string, pharmacyName: string, available: boolean, price?: number) => Promise<void>;
  runAIMatch: () => AIMatch[];
}

const ItemContext = createContext<ItemContextType | undefined>(undefined);

export const useItems = () => {
  const ctx = useContext(ItemContext);
  if (!ctx) throw new Error("useItems must be used within ItemProvider");
  return ctx;
};

function calculateMatch(lost: LostItem, found: FoundItem): number {
  let score = 0;
  if (lost.category === found.category) score += 30;
  const lWords = lost.description.toLowerCase().split(/\s+/);
  const fWords = found.description.toLowerCase().split(/\s+/);
  const common = lWords.filter(w => w.length > 3 && fWords.includes(w)).length;
  score += Math.min(40, common * 10);
  if (lost.location.split(",")[0] === found.location.split(",")[0]) score += 20;
  const dayDiff = Math.abs(new Date(lost.date).getTime() - new Date(found.date).getTime()) / 86400000;
  if (dayDiff <= 1) score += 10;
  else if (dayDiff <= 3) score += 5;
  return Math.min(98, score);
}

export const ItemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [matches, setMatches] = useState<AIMatch[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyRequest[]>([]);
  const [medicalRequests, setMedicalRequests] = useState<MedicalRequest[]>([]);

  // Load initial data from backend
  useEffect(() => {
    loadData();
    // Poll for updates every 5 seconds
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [lostResponse, foundResponse] = await Promise.all([
        itemsApi.getLost(),
        itemsApi.getFound(),
      ]);

      if (lostResponse?.success && lostResponse.items) {
        setLostItems(lostResponse.items);
      }

      if (foundResponse?.success && foundResponse.items) {
        setFoundItems(foundResponse.items);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const addLostItem = async (item: Omit<LostItem, "id" | "status">) => {
    try {
      const response = await itemsApi.createLost({
        title: item.title,
        description: item.description,
        category: item.category,
        location: item.location,
        date: item.date,
        image: item.image,
        reward: item.reward,
        userId: item.userId,
        userName: item.userName,
        aiGenerated: item.aiGenerated || false,
      });

      if (response?.success) {
        // Reload data from backend to get the new item
        await loadData();
      } else {
        throw new Error(response?.error || 'Failed to create lost item');
      }
    } catch (error: any) {
      console.error('Error adding lost item:', error);
      throw new Error(error.message || 'Failed to add lost item');
    }
  };

  const addFoundItem = async (item: Omit<FoundItem, "id" | "status">) => {
    try {
      const response = await itemsApi.createFound({
        title: item.title,
        description: item.description,
        category: item.category,
        location: item.location,
        date: item.date,
        image: item.image,
        userId: item.userId,
        userName: item.userName,
      });

      if (response?.success) {
        // Reload data from backend to get the new item
        await loadData();
      } else {
        throw new Error(response?.error || 'Failed to create found item');
      }
    } catch (error: any) {
      console.error('Error adding found item:', error);
      throw new Error(error.message || 'Failed to add found item');
    }
  };

  const resolveItem = async (type: "lost" | "found", id: string) => {
    // Update local state
    if (type === 'lost') {
      setLostItems(prev => prev.map(item => 
        item.id === id ? { ...item, status: 'resolved' as const } : item
      ));
    } else {
      setFoundItems(prev => prev.map(item => 
        item.id === id ? { ...item, status: 'resolved' as const } : item
      ));
    }
  };

  const addEmergency = async (e: Omit<EmergencyRequest, "id" | "status" | "responders">) => {
    const newEmergency: EmergencyRequest = {
      id: `emg_${Date.now()}`,
      ...e,
      status: 'active',
      responders: 0,
    };
    setEmergencies(prev => [newEmergency, ...prev]);
  };

  const respondToEmergency = async (id: string) => {
    setEmergencies(prev => prev.map(e => 
      e.id === id ? { ...e, responders: e.responders + 1, status: 'responded' as const } : e
    ));
  };

  const addMedicalRequest = async (m: Omit<MedicalRequest, "id" | "status" | "pharmacyResponses">) => {
    const newRequest: MedicalRequest = {
      id: `med_${Date.now()}`,
      ...m,
      status: 'pending',
      pharmacyResponses: [],
    };
    setMedicalRequests(prev => [newRequest, ...prev]);
  };

  const respondToMedical = async (id: string, pharmacyName: string, available: boolean, price?: number) => {
    setMedicalRequests(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status: 'matched' as const,
          pharmacyResponses: [
            ...req.pharmacyResponses,
            {
              pharmacyName,
              available,
              price: price || 0,
              contact: '+91-9876543210',
              deliveryAvailable: true,
              estimatedTime: '30 min',
              respondedAt: new Date().toISOString(),
            }
          ]
        };
      }
      return req;
    }));
  };

  const runAIMatch = (): AIMatch[] => {
    const newMatches: AIMatch[] = [];
    for (const lost of lostItems.filter(i => i.status === "active")) {
      for (const found of foundItems.filter(i => i.status === "active")) {
        const confidence = calculateMatch(lost, found);
        if (confidence >= 60) {
          const matchType = confidence >= 90 ? "hybrid" : confidence >= 75 ? "image" : "text";
          const match: AIMatch = {
            id: `m_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            lostItemId: lost.id,
            foundItemId: found.id,
            confidence,
            matchType: matchType as "text" | "image" | "hybrid",
            lostTitle: lost.title,
            foundTitle: found.title,
            reasons: [
              lost.category === found.category ? `Same category: ${lost.category}` : "",
              `Confidence score: ${confidence}%`,
              "AI keyword analysis match",
            ].filter(Boolean),
            timestamp: new Date().toISOString(),
          };
          newMatches.push(match);
        }
      }
    }
    if (newMatches.length > 0) {
      setMatches(prev => [...newMatches, ...prev]);
      // Call backend AI match API
      itemsApi.runAIMatch(lostItems[0]?.id).catch(console.error);
    }
    return newMatches;
  };

  return (
    <ItemContext.Provider value={{
      lostItems, foundItems, matches, emergencies, medicalRequests,
      addLostItem, addFoundItem, resolveItem,
      addEmergency, respondToEmergency,
      addMedicalRequest, respondToMedical, runAIMatch,
    }}>
      {children}
    </ItemContext.Provider>
  );
};
