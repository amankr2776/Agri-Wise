'use client';

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Leaf, 
  TrendingUp, 
  Truck, 
  Users, 
  Bell, 
  Settings,
  Package,
  CheckCircle2,
  Globe,
  Fingerprint,
  ChevronDown,
  LogOut,
  FlaskConical,
  ShieldAlert,
  Search,
  Command
} from "lucide-react";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarInset,
  SidebarTrigger,
  SidebarFooter
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppState, AppLanguage, Notification } from "@/lib/app-state";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { useFirestore, useAuth } from "@/firebase";
import { collection, query, orderBy, onSnapshot, doc, setDoc } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";

import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { CropDiagnostics } from "@/components/diagnostics/CropDiagnostics";
import { MarketIntelligence } from "@/components/market/MarketIntelligence";
import { MandiLink } from "@/components/logistics/MandiLink";
import { KisanNetwork } from "@/components/social/KisanNetwork";
import { SettingsView } from "@/components/settings/SettingsView";
import { NotificationBar } from "@/components/notifications/NotificationBar";

const LANGUAGES: AppLanguage[] = [
  "English", "Hindi", "Bhojpuri", "Punjabi", "Haryanvi", 
  "Bengali", "Marathi", "Rajasthani", "Gujarati", "Pahadi", 
  "Kannada", "Tamil", "Telugu", "Malayalam", "Oriya", "Magahi"
];

export default function KisanMitraApp() {
  const router = useRouter();
  const { t } = useTranslation();
  const firestore = useFirestore();
  const auth = useAuth();
  const { 
    role, 
    notifications, 
    setNotifications,
    setActiveAlert,
    markNotificationsAsRead,
    name,
    language,
    setLanguage,
    profileImage
  } = useAppState();
  const [activeSection, setActiveSection] = useState("dashboard");

  useEffect(() => {
    if (auth && !auth.currentUser) {
      signInAnonymously(auth).catch(err => console.error("Grid Identity Failure:", err));
    }
  }, [auth]);

  useEffect(() => {
    if (auth?.currentUser && firestore && role) {
      const collectionName = role === 'Expert' ? 'roles_experts' : role === 'Logistics' ? 'roles_logisticsProviders' : 'roles_farmers';
      const roleRef = doc(firestore, collectionName, auth.currentUser.uid);
      setDoc(roleRef, { userId: auth.currentUser.uid, role, name, updatedAt: new Date().toISOString() }, { merge: true });
    }
  }, [auth?.currentUser, firestore, role, name]);

  useEffect(() => {
    if (!firestore || !auth.currentUser) return;

    const notifQuery = query(
      collection(firestore, "users", auth.currentUser.uid, "notifications"), 
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(notifQuery, (snapshot) => {
      const newNotifs: Notification[] = [];
      snapshot.forEach((doc) => {
        newNotifs.push({ id: doc.id, ...doc.data() } as Notification);
      });
      setNotifications(newNotifs);

      const latest = newNotifs[0];
      if (latest && !latest.isRead) {
        const isRecent = (Date.now() - new Date(latest.createdAt).getTime()) < 60000;
        if (isRecent) setActiveAlert(latest);
      }
    });

    return () => unsubscribe();
  }, [firestore, auth.currentUser, setNotifications, setActiveAlert]);

  const menuItems = useMemo(() => {
    const items = [
      { id: "dashboard", label: t("dashboard"), icon: LayoutDashboard },
      { id: "diagnostics", label: t("diagnostics"), icon: Leaf },
      { id: "market", label: t("market"), icon: TrendingUp },
    ];

    if (role === 'Expert' || role === 'Authority') {
      items.push(
        { id: "expert-portal", label: "Expert Hub", icon: FlaskConical, url: "/pro/expert-panel" },
        { id: "surveillance", label: "Surveillance", icon: ShieldAlert, url: "/pro/surveillance" }
      );
    } else if (role === 'Logistics') {
      items.push({ id: "logistics-bridge", label: "Logistics Bridge", icon: Truck, url: "/pro/logistics-bridge" });
    } else {
      items.push({ id: "logistics", label: t("mandi_link"), icon: Package });
    }

    items.push({ id: "network", label: t("network"), icon: Users });
    return items;
  }, [role, t]);

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard": return <DashboardHome onNavigate={setActiveSection} />;
      case "diagnostics": return <CropDiagnostics />;
      case "market": return <MarketIntelligence />;
      case "logistics": return <MandiLink />;
      case "network": return <KisanNetwork />;
      case "settings": return <SettingsView />;
      default: return <DashboardHome onNavigate={setActiveSection} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground grid-mesh overflow-hidden">
        <NotificationBar />
        
        <Sidebar collapsible="icon" className="border-r border-border/50 bg-white/80 backdrop-blur-2xl">
          <SidebarHeader className="h-20 flex items-center px-6">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 bg-primary rounded-[1.2rem] flex items-center justify-center text-white shadow-xl shadow-primary/20 transform rotate-3">
                <Leaf className="h-6 w-6" />
              </div>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="font-black text-xl leading-none tracking-tighter">AgriWise</span>
                <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mt-1.5 opacity-70">National Grid</span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="py-6">
            <SidebarMenu className="px-3 gap-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    isActive={activeSection === item.id}
                    onClick={() => item.url ? router.push(item.url) : setActiveSection(item.id)}
                    tooltip={item.label}
                    className="h-12 px-4 data-[active=true]:bg-primary data-[active=true]:text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all duration-300 group"
                  >
                    <item.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span className="ml-2">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-6 border-t border-border/30 gap-3">
            <SidebarMenuButton onClick={() => router.push('/login')} className="h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold border border-border">
              <LogOut className="h-5 w-5" /> <span className="ml-2 group-data-[collapsible=icon]:hidden">Switch Role</span>
            </SidebarMenuButton>
            <SidebarMenuButton onClick={() => setActiveSection("settings")} className="h-12 rounded-2xl font-bold group">
              <Settings className="h-5 w-5 group-hover:rotate-90 transition-transform" /> <span className="ml-2 group-data-[collapsible=icon]:hidden">{t("settings")}</span>
            </SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col bg-transparent relative">
          <header className="h-20 flex items-center justify-between px-8 border-b border-border/30 glass-card sticky top-0 z-40">
            <div className="flex items-center gap-6">
              <SidebarTrigger className="md:hidden" />
              <div className="hidden md:flex items-center gap-4 px-5 py-2 bg-muted/40 rounded-full border border-border/50">
                <Command className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Grid Node Active: {name}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-5 md:gap-8">
              <div className="hidden lg:flex items-center gap-2 text-muted-foreground mr-4">
                <Globe className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Network Status: Secured</span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-full h-11 px-5 gap-3 font-black text-[10px] uppercase bg-white/50 hover:bg-white border border-border/50 shadow-sm transition-all">
                    <Globe className="h-4 w-4 text-primary" />
                    <span className="hidden sm:inline">{language}</span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-3xl p-3 shadow-2xl border-none bg-white/95 backdrop-blur-xl">
                  <ScrollArea className="h-72">
                    {LANGUAGES.map((lang) => (
                      <DropdownMenuItem 
                        key={lang} 
                        onClick={() => setLanguage(lang)}
                        className={cn(
                          "rounded-2xl font-black text-[10px] uppercase tracking-widest p-4 my-1.5 transition-all",
                          language === lang ? "bg-primary text-white" : "hover:bg-muted"
                        )}
                      >
                        {lang}
                      </DropdownMenuItem>
                    ))}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>

              <Popover onOpenChange={(open) => open && markNotificationsAsRead()}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-11 w-11 rounded-full bg-white/50 hover:bg-white border border-border/50 shadow-sm">
                    <Bell className="h-5 w-5" />
                    <AnimatePresence>
                      {unreadCount > 0 && (
                        <motion.span 
                          initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                          className="absolute -top-1 -right-1 h-6 w-6 bg-destructive text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg"
                        >
                          {unreadCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96 p-0 rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.15)] border-none">
                  <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
                    <h4 className="font-black text-xs uppercase tracking-[0.2em]">National Alerts</h4>
                    <Badge variant="outline" className="border-white/20 text-white text-[8px] font-black px-3">Live Feed</Badge>
                  </div>
                  <ScrollArea className="h-96">
                    <div className="p-3">
                      {notifications.length === 0 ? (
                        <div className="py-20 text-center opacity-30">
                          <Bell className="h-12 w-12 mx-auto mb-3" />
                          <p className="text-[10px] font-black uppercase tracking-widest">No Recent Intel</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div key={notif.id} className="p-5 rounded-3xl hover:bg-muted/50 transition-all flex gap-5 items-start group">
                            <div className={cn(
                              "h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                              notif.type === 'alert' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                            )}>
                              {notif.type === 'alert' ? <Package className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-black tracking-tight leading-tight">{notif.title}</p>
                              <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">{notif.message}</p>
                              <p className="text-[9px] text-primary font-black uppercase tracking-widest pt-1">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>

              <div className="flex items-center gap-4 p-1.5 pr-5 bg-white/50 backdrop-blur-md rounded-full border border-border/50 shadow-sm">
                <Avatar className="h-9 w-9 border-2 border-white shadow-md">
                  <AvatarImage src={profileImage || ""} />
                  <AvatarFallback className="bg-primary text-white font-black text-xs">
                    {name ? name[0] : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-slate-900 leading-none">{name}</span>
                  <span className="text-[8px] font-black text-primary uppercase tracking-widest mt-1">{role} Node</span>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 p-8 md:p-12 overflow-x-hidden custom-scrollbar relative z-10">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeSection}
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {renderSection()}
              </motion.div>
            </AnimatePresence>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
