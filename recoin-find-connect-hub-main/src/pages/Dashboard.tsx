import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useItems } from "@/contexts/ItemContext";
import { useNotifications } from "@/contexts/NotificationContext";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import {
  Coins, Star, HandHelping, Search, AlertTriangle, Pill,
  Gift, BarChart3, Brain, MapPin, Users,
} from "lucide-react";
import NearbyFeed from "@/components/NearbyFeed";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { lostItems, matches, emergencies } = useItems();
  const { notifications } = useNotifications();

  React.useEffect(() => {
    supabase.from("lost_items").select("*").then(({ data, error }) => {
      console.log("DATA:", data);
      console.log("ERROR:", error);
    });
  }, []);

  const activeEmergencies = emergencies.filter(e => e.status === 'active');
  const recentMatches = matches.slice(0, 3);

  const statCards = [
    { icon: Coins, label: "Tokens", value: currentUser?.tokens || 0, color: "text-yellow-400", bg: "bg-yellow-400/10" },
    { icon: Star, label: "Reputation", value: `${currentUser?.reputation || 0}/5`, color: "text-purple-400", bg: "bg-purple-400/10" },
    { icon: HandHelping, label: "Total Helps", value: currentUser?.totalHelps || 0, color: "text-green-400", bg: "bg-green-400/10" },
    { icon: Search, label: "Active Items", value: lostItems.filter(i => i.status === 'active').length, color: "text-blue-400", bg: "bg-blue-400/10" },
  ];

  const quickActions = [
    { label: "Report Lost Item", icon: Search, path: "/lost-items", color: "bg-blue-500/20 text-blue-400" },
    { label: "Emergency SOS", icon: AlertTriangle, path: "/emergency", color: "bg-red-500/20 text-red-400" },
    { label: "Medical Request", icon: Pill, path: "/medical", color: "bg-green-500/20 text-green-400" },
    { label: "Claim Rewards", icon: Gift, path: "/rewards", color: "bg-yellow-500/20 text-yellow-400" },
    { label: "View Analytics", icon: BarChart3, path: "/analytics", color: "bg-purple-500/20 text-purple-400" },
    { label: "AI Matches", icon: Brain, path: "/matches", color: "bg-cyan-500/20 text-cyan-400" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-10">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold">Welcome, <span className="text-gradient">{currentUser?.name}</span></h1>
          <p className="text-muted-foreground mt-1">Here's what's happening on campus today</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="glass hover:glow-primary transition-all">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Badges */}
        {currentUser?.badges && currentUser.badges.length > 0 && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {currentUser.badges.map(badge => (
              <span key={badge} className="px-3 py-1 rounded-full text-xs glass font-medium">{badge}</span>
            ))}
          </div>
        )}

        {/* Top Row: Quick Actions + Nearby Feed */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <Card className="glass">
            <CardHeader><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-3 gap-3">
              {quickActions.map((action, i) => (
                <Link key={i} to={action.path}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className={`p-3 rounded-xl ${action.color} flex flex-col items-center gap-2 text-center cursor-pointer transition-all hover:opacity-80`}>
                    <action.icon className="h-5 w-5" />
                    <span className="text-xs font-medium leading-tight">{action.label}</span>
                  </motion.div>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-400" /> Nearby Feed
              </CardTitle>
            </CardHeader>
            <CardContent><NearbyFeed /></CardContent>
          </Card>
        </div>

        {/* Bottom Row: AI Matches + Emergency Alerts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">🔥 AI Matches</CardTitle>
              <Link to="/matches"><Button variant="ghost" size="sm">View All</Button></Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentMatches.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No matches yet</p>
              ) : recentMatches.map(match => (
                <div key={match.id} className="p-3 rounded-lg bg-secondary/30 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium truncate">{match.lostTitle}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                      match.confidence >= 90 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>{match.confidence}%</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Brain className="h-3 w-3" /> Matched with: {match.foundTitle}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">🚨 Active Alerts</CardTitle>
              <Link to="/emergency"><Button variant="ghost" size="sm">View All</Button></Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeEmergencies.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No active emergencies</p>
              ) : activeEmergencies.map(em => (
                <div key={em.id} className={`p-3 rounded-lg space-y-2 ${
                  em.urgency === 'critical' ? 'bg-red-500/10 border border-red-500/20' : 'bg-yellow-500/10 border border-yellow-500/20'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{em.title}</span>
                    <span className={`text-xs font-bold uppercase ${em.urgency === 'critical' ? 'text-red-400' : 'text-yellow-400'}`}>{em.urgency}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {em.location}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="glass">
          <CardHeader><CardTitle className="text-lg">Recent Activity</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {notifications.slice(0, 5).map(n => (
              <div key={n.id} className={`flex items-start gap-3 p-3 rounded-lg ${!n.read ? 'bg-primary/5' : 'bg-secondary/20'}`}>
                <div className="flex-1">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.description}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(n.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
