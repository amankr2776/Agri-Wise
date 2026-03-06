
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
  ShieldAlert
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
    isAuthenticated,
    notifications, 
    setNotifications,
    setActiveAlert,
    markNotificationsAsRead,
    name,
    language,
    setLanguage,
    profileImage,
    logout
  } = useAppState();
  const [activeSection, setActiveSection] = useState("dashboard");

  // Initialize Grid Identity (Anonymous background auth)
  useEffect(() => {
    if (auth && !auth.currentUser) {
      signInAnonymously(auth).catch(err => console.error("Grid Identity Failure:", err));
    }
  }, [auth]);

  // Register Role Marker in Firestore
  useEffect(() => {
    if (auth?.currentUser && firestore && role) {
      const collectionName = role === 'Expert' ? 'roles_experts' : role === 'Logistics' ? 'roles_logisticsProviders' : 'roles_farmers';
      const roleRef = doc(firestore, collectionName, auth.currentUser.uid);
      setDoc(roleRef, { userId: auth.currentUser.uid, role, name, updatedAt: new Date().toISOString() }, { merge: true });
    }
  }, [auth?.currentUser, firestore, role, name]);

  // Listen for real-time notifications
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
        if (isRecent) {
          setActiveAlert(latest);
        }
      }
    }, (err) => {
      console.warn("Notification sync delayed:", err.message);
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
        { id: "expert-portal", label: "Expert Portal", icon: FlaskConical, url: "/pro/expert-panel" },
        { id: "surveillance", label: "Surveillance Hub", icon: ShieldAlert, url: "/pro/surveillance" }
      );
    } else if (role === 'Logistics') {
      items.push({ id: "logistics-bridge", label: "Logistics Bridge", icon: Truck, url: "/pro/logistics-bridge" });
    } else {
      items.push({ id: "logistics", label: t("mandi_link"), icon: Package });
    }

    items.push({ id: "network", label: t("network"), icon: Users });
    return items;
  }, [role, t]);

  const handleMenuClick = (item: any) => {
    if (item.url) {
      router.push(item.url);
    } else {
      setActiveSection(item.id);
    }
  };

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
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <NotificationBar />
        
        <Sidebar collapsible="icon" className="border-r border-border bg-card">
          <SidebarHeader className="h-16 flex items-center px-4 border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Leaf className="h-6 w-6" />
              </div>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="font-black text-lg leading-none tracking-tight">KisanMitra</span>
                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1">National Agricultural Grid</span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="py-4">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    isActive={activeSection === item.id}
                    onClick={() => handleMenuClick(item)}
                    tooltip={item.label}
                    className="h-12 px-4 data-[active=true]:bg-primary/10 data-[active=true]:text-primary transition-all rounded-xl mx-2 w-auto"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-bold">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t p-4 space-y-2">
            <SidebarMenuButton onClick={() => router.push('/login')} className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200">
              <LogOut className="h-5 w-5" /> <span className="font-bold">Switch Role</span>
            </SidebarMenuButton>
            <SidebarMenuButton onClick={() => setActiveSection("settings")} className="h-12 rounded-xl">
              <Settings className="h-5 w-5" /> <span className="font-bold">{t("settings")}</span>
            </SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col">
          <header className="h-16 flex items-center justify-between px-6 border-b glass-card sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <div className="hidden md:flex items-center gap-3">
                <Fingerprint className="h-4 w-4 text-primary" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Grid Node Active: {name} | Identity Secured</h2>
              </div>
            </div>
            <div className="flex items-center gap-4 md:gap-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-full h-10 px-4 gap-2 font-black text-[10px] uppercase bg-muted/30 hover:bg-muted border border-border/50">
                    <Globe className="h-4 w-4 text-primary" />
                    <span className="hidden sm:inline">{language}</span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 rounded-2xl p-2 shadow-2xl border-none">
                  <ScrollArea className="h-64">
                    {LANGUAGES.map((lang) => (
                      <DropdownMenuItem 
                        key={lang} 
                        onClick={() => setLanguage(lang)}
                        className={cn(
                          "rounded-xl font-bold text-xs p-3 my-1",
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
                  <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full bg-muted/50 hover:bg-muted">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-background">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 rounded-3xl overflow-hidden shadow-2xl border-none">
                  <div className="bg-primary p-4 text-white">
                    <h4 className="font-black text-sm uppercase tracking-widest">Recent Activity</h4>
                  </div>
                  <ScrollArea className="h-80">
                    <div className="p-2">
                      {notifications.length === 0 ? (
                        <div className="p-10 text-center opacity-40">
                          <Bell className="h-10 w-10 mx-auto mb-2" />
                          <p className="text-xs font-bold">No new notifications</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div key={notif.id} className="p-4 rounded-2xl hover:bg-muted/50 transition-colors flex gap-4 items-start group">
                            <div className={cn(
                              "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                              notif.type === 'alert' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                            )}>
                              {notif.type === 'alert' ? <Package className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-black leading-tight">{notif.title}</p>
                              <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">{notif.message}</p>
                              <p className="text-[8px] text-slate-400 uppercase font-bold">{new Date(notif.createdAt).toLocaleTimeString()}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>

              <div className="flex items-center gap-3 p-1 pr-4 bg-muted/30 rounded-full border border-border/50">
                <Avatar className="h-8 w-8 border-2 border-primary/20">
                  <AvatarImage src={profileImage || ""} />
                  <AvatarFallback className="bg-primary text-white font-black">
                    {name ? name[0] : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col -space-y-1">
                  <span className="text-[10px] font-black text-slate-900 leading-tight">{name}</span>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{role} Node</span>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 md:p-10 overflow-x-hidden custom-scrollbar">
            {renderSection()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
