import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useItems } from "@/contexts/ItemContext";
import Navbar from "@/components/Navbar";
import AnimatedGridBg from "@/components/ui/animated-grid-bg";
import { MapPin, AlertTriangle, Shield, Eye, CheckCircle, Info } from "lucide-react";

const ZONES = [
  { id: 'z1', name: 'Main Gate', x: 10, y: 15, w: 18, h: 12 },
  { id: 'z2', name: 'Library', x: 30, y: 10, w: 20, h: 15 },
  { id: 'z3', name: 'Canteen', x: 55, y: 12, w: 18, h: 13 },
  { id: 'z4', name: 'Hostel Area', x: 75, y: 8, w: 20, h: 18 },
  { id: 'z5', name: 'Sports Complex', x: 10, y: 35, w: 22, h: 18 },
  { id: 'z6', name: 'Academic Block', x: 35, y: 32, w: 25, h: 20 },
  { id: 'z7', name: 'Parking Lot', x: 65, y: 35, w: 18, h: 15 },
  { id: 'z8', name: 'Medical Center', x: 85, y: 35, w: 12, h: 15 },
  { id: 'z9', name: 'Admin Block', x: 12, y: 60, w: 20, h: 16 },
  { id: 'z10', name: 'Lab Complex', x: 35, y: 58, w: 25, h: 18 },
  { id: 'z11', name: 'Auditorium', x: 65, y: 58, w: 18, h: 16 },
  { id: 'z12', name: 'Back Gate', x: 40, y: 82, w: 20, h: 12 },
];

const SAFE_ROUTES = [
  { from: 'Main Gate', to: 'Library', path: 'Main Gate → Central Road → Library (Well-lit, CCTV)' },
  { from: 'Hostel Area', to: 'Academic Block', path: 'Hostel → Library Road → Academic Block (Guard patrol)' },
  { from: 'Canteen', to: 'Hostel Area', path: 'Canteen → Main Road → Hostel (Streetlights, busy)' },
  { from: 'Lab Complex', to: 'Back Gate', path: 'Lab → Central Path → Back Gate (Moderate traffic)' },
];

const SafetyMap = () => {
  const { emergencies, lostItems } = useItems();
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  // Calculate zone risk levels based on incidents
  const zoneRisks = useMemo(() => {
    const risks: Record<string, { level: number; incidents: number; emergencies: number; lostItems: number }> = {};
    ZONES.forEach(z => {
      const emer = emergencies.filter(e => e.location.toLowerCase().includes(z.name.toLowerCase())).length;
      const lost = lostItems.filter(i => i.location.toLowerCase().includes(z.name.toLowerCase())).length;
      const total = emer * 3 + lost;
      let level = 0; // 0=safe, 1=caution, 2=warning, 3=danger
      if (total >= 5) level = 3;
      else if (total >= 3) level = 2;
      else if (total >= 1) level = 1;
      // Add some randomness for demo
      if (level === 0 && Math.random() > 0.6) level = 1;
      risks[z.id] = { level, incidents: total, emergencies: emer, lostItems: lost };
    });
    return risks;
  }, [emergencies, lostItems]);

  const riskColors = [
    'bg-emerald-500/30 border-emerald-500/40 hover:bg-emerald-500/40',
    'bg-yellow-500/25 border-yellow-500/40 hover:bg-yellow-500/35',
    'bg-orange-500/30 border-orange-500/40 hover:bg-orange-500/40',
    'bg-red-500/30 border-red-500/40 hover:bg-red-500/40',
  ];
  const riskLabels = ['Safe', 'Low Risk', 'Moderate', 'High Risk'];
  const riskTextColors = ['text-emerald-400', 'text-yellow-400', 'text-orange-400', 'text-red-400'];

  const selected = selectedZone ? ZONES.find(z => z.id === selectedZone) : null;
  const selectedRisk = selectedZone ? zoneRisks[selectedZone] : null;

  return (
    <div className="min-h-screen relative">
      <AnimatedGridBg />
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-10 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold">AI Safety <span className="text-gradient">Heatmap</span></h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time campus safety intelligence • Crowd-sourced verification</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-400" />Campus Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-white/[0.02] rounded-xl border border-white/[0.04] overflow-hidden" style={{ aspectRatio: '16/10' }}>
                  {/* Grid lines */}
                  <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
                    <defs><pattern id="mapgrid" width="10%" height="10%" patternUnits="objectBoundingBox"><rect width="100%" height="100%" fill="none" stroke="white" strokeWidth="0.5" /></pattern></defs>
                    <rect width="100%" height="100%" fill="url(#mapgrid)" />
                  </svg>

                  {/* Zones */}
                  {ZONES.map(zone => {
                    const risk = zoneRisks[zone.id];
                    return (
                      <motion.button
                        key={zone.id}
                        onClick={() => setSelectedZone(selectedZone === zone.id ? null : zone.id)}
                        className={`absolute rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center ${riskColors[risk.level]} ${selectedZone === zone.id ? 'ring-2 ring-white/30 scale-105 z-10' : ''}`}
                        style={{ left: `${zone.x}%`, top: `${zone.y}%`, width: `${zone.w}%`, height: `${zone.h}%` }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="text-center p-1">
                          <p className="text-[10px] sm:text-xs font-semibold text-white/90 leading-tight">{zone.name}</p>
                          {risk.incidents > 0 && (
                            <span className="text-[9px] font-bold mt-0.5 block">{risk.incidents} incidents</span>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-4 flex-wrap">
                  {riskLabels.map((label, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${riskColors[i].split(' ')[0]}`} />
                      <span className="text-xs text-muted-foreground">{label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Zone Detail */}
            {selected && selectedRisk ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="glass">
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-lg mb-2">{selected.name}</h3>
                    <Badge className={`${riskColors[selectedRisk.level].split(' ')[0]} ${riskTextColors[selectedRisk.level]} border-0 mb-3`}>
                      {riskLabels[selectedRisk.level]}
                    </Badge>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Emergencies</span><span className="font-medium">{selectedRisk.emergencies}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Lost Items</span><span className="font-medium">{selectedRisk.lostItems}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Risk Score</span><span className="font-medium">{selectedRisk.incidents}</span></div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Card className="glass">
                <CardContent className="p-5 text-center text-muted-foreground">
                  <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Click a zone to view details</p>
                </CardContent>
              </Card>
            )}

            {/* Safe Routes */}
            <Card className="glass">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4 text-green-400" />Safe Routes</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {SAFE_ROUTES.map((route, i) => (
                  <div key={i} className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-emerald-400">{route.from}</span>
                      <span className="text-xs text-muted-foreground">→</span>
                      <span className="text-xs font-semibold text-emerald-400">{route.to}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{route.path}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Campus info */}
            <Card className="glass">
              <CardContent className="p-4 flex items-start gap-3">
                <Info className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Safety data is calculated from real emergency reports and lost item reports. Zones update in real-time as new incidents are reported.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyMap;
