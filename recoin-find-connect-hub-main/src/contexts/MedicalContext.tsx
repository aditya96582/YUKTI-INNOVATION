import React, { createContext, useContext, useState, useEffect } from "react";
import { medicalApi } from "@/services/api";
import { MedicalRequest, PharmacyResponse } from "@/data/mockData";

const NEARBY_PHARMACIES = [
  { name: "Jan Aushadhi Kendra", contact: "+91-9123456789", deliveryAvailable: false, estimatedTime: "15 min (pickup)" },
  { name: "Campus Pharmacy", contact: "+91-9876543210", deliveryAvailable: true, estimatedTime: "30 min" },
  { name: "MedPlus Nearby", contact: "+91-9988776655", deliveryAvailable: true, estimatedTime: "45 min" },
  { name: "Apollo Pharmacy", contact: "+91-9001122334", deliveryAvailable: true, estimatedTime: "25 min" },
];

interface MedicalContextType {
  medicalRequests: MedicalRequest[];
  addMedicalRequest: (m: Omit<MedicalRequest, "id" | "status" | "pharmacyResponses">) => Promise<void>;
  notifyPharmacies: (id: string) => Promise<void>;
  pharmacyRespond: (id: string, pharmacyName: string, price: number) => Promise<void>;
  acceptPharmacy: (id: string, pharmacyName: string, mode: "pickup" | "delivery") => Promise<void>;
  fulfillRequest: (id: string) => Promise<void>;
}

const MedicalContext = createContext<MedicalContextType | undefined>(undefined);

export const useMedical = () => {
  const ctx = useContext(MedicalContext);
  if (!ctx) throw new Error("useMedical must be used within MedicalProvider");
  return ctx;
};

export const MedicalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [medicalRequests, setMedicalRequests] = useState<MedicalRequest[]>([]);

  useEffect(() => {
    loadRequests();
    // Poll for updates every 5 seconds
    const interval = setInterval(loadRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadRequests = async () => {
    try {
      const response = await medicalApi.getAll();
      if (response?.success && response.requests) {
        setMedicalRequests(response.requests);
      }
    } catch (error) {
      console.error('Failed to load medical requests:', error);
    }
  };

  const addMedicalRequest = async (m: Omit<MedicalRequest, "id" | "status" | "pharmacyResponses">) => {
    try {
      const response = await medicalApi.create({
        medicines: m.medicines,
        location: m.location,
        userId: m.userId,
        userName: m.userName,
      });

      if (response?.success) {
        const newRequest: MedicalRequest = {
          id: response.id,
          ...m,
          status: 'pending',
          pharmacyResponses: [],
        };
        setMedicalRequests(prev => [newRequest, ...prev]);
      } else {
        throw new Error('Failed to create medical request');
      }
    } catch (error: any) {
      console.error('Error adding medical request:', error);
      throw new Error(error.message || 'Failed to add medical request');
    }
  };

  const notifyPharmacies = async (id: string) => {
    try {
      await medicalApi.notify(id);
      
      setMedicalRequests(prev => prev.map(req => 
        req.id === id ? { ...req, status: 'notified' as const } : req
      ));

      // Simulate pharmacy responses after 2.5 seconds
      setTimeout(() => {
        const req = medicalRequests.find(m => m.id === id);
        if (!req) return;
        
        const responses: PharmacyResponse[] = NEARBY_PHARMACIES.slice(0, 2).map(p => ({
          pharmacyName: p.name,
          available: true,
          price: Math.floor(Math.random() * 150) + 30,
          contact: p.contact,
          deliveryAvailable: p.deliveryAvailable,
          estimatedTime: p.estimatedTime,
          respondedAt: new Date().toISOString(),
        }));

        setMedicalRequests(prev => prev.map(req => 
          req.id === id ? { ...req, status: 'matched' as const, pharmacyResponses: responses } : req
        ));
      }, 2500);
    } catch (error) {
      console.error('Error notifying pharmacies:', error);
    }
  };

  const pharmacyRespond = async (id: string, pharmacyName: string, price: number) => {
    try {
      await medicalApi.respond(id, { pharmacyName, available: true, price });

      const req = medicalRequests.find(m => m.id === id);
      if (!req) return;
      
      const pharmacy = NEARBY_PHARMACIES.find(p => p.name === pharmacyName) || NEARBY_PHARMACIES[0];
      const response: PharmacyResponse = {
        pharmacyName,
        available: true,
        price,
        contact: pharmacy.contact,
        deliveryAvailable: pharmacy.deliveryAvailable,
        estimatedTime: pharmacy.estimatedTime,
        respondedAt: new Date().toISOString(),
      };

      setMedicalRequests(prev => prev.map(req => {
        if (req.id === id) {
          const responses = [...req.pharmacyResponses.filter(r => r.pharmacyName !== pharmacyName), response];
          return { ...req, status: 'matched' as const, pharmacyResponses: responses };
        }
        return req;
      }));
    } catch (error) {
      console.error('Error responding to medical request:', error);
    }
  };

  const acceptPharmacy = async (id: string, pharmacyName: string, mode: "pickup" | "delivery") => {
    try {
      await medicalApi.accept(id, pharmacyName, mode);
      
      setMedicalRequests(prev => prev.map(req => 
        req.id === id ? { ...req, acceptedPharmacy: pharmacyName, deliveryMode: mode } : req
      ));
    } catch (error) {
      console.error('Error accepting pharmacy:', error);
    }
  };

  const fulfillRequest = async (id: string) => {
    try {
      await medicalApi.fulfill(id);
      
      setMedicalRequests(prev => prev.map(req => 
        req.id === id ? { ...req, status: 'fulfilled' as const } : req
      ));
    } catch (error) {
      console.error('Error fulfilling request:', error);
    }
  };

  return (
    <MedicalContext.Provider value={{
      medicalRequests, addMedicalRequest, notifyPharmacies,
      pharmacyRespond, acceptPharmacy, fulfillRequest,
    }}>
      {children}
    </MedicalContext.Provider>
  );
};
