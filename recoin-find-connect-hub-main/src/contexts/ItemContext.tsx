import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { itemsApi, emergencyApi } from "@/services/api";
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
  deleteItem: (type: "lost" | "found", id: string) => Promise<void>;
  addEmergency: (e: any) => Promise<void>;
  respondToEmergency: (id: string, userId: string, userName: string) => Promise<any>;
  runAIMatch: () => Promise<AIMatch[]>;
  runAIMatchForItem: (lostItemId: string) => Promise<AIMatch[]>;
  loadEmergencies: () => Promise<void>;
}

const ItemContext = createContext<ItemContextType | undefined>(undefined);

export const useItems = () => {
  const ctx = useContext(ItemContext);
  if (!ctx) throw new Error("useItems must be used within ItemProvider");
  return ctx;
};

export const ItemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [matches, setMatches] = useState<AIMatch[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyRequest[]>([]);
  const [medicalRequests, setMedicalRequests] = useState<MedicalRequest[]>([]);

  useEffect(() => {
    loadData();
    loadEmergencies();
    loadMatches();
    const interval = setInterval(() => {
      loadData();
      loadEmergencies();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [lostResponse, foundResponse] = await Promise.all([
        itemsApi.getLost(),
        itemsApi.getFound(),
      ]);
      if (lostResponse?.success && lostResponse.items) setLostItems(lostResponse.items);
      if (foundResponse?.success && foundResponse.items) setFoundItems(foundResponse.items);
    } catch (error) {
      console.error("Failed to load items:", error);
    }
  };

  const loadMatches = async () => {
    try {
      const res = await itemsApi.getAllMatches();
      if (res?.success && res.matches) {
        setMatches(res.matches);
      }
    } catch (error) {
      console.error("Failed to load matches:", error);
    }
  };

  const loadEmergencies = async () => {
    try {
      const res = await emergencyApi.getAll();
      if (res?.success && res.emergencies) {
        setEmergencies(res.emergencies.map((e: any) => ({
          id: e._id || e.id,
          type: e.type,
          title: e.title,
          description: e.description,
          location: e.location,
          urgency: e.urgency,
          bloodGroup: e.bloodGroup || '',
          contactNumber: e.contactNumber || '',
          userId: e.userId,
          userName: e.userName,
          timestamp: e.createdAt || e.timestamp,
          status: e.resolved ? 'resolved' : 'active',
          resolved: e.resolved || false,
          respondents: e.respondents || 0,
          respondentList: e.respondentList || [],
          createdAt: e.createdAt,
        })));
      }
    } catch (error) {
      console.error("Failed to load emergencies:", error);
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
        await loadData();
      } else {
        throw new Error(response?.error || "Failed to create lost item");
      }
    } catch (error: any) {
      console.error("Error adding lost item:", error);
      throw new Error(error.message || "Failed to add lost item");
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
        await loadData();
      } else {
        throw new Error(response?.error || "Failed to create found item");
      }
    } catch (error: any) {
      console.error("Error adding found item:", error);
      throw new Error(error.message || "Failed to add found item");
    }
  };

  const resolveItem = async (type: "lost" | "found", id: string) => {
    try {
      const response = await itemsApi.resolveItem(type, id);
      if (response?.success) {
        await loadData();
      }
    } catch (error) {
      console.error("Error resolving item:", error);
    }
  };

  const deleteItem = async (type: "lost" | "found", id: string) => {
    try {
      const response = await itemsApi.deleteItem(type, id);
      if (response?.success) {
        await loadData();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const addEmergency = async (e: any) => {
    try {
      const response = await emergencyApi.create(e);
      if (response?.success) {
        await loadEmergencies();
      }
    } catch (error) {
      console.error("Error creating emergency:", error);
    }
  };

  const respondToEmergency = async (id: string, userId: string, userName: string) => {
    try {
      const response = await emergencyApi.respond(id, userId, userName);
      if (response?.success) {
        await loadEmergencies();
        return response;
      }
    } catch (error) {
      console.error("Error responding to emergency:", error);
    }
    return null;
  };

  /**
   * Run AI matching — batch match all active lost items vs found items.
   * Calls the backend API which uses Gemini for semantic matching.
   */
  const runAIMatch = async (): Promise<AIMatch[]> => {
    try {
      console.log('🤖 Running batch AI match via backend...');
      const response = await itemsApi.runBatchMatch();

      if (response?.success) {
        // Reload matches from DB
        await loadMatches();
        console.log(`✅ Batch match complete: ${response.totalMatches} matches`);
        return matches;
      }
    } catch (error) {
      console.error("Error in batch AI match:", error);
    }
    return [];
  };

  /**
   * Run AI match for a specific lost item.
   */
  const runAIMatchForItem = async (lostItemId: string): Promise<AIMatch[]> => {
    try {
      console.log(`🤖 Running AI match for item ${lostItemId}...`);
      const response = await itemsApi.runAIMatch(lostItemId);

      if (response?.success) {
        await loadMatches();
        return response.matches || [];
      }
    } catch (error) {
      console.error("Error in AI match for item:", error);
    }
    return [];
  };

  return (
    <ItemContext.Provider value={{
      lostItems, foundItems, matches, emergencies, medicalRequests,
      addLostItem, addFoundItem, resolveItem, deleteItem,
      addEmergency, respondToEmergency, runAIMatch, runAIMatchForItem, loadEmergencies,
    }}>
      {children}
    </ItemContext.Provider>
  );
};
