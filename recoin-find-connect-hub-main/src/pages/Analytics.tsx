import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useItems } from "@/contexts/ItemContext";
import Navbar from "@/components/Navbar";
import { BarChart3, TrendingUp, Users, Package, Heart, Pill, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Analytics = () => {
  const { isAuthenticated } = useAuth();
  const { lostItems, foundItems, emergencies, medicalRequests, matches } = useItems();
  const navigate = useNavigate();

  useEffect(() => { if (!isAuthenticated) navigate('/auth'); }, [isAuthenticated]);

  const resolved = lostItems.filter(i => i.status === 'resolved').length;
  const total = lostItems.length;
  const recoveryRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const emergencyResponded = emergencies.filter(e => e.status !== 'active').length;
  const medFulfilled = medicalRequests.filter(m => m.status === 'fulfilled' || m.status === 'matched').length;

  const stats = [
    { label: 'Items Recovery Rate', value: `${recoveryRate}%`, icon: Package, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Total Lost Reports', value: lostItems.length, icon: Package, color: 'text-red-400', bg: 'bg-red-400/10' },
    { label: 'Total Found Reports', value: foundItems.length, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'AI Matches', value: matches.length, icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    { label: 'Emergency Responses', value: emergencyResponded, icon: Heart, color: 'text-red-400', bg: 'bg-red-400/10' },
    { label: 'Medicines Delivered', value: medFulfilled, icon: Pill, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Active Emergencies', value: emergencies.filter(e => e.status === 'active').length, icon: Heart, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { label: 'Active Users (sim)', value: '10,247', icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Analytics <span className="text-gradient">Dashboard</span></h1>
          <p className="text-muted-foreground text-sm">Platform performance metrics</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass hover:glow-primary transition-all">
                <CardContent className="p-5">
                  <div className={`p-2 rounded-lg ${stat.bg} w-fit mb-3`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Simulated Chart */}
        <Card className="glass mt-8">
          <CardHeader><CardTitle>Weekly Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-48">
              {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="flex-1 bg-gradient-to-t from-primary/60 to-primary/20 rounded-t-md relative group">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">{h}</div>
                </motion.div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <div key={d} className="flex-1 text-center text-xs text-muted-foreground">{d}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
