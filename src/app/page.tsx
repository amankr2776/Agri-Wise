
"use client";

import React, { useState } from "react";
import { UserRole, useAppState } from "@/lib/app-state";
import { 
  Leaf, 
  UserCircle, 
  ShieldCheck, 
  BarChart3, 
  Truck, 
  Users, 
  Bot, 
  Settings, 
  ChevronRight,
  Accessibility
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { DiagnosticTool } from "@/components/diagnostics/DiagnosticTool";
import { MarketIntelligence } from "@/components/market/MarketIntelligence";
import { CommunityFeed } from "@/components/social/CommunityFeed";
import { LogisticsMarket } from "@/components/logistics/LogisticsMarket";
import { VoiceAssistant } from "@/components/voice/VoiceAssistant";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";

export default function AgriWiseApp() {
  const { role, setRole, language, setLanguage } = useAppState();
  const [isAppStarted, setIsAppStarted] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  if (!isAppStarted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-4xl w-full space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary rounded-2xl shadow-xl shadow-primary/20">
                <Leaf className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-headline font-bold text-primary">AgriWise</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Empowering agriculture with AI-driven insights, community wisdom, and market intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROLES.map((r) => (
              <Card 
                key={r.id} 
                className={`cursor-pointer transition-all hover:scale-105 border-2 ${role === r.id ? 'border-primary' : 'border-transparent'}`}
                onClick={() => setRole(r.id)}
              >
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className={`p-4 rounded-full ${r.color} text-white`}>
                    <r.icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-bold">{r.title}</h3>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center">
            <Button 
              size="lg" 
              className="h-14 px-12 text-xl font-bold rounded-full bg-primary hover:bg-primary/90"
              onClick={() => setIsAppStarted(true)}
            >
              Get Started <ChevronRight className="ml-2 h-6 w-6" />
            </Button>
          </div>

          <div className="flex justify-center items-center gap-4 text-sm text-muted-foreground">
            <Accessibility className="h-4 w-4" />
            <span>Voice commands & Audio support enabled for {language}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar variant="inset" collapsible="icon">
          <SidebarHeader className="p-4 flex items-center gap-3">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white shrink-0">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="font-headline font-bold text-xl text-primary group-data-[collapsible=icon]:hidden">AgriWise</span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} tooltip="Dashboard">
                  <BarChart3 /> <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'diagnostics'} onClick={() => setActiveTab('diagnostics')} tooltip="Diagnostics">
                  <Leaf /> <span>AI Diagnostics</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'market'} onClick={() => setActiveTab('market')} tooltip="Markets">
                  <TrendingUp /> <span>Market Intelligence</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'logistics'} onClick={() => setActiveTab('logistics')} tooltip="Logistics">
                  <Truck /> <span>Logistics</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'social'} onClick={() => setActiveTab('social')} tooltip="Community">
                  <Users /> <span>Kisan Network</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <div className="flex flex-col gap-2 group-data-[collapsible=icon]:hidden">
               <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest px-2">Role: {role}</div>
               <SidebarMenuButton tooltip="Settings"><Settings /> <span>Settings</span></SidebarMenuButton>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between px-6 border-b bg-white/50 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-xl font-bold font-headline capitalize">{activeTab}</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">Language:</span>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-[120px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Hindi">हिन्दी</SelectItem>
                    <SelectItem value="Punjabi">ਪੰਜਾਬੀ</SelectItem>
                    <SelectItem value="Bengali">বাংলা</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="icon" className="rounded-full">
                <Bot className="h-5 w-5 text-primary" />
              </Button>
              <Avatar className="h-8 w-8 ring-2 ring-primary/20 ring-offset-2">
                <AvatarImage src="https://picsum.photos/seed/profile/40/40" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-primary text-white col-span-1 md:col-span-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                      <Leaf className="h-32 w-32" />
                    </div>
                    <CardContent className="p-8 space-y-4">
                      <h2 className="text-3xl font-bold">Welcome back, {role}!</h2>
                      <p className="max-w-md text-primary-foreground/90">
                        Today's overview: Market prices for Wheat are rising in your area. Consider early harvest for better margins.
                      </p>
                      <Button className="bg-white text-primary hover:bg-white/90">View Market Details</Button>
                    </CardContent>
                  </Card>
                  
                  <VoiceAssistant />
                </div>

                <Tabs defaultValue="overview" className="space-y-4">
                  <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="overview">Daily Feed</TabsTrigger>
                    <TabsTrigger value="alerts">Outbreak Alerts</TabsTrigger>
                    <TabsTrigger value="weather">Weather Sync</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview">
                    <CommunityFeed />
                  </TabsContent>
                  <TabsContent value="alerts">
                    <MarketIntelligence />
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {activeTab === 'diagnostics' && <DiagnosticTool />}
            {activeTab === 'market' && <MarketIntelligence />}
            {activeTab === 'logistics' && <LogisticsMarket />}
            {activeTab === 'social' && <CommunityFeed />}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

const ROLES: { id: UserRole; title: string; icon: any; color: string }[] = [
  { id: "Farmer", title: "Farmer", icon: UserCircle, color: "bg-primary" },
  { id: "Expert", title: "Expert", icon: ShieldCheck, color: "bg-blue-600" },
  { id: "Authority", title: "Authority", icon: BarChart3, color: "bg-red-600" },
  { id: "Logistics", title: "Logistics", icon: Truck, color: "bg-orange-600" },
];

const TrendingUp = ({className}: {className?: string}) => <BarChart3 className={className} />;
