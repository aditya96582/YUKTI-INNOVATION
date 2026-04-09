import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useChat } from "@/contexts/ChatContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Bell, MessageCircle, LogOut, User, LayoutDashboard,
  Menu, Search, AlertTriangle, Pill, Gift, BarChart3, Brain,
  MapPin, Trophy, ArrowRight, Sparkles,
} from "lucide-react";

const navLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/lost-items", label: "Lost & Found", icon: Search },
  { to: "/emergency", label: "Emergency", icon: AlertTriangle },
  { to: "/medical", label: "Medical", icon: Pill },
  { to: "/safety-map", label: "Safety Map", icon: MapPin },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

const Navbar = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const { unreadCount: notifCount, notifications, markAllRead } = useNotifications();
  const { getUnreadCount } = useChat();
  const navigate = useNavigate();
  const location = useLocation();
  const chatUnread = getUnreadCount();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-shadow">
            CC
          </div>
          <span className="text-lg font-bold text-gradient hidden sm:inline">CampusConnect</span>
        </Link>

        {/* Desktop Nav */}
        {isAuthenticated && (
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to}
                className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-all ${isActive(l.to) ? 'text-foreground bg-white/[0.06]' : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.03]'}`}>
                {l.label}
                {isActive(l.to) && (
                  <motion.div layoutId="nav-indicator" className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
                )}
              </Link>
            ))}
          </div>
        )}

        {/* Right Side */}
        <div className="flex items-center gap-1.5">
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-9 w-9">
                    <Bell className="h-[18px] w-[18px]" />
                    {notifCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[10px] h-4 min-w-4 flex items-center justify-center rounded-full px-1 font-bold">
                        {notifCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 glass-strong border-white/[0.06]">
                  <DropdownMenuLabel className="flex justify-between">
                    Notifications
                    <button onClick={markAllRead} className="text-xs text-primary hover:underline">Mark all read</button>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/[0.06]" />
                  {notifications.slice(0, 5).map(n => (
                    <DropdownMenuItem key={n.id} className={`flex flex-col items-start gap-1 ${!n.read ? 'bg-primary/5' : ''}`}
                      onClick={() => n.actionUrl && navigate(n.actionUrl)}>
                      <span className="font-medium text-sm">{n.title}</span>
                      <span className="text-xs text-muted-foreground">{n.description}</span>
                    </DropdownMenuItem>
                  ))}
                  {notifications.length === 0 && <DropdownMenuItem disabled className="text-center text-muted-foreground">No notifications</DropdownMenuItem>}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Chat */}
              <Link to="/chat">
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                  <MessageCircle className="h-[18px] w-[18px]" />
                  {chatUnread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-blue-500 text-white text-[10px] h-4 min-w-4 flex items-center justify-center rounded-full px-1 font-bold">
                      {chatUnread}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Token Balance */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/15">
                <span className="text-sm">🪙</span>
                <span className="text-sm font-bold text-amber-400">{currentUser?.tokens || 0}</span>
              </div>

              {/* Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer h-8 w-8 border-2 border-amber-500/20 hover:border-amber-500/40 transition-colors">
                    <AvatarFallback className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400 text-sm font-bold">
                      {currentUser?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-strong border-white/[0.06]">
                  <DropdownMenuLabel className="flex flex-col">
                    <span>{currentUser?.name}</span>
                    <span className="text-xs text-muted-foreground font-normal">{currentUser?.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/[0.06]" />
                  <DropdownMenuItem onClick={() => navigate('/profile')}><User className="mr-2 h-4 w-4" />My Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/rewards')}><Gift className="mr-2 h-4 w-4" />Rewards</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/matches')}><Brain className="mr-2 h-4 w-4" />AI Matches</DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/[0.06]" />
                  <DropdownMenuItem onClick={() => { logout(); navigate('/'); }} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Hamburger */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9"><Menu className="h-5 w-5" /></Button>
                </SheetTrigger>
                <SheetContent side="right" className="glass-strong border-l-white/[0.06] w-72 pt-16">
                  <nav className="flex flex-col gap-1">
                    {navLinks.map(l => (
                      <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${isActive(l.to) ? 'bg-white/[0.06] text-foreground font-medium' : 'text-muted-foreground hover:bg-white/[0.03]'}`}>
                        <l.icon className="h-4 w-4" />
                        {l.label}
                      </Link>
                    ))}
                    <div className="h-px bg-white/[0.06] my-2" />
                    <Link to="/profile" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:bg-white/[0.03]">
                      <User className="h-4 w-4" /> My Profile
                    </Link>
                    <Link to="/chat" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:bg-white/[0.03]">
                      <MessageCircle className="h-4 w-4" /> Messages
                    </Link>
                    <button onClick={() => { logout(); navigate('/'); setMobileOpen(false); }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors text-left">
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </nav>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <Button onClick={() => navigate('/auth')} className="glow-primary font-medium">
              <Sparkles className="mr-2 h-4 w-4" /> Get Started
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
