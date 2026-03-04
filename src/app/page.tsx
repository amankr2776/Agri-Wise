
'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Leaf, 
  TrendingUp, 
  Truck, 
  Users, 
  Bell, 
  Settings,
  LogOut,
  FlaskConical,
  Loader2,
  Package,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Globe
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
import { Badge } from "@/components/ui/badge";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppState } from "@/lib/app-state";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { useFirestore, useUser } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";

// Section Components
import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { CropDiagnostics } from "@/components/diagnostics/CropDiagnostics";
import { MarketIntelligence } from "@/components/market/MarketIntelligence";
import { MandiLink } from "@/components/logistics/MandiLink";
import { KisanNetwork } from "@/components/social/KisanNetwork";
import { ExpertVerificationPortal } from "@/components/experts/ExpertVerificationPortal";
import { FleetManagement } from "@/components/logistics/FleetManagement";
import { SettingsView } from "@/components/settings/SettingsView";
import { MinistryIntelligence } from "@/components/gov/MinistryIntelligence";

export default function KisanMitraApp() {
  const router = useRouter();
  const { t } = useTranslation();
  const firestore = useFirestore();
  const { user } = useUser();
  const { 
    role, 
    isAuthenticated, 
    logout, 
    notifications, 
    markNotificationsAsRead,
    name,
    city,
    profileImage 
  } = useAppState();
  const [activeSection, setActiveSection] = useState("dashboard");

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  // Sync user profile to Firestore for role-based security rules
  useEffect(() => {
    if (user && firestore && role) {
      const userRef = doc(firestore, "users", user.uid);
      setDocumentNonBlocking(userRef, {
        id: user.uid,
        role: role,
        firstName: name,
        city: city,
        lastActive: new Date().toISOString()
      }, { merge: true });
    }
  }, [user, firestore, role, name, city]);

  if (!isAuthenticated || !role) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  // Role-Based Section Rendering with Guard
  const renderSection = () => {
    switch (activeSection) {
      case "dashboard": return <DashboardHome onNavigate={setActiveSection} />;
      case "diagnostics": 
        if (role === "Logistics") return <DashboardHome onNavigate={setActiveSection} />;
        return <CropDiagnostics />;
      case "market": 
        if (role === "Logistics") return <DashboardHome onNavigate={setActiveSection} />;
        return <MarketIntelligence />;
      case "logistics": 
        if (role !== "Farmer") return <DashboardHome onNavigate={setActiveSection} />;
        return <MandiLink />;
      case "network": return <KisanNetwork />;
      case "expert-portal": 
        if (role !== "Expert" && role !== "Authority") return <DashboardHome onNavigate={setActiveSection} />;
        return <ExpertVerificationPortal />;
      case "surveillance":
        if (role !== "Expert" && role !== "Authority") return <DashboardHome onNavigate={setActiveSection} />;
        return <MinistryIntelligence />;
      case "fleet": 
        if (role !== "Logistics") return <DashboardHome onNavigate={setActiveSection} />;
        return <FleetManagement />;
      case "settings": return <SettingsView />;
      default: return <DashboardHome onNavigate={setActiveSection} />;
    }
  };

  const menuItems = [
    { id: "dashboard", label: t("dashboard"), icon: LayoutDashboard, roles: ["Farmer", "Expert", "Logistics", "Authority"] },
    { id: "diagnostics", label: t("diagnostics"), icon: Leaf, roles: ["Farmer", "Expert"] },
    { id: "market", label: t("market"), icon: TrendingUp, roles: ["Farmer", "Expert"] },
    { id: "expert-portal", label: t("verification_portal"), icon: FlaskConical, roles: ["Expert", "Authority"] },
    { id: "surveillance", label: "Surveillance", icon: Globe, roles: ["Expert", "Authority"] },
    { id: "fleet", label: t("fleet_hub"), icon: Truck, roles: ["Logistics"] },
    { id: "logistics", label: t("mandi_link"), icon: Package, roles: ["Farmer"] },
    { id: "network", label: t("network"), icon: Users, roles: ["Farmer", "Expert", "Logistics", "Authority"] },
  ];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <Sidebar collapsible="icon" className="border-r border-border bg-card">
          <SidebarHeader className="h-16 flex items-center px-4 border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Leaf className="h-6 w-6" />
              </div>
              <span className="font-black text-xl tracking-tight group-data-[collapsible=icon]:hidden">KisanMitra</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="py-4">
            <SidebarMenu>
              {menuItems.filter(i => i.roles.includes(role)).map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    isActive={activeSection === item.id}
                    onClick={() => setActiveSection(item.id)}
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
            <SidebarMenuButton onClick={() => setActiveSection("settings")} className="h-12 rounded-xl">
              <Settings className="h-5 w-5" /> <span className="font-bold">{t("settings")}</span>
            </SidebarMenuButton>
            <SidebarMenuButton onClick={() => logout()} className="h-12 text-destructive rounded-xl">
              <LogOut className="h-5 w-5" /> <span className="font-bold">{t("logout")}</span>
            </SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col">
          <header className="h-16 flex items-center justify-between px-6 border-b glass-card sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <div className="hidden md:flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{role} Intelligence Hub</h2>
              </div>
            </div>
            <div className="flex items-center gap-6">
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
                    {name ? name[0] : (role ? role[0] : 'U')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col -space-y-1">
                  <span className="text-[10px] font-black text-slate-900 leading-tight">{name}</span>
                  <div className="flex items-center gap-1">
                    {role === 'Expert' && <FlaskConical className="h-2.5 w-2.5 text-blue-500" />}
                    {role === 'Authority' && <ShieldCheck className="h-2.5 w-2.5 text-primary" />}
                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                      {role === 'Expert' ? 'Verified Expert' : role}
                    </span>
                  </div>
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
