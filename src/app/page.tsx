
'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserRole, useAppState } from "@/lib/app-state";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { 
  Leaf, 
  ShieldCheck, 
  BarChart3, 
  Truck, 
  Users, 
  Bot, 
  Settings, 
  ChevronRight,
  Accessibility,
  CloudSun,
  TrendingUp,
  ArrowUpRight,
  LogOut,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function AgriWiseApp() {
  const { role, setRole, language, setLanguage } = useAppState();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isAppStarted, setIsAppStarted] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Authentication Guard
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Signed out", description: "Session ended." });
    } catch (error) {
      toast({ variant: "destructive", title: "Logout failed" });
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground font-headline animate-pulse">Initializing professional portal...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

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
            <h1 className="text-5xl font-headline font-bold text-primary">AgriWise</h1>
            <p className="text-muted-foreground max-w-lg mx-auto text-lg font-medium">
              Professional Agricultural Intelligence Portal for Experts, Logistics, and Authorities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {ROLES.map((r) => (
              <Card 
                key={r.id} 
                className={`cursor-pointer transition-all hover:scale-105 border-2 ${role === r.id ? 'border-primary ring-4 ring-primary/10' : 'border-transparent shadow-md'}`}
                onClick={() => setRole(r.id)}
              >
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className={`p-4 rounded-2xl ${r.color} text-white shadow-lg`}>
                    <r.icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-bold text-lg">{r.title}</h3>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-col items-center gap-6">
            <Button 
              size="lg" 
              className="h-16 px-16 text-xl font-bold rounded-full bg-primary hover:bg-primary/90 shadow-xl shadow-primary/30 transition-all hover:translate-y-[-2px]"
              onClick={() => setIsAppStarted(true)}
            >
              Access Dashboard <ChevronRight className="ml-2 h-6 w-6" />
            </Button>

            <div className="flex items-center gap-4 text-sm text-muted-foreground bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm border">
              <Accessibility className="h-4 w-4" />
              <span>Multi-lingual Professional Tools enabled for <b>{language}</b></span>
            </div>
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
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white shrink-0 shadow-md">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="font-headline font-bold text-xl text-primary group-data-[collapsible=icon]:hidden">AgriWise</span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} tooltip="Overview">
                  <BarChart3 /> <span>System Overview</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'diagnostics'} onClick={() => setActiveTab('diagnostics')} tooltip="Case Review">
                  <ShieldCheck /> <span>Expert Diagnostics</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'market'} onClick={() => setActiveTab('market')} tooltip="Economics">
                  <TrendingUp /> <span>Market Intelligence</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'logistics'} onClick={() => setActiveTab('logistics')} tooltip="Supply Chain">
                  <Truck /> <span>Logistics Hub</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'social'} onClick={() => setActiveTab('social')} tooltip="Network">
                  <Users /> <span>Agri Network</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 space-y-2">
            <div className="flex flex-col gap-1 group-data-[collapsible=icon]:hidden mb-2">
               <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest px-2 opacity-70">Active Role: {role}</div>
               <div className="text-[10px] text-primary font-bold px-2 truncate">{user?.email || user?.phoneNumber}</div>
            </div>
            <SidebarMenuButton tooltip="Settings"><Settings /> <span>Settings</span></SidebarMenuButton>
            <SidebarMenuButton 
              tooltip="Sign Out" 
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut /> <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between px-6 border-b bg-white/50 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-xl font-bold font-headline capitalize tracking-tight">{activeTab === 'dashboard' ? 'Professional Dashboard' : activeTab}</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">Language:</span>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-[120px] h-8 text-xs rounded-full">
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
              <Button variant="outline" size="icon" className="rounded-full h-8 w-8 bg-white border-primary/20 text-primary hover:bg-primary hover:text-white transition-all">
                <Bot className="h-4 w-4" />
              </Button>
              <Avatar className="h-8 w-8 ring-2 ring-primary/20 ring-offset-2 cursor-pointer shadow-sm">
                <AvatarImage src={`https://picsum.photos/seed/partner-${role}/40/40`} />
                <AvatarFallback>P</AvatarFallback>
              </Avatar>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-y-auto bg-muted/10">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden border-none shadow-2xl">
                      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                        <ShieldCheck className="h-64 w-64" />
                      </div>
                      <CardContent className="p-8 space-y-6 relative z-10">
                        <div className="space-y-2">
                          <Badge className="bg-primary/20 text-primary border-primary/30 mb-2">Verified Professional</Badge>
                          <h2 className="text-4xl font-bold font-headline">Welcome, {role}</h2>
                          <p className="max-w-md text-slate-300 text-lg">
                            Monitoring regional agricultural health and market stability. 12 new diagnostic cases pending review.
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <Button className="bg-primary text-white hover:bg-primary/90 font-bold px-6 rounded-full shadow-lg shadow-primary/20" onClick={() => setActiveTab('diagnostics')}>Review Pending Cases</Button>
                          <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700 rounded-full" onClick={() => setActiveTab('market')}>Market Analytics</Button>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="border-none shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="pb-2">
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between">
                            Regional Outlook
                            <CloudSun className="h-4 w-4 text-orange-400" />
                          </h4>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-3xl font-bold">Optimal</div>
                              <div className="text-sm text-muted-foreground">Soil Health • North Zone</div>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-green-100 text-green-700 border-none">Stable</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-none shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="pb-2">
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between">
                            Market Index
                            <TrendingUp className="h-4 w-4 text-primary" />
                          </h4>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-3xl font-bold">+4.2%</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <ArrowUpRight className="h-3 w-3 text-primary" /> Agri-Commodities Trend
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-primary/10 text-primary border-none">Onion / Cotton</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Tabs defaultValue="overview" className="space-y-4">
                      <TabsList className="bg-white border p-1 rounded-full w-auto shadow-sm">
                        <TabsTrigger value="overview" className="rounded-full px-6">Network Intelligence</TabsTrigger>
                        <TabsTrigger value="alerts" className="rounded-full px-6">High Risk Zones</TabsTrigger>
                      </TabsList>
                      <TabsContent value="overview" className="mt-4">
                        <CommunityFeed />
                      </TabsContent>
                      <TabsContent value="alerts" className="mt-4">
                        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-muted">
                           <ShieldCheck className="h-16 w-16 text-primary mx-auto mb-4 opacity-20" />
                           <h3 className="font-bold text-xl">All Zones Clear</h3>
                           <p className="text-muted-foreground text-sm max-w-xs mx-auto">No critical pest outbreaks or supply chain disruptions reported in the last 24 hours.</p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  <div className="lg:col-span-1">
                    <div className="sticky top-20 space-y-6">
                      <VoiceAssistant />
                      
                      <Card className="border-none shadow-lg bg-white overflow-hidden">
                        <CardHeader className="p-4 bg-muted/50 border-b">
                          <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Bot className="h-4 w-4 text-primary" />
                            AI Analyst Briefing
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                          <div className="text-sm leading-relaxed text-muted-foreground italic">
                            "Data indicates a potential logistics bottleneck in the Nashik corridor due to monsoon delays. Recommend proactive rerouting for perishable transport."
                          </div>
                          <div className="pt-4 border-t flex items-center justify-between">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Confidence: 94%</div>
                            <Button variant="link" size="sm" className="h-auto p-0 text-xs font-bold text-primary">View Report</Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
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
  { id: "Expert", title: "Agri Expert", icon: ShieldCheck, color: "bg-blue-600" },
  { id: "Authority", title: "Admin / Gov", icon: BarChart3, color: "bg-slate-700" },
  { id: "Logistics", title: "Supply Chain", icon: Truck, color: "bg-orange-600" },
];
