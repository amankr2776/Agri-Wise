'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserRole, useAppState } from "@/lib/app-state";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
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
  Accessibility,
  CloudSun,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowUpRight,
  LogOut,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
      toast({ title: "Signed out", description: "Come back soon!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Logout failed" });
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground font-headline animate-pulse">Syncing farm data...</p>
        </div>
      </div>
    );
  }

  if (!user) return null; // Guard will redirect

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
            <p className="text-muted-foreground max-w-md mx-auto text-lg">
              Empowering agriculture with AI-driven insights, community wisdom, and market intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROLES.map((r) => (
              <Card 
                key={r.id} 
                className={`cursor-pointer transition-all hover:scale-105 border-2 ${role === r.id ? 'border-primary ring-4 ring-primary/10' : 'border-transparent'}`}
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
              Enter Dashboard <ChevronRight className="ml-2 h-6 w-6" />
            </Button>

            <div className="flex items-center gap-4 text-sm text-muted-foreground bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm">
              <Accessibility className="h-4 w-4" />
              <span>Voice commands & Audio support enabled for <b>{language}</b></span>
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
                  <TrendingUpIcon /> <span>Market Intelligence</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'logistics'} onClick={() => setActiveTab('logistics')} tooltip="Logistics">
                  <Truck /> <span>Logistics Hub</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'social'} onClick={() => setActiveTab('social')} tooltip="Community">
                  <Users /> <span>Kisan Network</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 space-y-2">
            <div className="flex flex-col gap-1 group-data-[collapsible=icon]:hidden mb-2">
               <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest px-2 opacity-70">Role: {role}</div>
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
              <h1 className="text-xl font-bold font-headline capitalize tracking-tight">{activeTab === 'dashboard' ? 'Market Overview' : activeTab}</h1>
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
                <AvatarImage src={`https://picsum.photos/seed/farmer-${role}/40/40`} />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-y-auto bg-muted/20">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-gradient-to-br from-primary to-primary/80 text-white relative overflow-hidden group border-none shadow-xl shadow-primary/20">
                      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform pointer-events-none">
                        <Leaf className="h-48 w-48" />
                      </div>
                      <CardContent className="p-8 space-y-6">
                        <div className="space-y-2">
                          <h2 className="text-4xl font-bold font-headline">Shubh Prabhat, {role}!</h2>
                          <p className="max-w-md text-primary-foreground/90 text-lg">
                            Today's agricultural forecast looks promising. Market prices for Wheat are rising.
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <Button className="bg-white text-primary hover:bg-white/90 font-bold px-6 rounded-full">View Mandi Details</Button>
                          <Button variant="outline" className="bg-transparent border-white/40 text-white hover:bg-white/10 rounded-full">Check Forecast</Button>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="border-none shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-bold text-muted-foreground flex items-center justify-between uppercase tracking-wider">
                            Weather Today
                            <CloudSun className="h-4 w-4 text-orange-400" />
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-3xl font-bold">28°C</div>
                              <div className="text-sm text-muted-foreground">Clear Sky • Nashik, MH</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-bold text-primary">Good for Sowing</div>
                              <div className="text-xs text-muted-foreground">Humidity: 42%</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-none shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-bold text-muted-foreground flex items-center justify-between uppercase tracking-wider">
                            Market Insight
                            <TrendingUpIcon className="h-4 w-4 text-primary" />
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-3xl font-bold">₹2,450/q</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <ArrowUpRight className="h-3 w-3 text-primary" /> +₹120 since yesterday
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-primary/10 text-primary border-none text-[10px]">Onion Market</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Tabs defaultValue="overview" className="space-y-4">
                      <TabsList className="bg-white border p-1 rounded-full w-auto">
                        <TabsTrigger value="overview" className="rounded-full px-6">Community Updates</TabsTrigger>
                        <TabsTrigger value="alerts" className="rounded-full px-6">Local Alerts</TabsTrigger>
                      </TabsList>
                      <TabsContent value="overview" className="mt-4">
                        <CommunityFeed />
                      </TabsContent>
                      <TabsContent value="alerts" className="mt-4">
                        <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-muted">
                           <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                           <h3 className="font-bold text-lg">No Critical Alerts</h3>
                           <p className="text-muted-foreground text-sm">Everything looks stable in your region today.</p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  {/* Right Column - Voice Assistant sticky */}
                  <div className="lg:col-span-1">
                    <div className="sticky top-20 space-y-6">
                      <VoiceAssistant />
                      
                      <Card className="border-none shadow-md bg-accent/5 overflow-hidden">
                        <CardHeader className="p-4 bg-accent/10 border-b border-accent/10">
                          <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            Expert Tips of the Day
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                          <div className="text-sm leading-relaxed text-muted-foreground">
                            "Use Neem cake as soil fertilizer to prevent root-knot nematodes in your vegetable patches."
                          </div>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src="https://picsum.photos/seed/expert1/40/40" />
                              <AvatarFallback>Dr</AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-bold">Dr. Sharma, Soil Scientist</span>
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
  { id: "Farmer", title: "Farmer", icon: UserCircle, color: "bg-primary" },
  { id: "Expert", title: "Agri Expert", icon: ShieldCheck, color: "bg-blue-600" },
  { id: "Authority", title: "Admin", icon: BarChart3, color: "bg-slate-700" },
  { id: "Logistics", title: "Transport", icon: Truck, color: "bg-orange-600" },
];

const TrendingUpIcon = ({className}: {className?: string}) => <TrendingUp className={className} />;
