import React, { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useItems } from "@/contexts/ItemContext";
import Navbar from "@/components/Navbar";
import SpotlightCard from "@/components/ui/spotlight-card";
import AnimatedGridBg from "@/components/ui/animated-grid-bg";
import AnimatedCounter from "@/components/ui/animated-counter";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  TrendingUp, TrendingDown, Activity, Package, Heart, Pill,
  CheckCircle, Users, Clock, Zap, Trophy, Crown, Shield, Target
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#f43f5e', '#84cc16'];
const CHART_AMBER = '#f59e0b';
const CHART_BLUE = '#3b82f6';
const CHART_GREEN = '#10b981';
const CHART_PURPLE = '#8b5cf6';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-strong p-3 rounded-xl text-xs">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          {entry.name}: <span className="font-bold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

const Analytics = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const { lostItems, foundItems, emergencies, medicalRequests, matches } = useItems();
  const navigate = useNavigate();

  useEffect(() => { if (!isAuthenticated) navigate('/auth'); }, [isAuthenticated]);

  // ── Derived data ──────────────────────────────────────
  const resolved = lostItems.filter(i => i.status === 'resolved').length;
  const total = lostItems.length + foundItems.length;
  const recoveryRate = lostItems.length > 0 ? Math.round((resolved / lostItems.length) * 100) : 0;
  const activeEmergencies = emergencies.filter(e => e.status === 'active').length;
  const responseRate = emergencies.length > 0
    ? Math.round(emergencies.filter(e => e.respondents > 0).length / emergencies.length * 100) : 0;
  const totalResponders = emergencies.reduce((s, e) => s + (e.respondents || 0), 0);

  // ── Weekly activity chart data ────────────────────────
  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((name, i) => ({
      name,
      lost: Math.max(1, Math.floor(Math.random() * 8) + lostItems.length),
      found: Math.max(1, Math.floor(Math.random() * 6) + foundItems.length),
      emergency: Math.max(0, Math.floor(Math.random() * 4) + (emergencies.length > 0 ? 1 : 0)),
    }));
  }, [lostItems.length, foundItems.length, emergencies.length]);

  // ── Emergency type distribution ───────────────────────
  const emergencyTypeData = useMemo(() => {
    const counts: Record<string, number> = { blood: 0, medical: 0, safety: 0, other: 0 };
    emergencies.forEach(e => { counts[e.type] = (counts[e.type] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: Math.max(value, 1),
    }));
  }, [emergencies]);

  // ── Category distribution ─────────────────────────────
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    [...lostItems, ...foundItems].forEach(item => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    const entries = Object.entries(counts).map(([name, value]) => ({ name, value }));
    return entries.length > 0 ? entries : [
      { name: 'Electronics', value: 5 }, { name: 'Documents', value: 3 },
      { name: 'Accessories', value: 4 }, { name: 'Bags', value: 2 },
      { name: 'Keys', value: 3 }, { name: 'Other', value: 2 },
    ];
  }, [lostItems, foundItems]);

  // ── Radar: Community Health ───────────────────────────
  const radarData = [
    { subject: 'Safety', A: Math.min(100, responseRate + 40), fullMark: 100 },
    { subject: 'Recovery', A: Math.min(100, recoveryRate + 20), fullMark: 100 },
    { subject: 'Medical', A: Math.min(100, medicalRequests.length * 15 + 30), fullMark: 100 },
    { subject: 'Response', A: Math.min(100, totalResponders * 10 + 30), fullMark: 100 },
    { subject: 'Engagement', A: Math.min(100, total * 5 + 40), fullMark: 100 },
    { subject: 'AI Match', A: Math.min(100, matches.length * 20 + 25), fullMark: 100 },
  ];

  // ── Heatmap data (7×24) ───────────────────────────────
  const heatmapData = useMemo(() => {
    const grid = [];
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const intensity = Math.random();
        let level = 0;
        if (intensity > 0.3) level = 1;
        if (intensity > 0.5) level = 2;
        if (intensity > 0.7) level = 3;
        if (intensity > 0.85) level = 4;
        grid.push({ day, hour, level });
      }
    }
    return grid;
  }, []);

  const heatColors = ['bg-white/[0.02]', 'bg-amber-500/20', 'bg-amber-500/40', 'bg-amber-500/60', 'bg-amber-500/80'];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // ── KPIs ──────────────────────────────────────────────
  const kpis = [
    { label: 'Recovery Rate', value: recoveryRate, suffix: '%', icon: Target, color: 'text-green-400', bg: 'bg-green-400/10', trend: '+12%', trendUp: true },
    { label: 'Total Reports', value: total, icon: Package, color: 'text-blue-400', bg: 'bg-blue-400/10', trend: `+${lostItems.length}`, trendUp: true },
    { label: 'Response Rate', value: responseRate, suffix: '%', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-400/10', trend: '+8%', trendUp: true },
    { label: 'Active Alerts', value: activeEmergencies, icon: Shield, color: 'text-red-400', bg: 'bg-red-400/10', trend: activeEmergencies > 0 ? 'Active' : 'Clear', trendUp: false },
  ];

  return (
    <div className="min-h-screen relative">
      <AnimatedGridBg />
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-10 relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Analytics <span className="text-gradient">Dashboard</span>
            <div className="flex items-center gap-2 ml-auto">
              <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-muted-foreground">Live</span>
            </div>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time platform insights & community health</p>
        </motion.div>

        {/* ── Row 1: KPI Cards ────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <SpotlightCard>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-xl ${kpi.bg}`}>
                      <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-medium ${kpi.trendUp ? 'text-green-400' : 'text-muted-foreground'}`}>
                      {kpi.trendUp ? <TrendingUp className="h-3 w-3" /> : <Activity className="h-3 w-3" />}
                      {kpi.trend}
                    </div>
                  </div>
                  <p className="text-3xl font-bold">
                    <AnimatedCounter end={kpi.value} suffix={kpi.suffix || ''} duration={1.5} />
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>

        {/* ── Row 2: Area Chart + Bar Chart ───────────────── */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="glass">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4 text-amber-400" />Reports Over Time</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="gradLost" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_AMBER} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={CHART_AMBER} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradFound" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_GREEN} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={CHART_GREEN} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="lost" stroke={CHART_AMBER} fill="url(#gradLost)" strokeWidth={2} name="Lost" />
                    <Area type="monotone" dataKey="found" stroke={CHART_GREEN} fill="url(#gradFound)" strokeWidth={2} name="Found" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="glass">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Heart className="h-4 w-4 text-red-400" />Emergency Response by Type</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={emergencyTypeData} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" name="Count" radius={[8, 8, 0, 0]}>
                      {emergencyTypeData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ── Row 3: Pie + Radar + Leaderboard ────────────── */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="glass h-full">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Package className="h-4 w-4 text-blue-400" />Item Categories</CardTitle></CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="glass h-full">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4 text-purple-400" />Community Health</CardTitle></CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.06)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
                    <PolarRadiusAxis tick={false} axisLine={false} />
                    <Radar name="Score" dataKey="A" stroke={CHART_PURPLE} fill={CHART_PURPLE} fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Card className="glass h-full">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-400" />Top Helpers</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { rank: 1, name: currentUser?.name || 'You', coins: currentUser?.tokens || 0, helps: currentUser?.totalHelps || 0, badge: '🥇' },
                  { rank: 2, name: 'Priya Sharma', coins: 75, helps: 8, badge: '🥈' },
                  { rank: 3, name: 'Ravi Kumar', coins: 60, helps: 6, badge: '🥉' },
                  { rank: 4, name: 'Anita Gupta', coins: 45, helps: 4, badge: '4' },
                  { rank: 5, name: 'Mohit Singh', coins: 30, helps: 3, badge: '5' },
                ].map((user, i) => (
                  <div key={i} className={`flex items-center gap-3 p-2 rounded-lg transition-all ${i === 0 ? 'bg-amber-500/10 border border-amber-500/20' : 'hover:bg-white/[0.02]'}`}>
                    <span className="text-lg w-8 text-center">{user.badge}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.helps} helps</p>
                    </div>
                    <span className="text-sm font-bold text-amber-400">🪙 {user.coins}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ── Row 4: Heatmap ──────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-cyan-400" />Weekly Activity Pattern
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-1">
                <div className="flex flex-col gap-1 mr-2 justify-center">
                  {days.map(d => <div key={d} className="text-[10px] text-muted-foreground h-4 flex items-center">{d}</div>)}
                </div>
                <div className="flex-1 grid grid-cols-24 gap-[2px]">
                  {heatmapData.map((cell, i) => (
                    <div
                      key={i}
                      className={`h-4 rounded-sm ${heatColors[cell.level]} transition-colors`}
                      title={`${days[cell.day]} ${cell.hour}:00 — Level ${cell.level}`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 justify-end">
                <span className="text-[10px] text-muted-foreground">Less</span>
                {heatColors.map((c, i) => <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />)}
                <span className="text-[10px] text-muted-foreground">More</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
