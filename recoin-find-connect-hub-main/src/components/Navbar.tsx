import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
} from "lucide-react";

const navLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/lost-items", label: "Lost & Found", icon: Search },
  { to: "/emergency", label: "Emergency", icon: AlertTriangle },
  { to: "/medical", label: "Medical", icon: Pill },
  { to: "/matches", label: "AI Matches", icon: Brain },
  { to: "/rewards", label: "Rewards", icon: Gift },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

const Navbar = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const { unreadCount: notifCount, notifications, markAllRead } = useNotifications();
  const { getUnreadCount } = useChat();
  const navigate = useNavigate();
  const chatUnread = getUnreadCount();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border/30">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">CC</div>
          <span className="text-xl font-bold text-gradient hidden sm:inline">CampusConnect AI</span>
        </Link>

        {/* Desktop Nav */}
        {isAuthenticated && (
          <div className="hidden lg:flex items-center gap-5">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.label}</Link>
            ))}
          </div>
        )}

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notifCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs h-5 w-5 flex items-center justify-center rounded-full">{notifCount}</span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 glass-strong">
                  <DropdownMenuLabel className="flex justify-between">
                    Notifications
                    <button onClick={markAllRead} className="text-xs text-primary">Mark all read</button>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.slice(0, 5).map(n => (
                    <DropdownMenuItem key={n.id} className={`flex flex-col items-start gap-1 ${!n.read ? 'bg-primary/5' : ''}`}
                      onClick={() => n.actionUrl && navigate(n.actionUrl)}>
                      <span className="font-medium text-sm">{n.title}</span>
                      <span className="text-xs text-muted-foreground">{n.description}</span>
                    </DropdownMenuItem>
                  ))}
                  {notifications.length === 0 && <DropdownMenuItem disabled>No notifications</DropdownMenuItem>}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Chat */}
              <Link to="/chat" className="relative">
                <Button variant="ghost" size="icon">
                  <MessageCircle className="h-5 w-5" />
                  {chatUnread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs h-5 w-5 flex items-center justify-center rounded-full">{chatUnread}</span>
                  )}
                </Button>
              </Link>

              {/* Token Balance */}
              <div className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/50">
                <span className="text-sm">🪙</span>
                <span className="text-sm font-medium">{currentUser?.tokens || 0}</span>
              </div>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer h-8 w-8 border-2 border-primary/30">
                    <AvatarFallback className="bg-primary/20 text-primary text-sm">{currentUser?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-strong">
                  <DropdownMenuLabel>{currentUser?.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}><User className="mr-2 h-4 w-4" />My Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/analytics')}><BarChart3 className="mr-2 h-4 w-4" />Analytics</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { logout(); navigate('/'); }} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Hamburger */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="glass-strong w-64 pt-16">
                  <nav className="flex flex-col gap-1">
                    {navLinks.map(l => (
                      <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm hover:bg-secondary/50 transition-colors">
                        <l.icon className="h-4 w-4 text-muted-foreground" />
                        {l.label}
                      </Link>
                    ))}
                    <Link to="/profile" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm hover:bg-secondary/50 transition-colors">
                      <User className="h-4 w-4 text-muted-foreground" /> My Profile
                    </Link>
                    <button onClick={() => { logout(); navigate('/'); setMobileOpen(false); }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors">
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </nav>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <Button onClick={() => navigate('/auth')} className="glow-primary">Get Started</Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
