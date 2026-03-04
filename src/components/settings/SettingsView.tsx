'use client';

import React, { useState, useEffect } from "react";
import { 
  User, 
  Moon, 
  Sun, 
  Languages, 
  MapPin, 
  Save, 
  ShieldCheck, 
  Settings,
  Eye,
  Check
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useAppState } from "@/lib/app-state";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function SettingsView() {
  const { toast } = useToast();
  const { language, setLanguage, role } = useAppState();
  
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [theme, setTheme] = useState("farmer");

  useEffect(() => {
    // Load local storage profile data
    const savedName = localStorage.getItem("km_user_name") || "Rajesh Kumar";
    const savedCity = localStorage.getItem("km_user_city") || "Ludhiana";
    const savedTheme = localStorage.getItem("km_theme") || "farmer";
    
    setName(savedName);
    setCity(savedCity);
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const handleSave = () => {
    localStorage.setItem("km_user_name", name);
    localStorage.setItem("km_user_city", city);
    localStorage.setItem("km_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    
    toast({
      title: "Settings Saved!",
      description: "Your professional profile and preferences have been updated.",
    });
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4">
      <header className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Settings className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight">Account Intelligence</h2>
          <p className="text-muted-foreground font-medium">Manage your digital identity and system interface.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Profile Section */}
          <Card className="glass-card rounded-[2.5rem] overflow-hidden border-none">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="flex items-center gap-3 text-xl font-black">
                <User className="h-5 w-5 text-primary" />
                Farmer Profile
              </CardTitle>
              <CardDescription className="font-medium">Update your core identity details.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Display Name</Label>
                  <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 rounded-xl bg-background/50 border-none font-bold" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Base City</Label>
                  <Input 
                    value={city} 
                    onChange={(e) => setCity(e.target.value)}
                    className="h-12 rounded-xl bg-background/50 border-none font-bold" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Language Preference</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="h-12 rounded-xl bg-background/50 border-none font-bold">
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4 text-primary" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English (Global)</SelectItem>
                    <SelectItem value="Hindi">हिन्दी (Hindi)</SelectItem>
                    <SelectItem value="Punjabi">ਪੰਜਾਬी (Punjabi)</SelectItem>
                    <SelectItem value="Bengali">বাংলা (Bengali)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card className="glass-card rounded-[2.5rem] overflow-hidden border-none">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="flex items-center gap-3 text-xl font-black">
                <Eye className="h-5 w-5 text-primary" />
                Visual Interface
              </CardTitle>
              <CardDescription className="font-medium">Optimize the display for your environment.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: "farmer", label: "Farmer Mode", icon: Sun, desc: "Pale Green Soft Light" },
                  { id: "dark", label: "Dark Mode", icon: Moon, desc: "Low Light Night Ops" },
                  { id: "contrast", label: "High Contrast", icon: ShieldCheck, desc: "Maximum Sun Visibility" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleThemeChange(t.id)}
                    className={cn(
                      "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all gap-2",
                      theme === t.id 
                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105" 
                        : "bg-background/50 border-transparent hover:border-primary/20"
                    )}
                  >
                    <t.icon className={cn("h-6 w-6", theme === t.id ? "text-white" : "text-primary")} />
                    <span className="font-bold text-xs">{t.label}</span>
                    <span className={cn("text-[8px] font-medium opacity-60", theme === t.id ? "text-white" : "")}>{t.desc}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="glass-card rounded-[2.5rem] border-none bg-primary text-white p-8">
            <div className="space-y-6">
              <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black">Identity Verified</h3>
                <p className="text-white/80 text-xs font-medium leading-relaxed">
                  Your profile is verified as a <span className="font-black underline">{role}</span> under the KisanMitra National Grid.
                </p>
              </div>
              <Button 
                onClick={handleSave}
                className="w-full h-12 rounded-xl bg-white text-primary hover:bg-white/90 font-black gap-2 shadow-xl"
              >
                <Save className="h-4 w-4" /> Save All Intelligence
              </Button>
              <Button variant="ghost" className="w-full text-white hover:bg-white/10 font-bold">
                Reset Defaults
              </Button>
            </div>
          </Card>

          <Card className="glass-card rounded-[2.5rem] border-none p-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Notifications</h4>
              <Switch checked />
            </div>
            <p className="text-xs text-muted-foreground font-medium">Receive real-time alerts for pest outbreaks and price spikes.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}