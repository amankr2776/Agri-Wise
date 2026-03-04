
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
  MessageCircle,
  CheckCircle2
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
import { useAppState } from "@/lib/app-state";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

// Section Components
import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { CropDiagnostics } from "@/components/diagnostics/CropDiagnostics";
import { MarketIntelligence } from "@/components/market/MarketIntelligence";
import { MandiLink } from "@/components/logistics/MandiLink";
import { KisanNetwork } from "@/components/social/KisanNetwork";
import { ExpertVerificationPortal } from "@/components/experts/ExpertVerificationPortal";
import { FleetManagement } from "@/components/logistics/FleetManagement";
import { SettingsView } from "@/components/settings/SettingsView";

export default function KisanMitraApp() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { 
    role, 
    isAuthenticated, 
    logout, 
    notifications, 
    markNotificationsAsRead,
    name,
    profileImage 
  } = useAppState();
  const [activeSection, setActiveSection] = useState("dashboard");

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (role === "Logistics") setActiveSection("fleet");
    else if (role === "Expert") setActiveSection("expert-portal");
    else setActiveSection("dashboard");
  }, [role]);

  if (!isAuthenticated || !role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Verifying Identity...</p>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard": return <DashboardHome onNavigate={setActiveSection} />;
      case "diagnostics": return <CropDiagnostics />;
      case "market": return <MarketIntelligence />;
      case "logistics": return <MandiLink />;
      case "network": return <KisanNetwork />;
      case "expert-portal": return <ExpertVerificationPortal />;
      case "fleet": return <FleetManagement />;
      case "settings": return <SettingsView />;
      default: return <DashboardHome onNavigate={setActiveSection} />;
    }
  };

  const menuItems = [
    { id: "dashboard", label: t("dashboard"), icon: LayoutDashboard, roles: ["Farmer", "Expert", "Logistics"] },
    { id: "diagnostics", label: t("diagnostics"), icon: Leaf, roles: ["Farmer", "Expert", "Logistics"] },
    { id: "market", label: t("market"), icon: TrendingUp, roles: ["Farmer", "Expert", "Logistics"] },
    { id: "expert-portal", label: t("verification_portal"), icon: FlaskConical, roles: ["Expert"] },
    { id: "fleet", label: t("fleet_hub"), icon: Truck, roles: ["Logistics"] },
    { id: "logistics", label: t("mandi_link"), icon: Package, roles: ["Farmer"] },
    { id: "network", label: t("network"), icon: Users, roles: ["Farmer", "Expert", "Logistics"] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(role));

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
              {filteredMenu.map((item) => (
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
            <SidebarMenuButton 
              isActive={activeSection === "settings"}
              onClick={() => setActiveSection("settings")}
              tooltip={t("settings")} 
              className="h-12 data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
            >
              <Settings className="h-5 w-5" /> <span>{t("settings")}</span>
            </SidebarMenuButton>
            <SidebarMenuButton 
              tooltip={t("logout")} 
              onClick={() => logout()}
              className="h-12 text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-5 w-5" /> <span>{t("logout")}</span>
            </SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col">
          <header className="h-16 flex items-center justify-between px-6 border-b glass-card sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <div className="hidden md:flex items-center">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">National Agricultural Grid</h2>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Popover onOpenChange={(open) => open && markNotificationsAsRead()}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative touch-target rounded-full hover:bg-muted">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge className="absolute top-1 right-1 h-4 w-4 flex items-center justify-center p-0 bg-destructive text-[9px] border-2 border-white">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 rounded-3xl overflow-hidden shadow-2xl border-none">
                  <div className="bg-primary p-4 text-white">
                    <h4 className="font-black text-xs uppercase tracking-widest">Grid Notifications</h4>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        <CheckCircle2 className="h-10 w-10 mx-auto mb-2 opacity-20" />
                        <p className="text-xs font-bold uppercase tracking-tighter">Your grid is clear</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="p-4 border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer">
                          <div className="flex gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                              {n.type === 'like' ? <MessageCircle className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-slate-800">{n.message}</p>
                              <p className="text-[10px] text-muted-foreground uppercase font-black">{n.from}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              <div className="h-8 w-px bg-border hidden sm:block" />
              <div className="flex items-center gap-3 bg-muted/30 px-3 py-1.5 rounded-full border border-border/50">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-black leading-none uppercase">{name || role}</p>
                  <p className="text-[9px] text-primary font-bold mt-1 tracking-tighter uppercase">Verified {role}</p>
                </div>
                <Avatar className="h-8 w-8 border-2 border-primary/20 shadow-sm">
                  <AvatarImage src={profileImage || ""} />
                  <AvatarFallback className="bg-primary text-white font-black">{(name || role)[0]}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 md:p-8 animate-in fade-in duration-500 overflow-x-hidden">
            {renderSection()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
