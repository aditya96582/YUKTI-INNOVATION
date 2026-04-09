import React from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Coins, AlertTriangle, Pill, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useItems } from "@/contexts/ItemContext";
import { useNavigate } from "react-router-dom";

interface FeedItem {
  id: string;
  type: 'lost' | 'found' | 'emergency' | 'medical';
  title: string;
  location: string;
  time: string;
  urgency?: string;
  reward?: number;
}

const typeConfig = {
  lost: { icon: Search, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Lost', path: '/lost-items' },
  found: { icon: Search, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Found', path: '/lost-items' },
  emergency: { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Emergency', path: '/emergency' },
  medical: { icon: Pill, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Medical', path: '/medical' },
};

const NearbyFeed: React.FC = () => {
  const { lostItems, foundItems, emergencies, medicalRequests } = useItems();
  const navigate = useNavigate();

  const feed: FeedItem[] = [
    ...lostItems.slice(0, 2).map(i => ({ id: i.id, type: 'lost' as const, title: i.title, location: i.location, time: i.date, reward: i.reward })),
    ...foundItems.slice(0, 2).map(i => ({ id: i.id, type: 'found' as const, title: i.title, location: i.location, time: i.date })),
    ...emergencies.filter(e => e.status === 'active').slice(0, 2).map(e => ({ id: e.id, type: 'emergency' as const, title: e.title, location: e.location, time: e.timestamp, urgency: e.urgency })),
    ...medicalRequests.filter(m => m.status === 'pending').slice(0, 1).map(m => ({ id: m.id, type: 'medical' as const, title: `Medicine needed: ${m.medicines[0]?.name}`, location: m.location, time: m.timestamp })),
  ].sort(() => Math.random() - 0.5).slice(0, 6);

  return (
    <div className="space-y-2">
      {feed.map((item, i) => {
        const cfg = typeConfig[item.type];
        const Icon = cfg.icon;
        return (
          <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-start gap-3 p-3 rounded-lg ${cfg.bg} cursor-pointer hover:opacity-80 transition-opacity`}
            onClick={() => navigate(cfg.path)}>
            <div className={`p-1.5 rounded-md bg-background/30`}>
              <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Badge variant="outline" className={`text-xs px-1.5 py-0 ${cfg.color} border-current/30`}>{cfg.label}</Badge>
                {item.urgency === 'critical' && <span className="text-xs text-red-400 font-bold animate-pulse">CRITICAL</span>}
              </div>
              <p className="text-sm font-medium truncate">{item.title}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-2.5 w-2.5" />{item.location.split(',')[0]}
                </span>
                {item.reward && item.reward > 0 && (
                  <span className="flex items-center gap-1 text-xs text-yellow-400">
                    <Coins className="h-2.5 w-2.5" />{item.reward}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
      {feed.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No nearby activity</p>}
    </div>
  );
};

export default NearbyFeed;
