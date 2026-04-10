import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ChatProvider } from "./contexts/ChatContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ItemProvider } from "./contexts/ItemContext";
import { MedicalProvider } from "./contexts/MedicalContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import LostItems from "./pages/LostItems";
import Emergency from "./pages/Emergency";
import Medical from "./pages/Medical";
import Matches from "./pages/Matches";
import Rewards from "./pages/Rewards";
import Analytics from "./pages/Analytics";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import SafetyMap from "./pages/SafetyMap";
import Leaderboard from "./pages/Leaderboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <MedicalProvider>
          <ItemProvider>
            <NotificationProvider>
              <ChatProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/lost-items" element={<ProtectedRoute><LostItems /></ProtectedRoute>} />
                    <Route path="/emergency" element={<ProtectedRoute><Emergency /></ProtectedRoute>} />
                    <Route path="/medical" element={<ProtectedRoute><Medical /></ProtectedRoute>} />
                    <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
                    <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
                    <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                    <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/safety-map" element={<ProtectedRoute><SafetyMap /></ProtectedRoute>} />
                    <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </ChatProvider>
            </NotificationProvider>
          </ItemProvider>
        </MedicalProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
