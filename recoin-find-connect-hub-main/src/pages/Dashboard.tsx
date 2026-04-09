import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useItems } from "@/contexts/ItemContext";
import { useNotifications } from "@/contexts/NotificationContext";
import Navbar from "@/components/Navbar";
import AnimatedGridBg from "@/components/ui/animated-grid-bg";
import SpotlightCard from "@/components/ui/spotlight-card";
import AnimatedCounter from "@/components/ui/animated-counter";
import GuardianWalk from "@/components/GuardianWalk";
import NearbyFeed from "@/components/NearbyFeed";
import {
  Coins, Star, HandHelping, Search, AlertTriangle, Pill,
  Gift, BarChart3, Brain, MapPin, Trophy, Navigation, Shield,
  ArrowRight, TrendingUp, Zap, Clock
} from "lucide-react";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { lostItems, matches, emergencies } = useItems();
  const { notifications } = useNotifications();

  const activeEmergencies = emergencies.filter(e => e.status === 'active');
  const recentMatches = matches.slice(0, 3);

  const statCards = [
    { icon: Coins, label: "Tokens", value: currentUser?.tokens || 0, color: "text-amber-400", bg: "bg-amber-400/10", glow: "rgba(245,158,11,0.08)" },
    { icon: Star, label: "Reputation", value: currentUser?.reputation || 0, suffix: "/5", color: "text-purple-400", bg: "bg-purple-400/10", glow: "rgba(139,92,246,0.08)" },
    { icon: HandHelping, label: "Total Helps", value: currentUser?.totalHelps || 0, color: "text-emerald-400", bg: "bg-emerald-400/10", glow: "rgba(16,185,129,0.08)" },
    { icon: Search, label: "Active Items", value: lostItems.filter(i => i.status === 'active').length, color: "text-blue-400", bg: "bg-blue-400/10", glow: "rgba(59,130,246,0.08)" },
  ];

  const quickActions = [
    { label: "Report Lost", icon: Search, path: "/lost-items", color: "from-blue-500/20 to-blue-600/10 text-blue-400" },
    { label: "Emergency", icon: AlertTriangle, path: "/emergency", color: "from-red-500/20 to-red-600/10 text-red-400" },
    { label: "Medical", icon: Pill, path: "/medical", color: "from-emerald-500/20 to-emerald-600/10 text-emerald-400" },
    { label: "Rewards", icon: Gift, path: "/rewards", color: "from-amber-500/20 to-amber-600/10 text-amber-400" },
    { label: "Analytics", icon: BarChart3, path: "/analytics", color: "from-purple-500/20 to-purple-600/10 text-purple-400" },
    { label: "AI Matches", icon: Brain, path: "/matches", color: "from-cyan-500/20 to-cyan-600/10 text-cyan-400" },
    { label: "Safety Map", icon: MapPin, path: "/safety-map", color: "from-violet-500/20 to-violet-600/10 text-violet-400" },
    { label: "Leaderboard", icon: Trophy, path: "/leaderboard", color: "from-yellow-500/20 to-yellow-600/10 text-yellow-400" },
  ];

  return (
    <div className="min-h-screen relative">
      <AnimatedGridBg />
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-10 relative z-10">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome, <span className="text-gradient">{currentUser?.name}</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Here's what's happening on campus today</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <SpotlightCard spotlightColor={stat.glow}>
                <div className="p-5 flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      <AnimatedCounter end={stat.value} suffix={stat.suffix || ''} decimals={stat.label === 'Reputation' ? 1 : 0} />
                    </p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>

        {/* Badges */}
        {currentUser?.badges && currentUser.badges.length > 0 && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {currentUser.badges.map(badge => (
              <span key={badge} className="px-3 py-1 rounded-full text-xs glass font-medium border border-amber-500/10 text-amber-300">{badge}</span>
            ))}
          </div>
        )}

        {/* Top Row: Quick Actions + Guardian Walk */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <Card className="glass h-full">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4 text-amber-400" />Quick Actions</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-3">
                  {quickActions.map((action, i) => (
                    <Link key={i} to={action.path}>
                      <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                        className={`p-4 rounded-xl bg-gradient-to-b ${action.color} flex flex-col items-center gap-2 text-center cursor-pointer transition-all border border-white/[0.04] hover:border-white/[0.08]`}>
                        <action.icon className="h-5 w-5" />
                        <span className="text-[11px] font-medium leading-tight">{action.label}</span>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <GuardianWalk />
        </div>

        {/* Middle Row: AI Matches + Emergency + Feed */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><Brain className="h-4 w-4 text-cyan-400" /> AI Matches</CardTitle>
              <Link to="/matches"><Button variant="ghost" size="sm" className="text-xs">View All</Button></Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentMatches.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No matches yet</p>
              ) : recentMatches.map(match => (
                <div key={match.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium truncate">{match.lostTitle}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${match.confidence >= 90 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>{match.confidence}%</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground"><Brain className="h-3 w-3" /> Matched: {match.foundTitle}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-400" /> Active Alerts</CardTitle>
              <Link to="/emergency"><Button variant="ghost" size="sm" className="text-xs">View All</Button></Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeEmergencies.length === 0 ? (
                <div className="text-center py-6">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-emerald-400 opacity-50" />
                  <p className="text-sm text-muted-foreground">All clear! No active emergencies</p>
                </div>
              ) : activeEmergencies.slice(0, 3).map(em => (
                <div key={em.id} className={`p-3 rounded-xl border ${em.urgency === 'critical' ? 'bg-red-500/5 border-red-500/20' : 'bg-amber-500/5 border-amber-500/15'}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{em.title}</span>
                    <span className={`text-[10px] font-bold uppercase ${em.urgency === 'critical' ? 'text-red-400' : 'text-amber-400'}`}>{em.urgency}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1"><MapPin className="h-3 w-3" />{em.location}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-400" /> Nearby Feed</CardTitle>
            </CardHeader>
            <CardContent><NearbyFeed /></CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /> Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {notifications.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No recent activity</p>}
            {notifications.slice(0, 5).map(n => (
              <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl transition-all ${!n.read ? 'bg-primary/5 border border-primary/10' : 'bg-white/[0.01] hover:bg-white/[0.02]'}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{n.description}</p>
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
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
