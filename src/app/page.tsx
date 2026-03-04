
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

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !role) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

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
            <SidebarMenuButton onClick={() => setActiveSection("settings")} className="h-12">
              <Settings className="h-5 w-5" /> <span>{t("settings")}</span>
            </SidebarMenuButton>
            <SidebarMenuButton onClick={() => logout()} className="h-12 text-destructive">
              <LogOut className="h-5 w-5" /> <span>{t("logout")}</span>
            </SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col">
          <header className="h-16 flex items-center justify-between px-6 border-b glass-card sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground hidden md:block">Grid Intelligence</h2>
            </div>
            <div className="flex items-center gap-4">
              <Avatar className="h-8 w-8 border-2 border-primary/20">
                <AvatarImage src={profileImage || ""} />
                <AvatarFallback>{(name || role)[0]}</AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
            {renderSection()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
