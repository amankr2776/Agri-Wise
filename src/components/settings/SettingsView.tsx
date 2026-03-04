
'use client';

import React, { useState } from "react";
import { 
  User, 
  Languages, 
  MapPin, 
  Save, 
  ShieldCheck, 
  Settings,
  Upload,
  Palette,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppState, AppLanguage, AppTheme } from "@/lib/app-state";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

const LANGUAGES: AppLanguage[] = [
  "English", "Hindi", "Bhojpuri", "Punjabi", "Haryanvi", 
  "Bengali", "Marathi", "Rajasthani", "Gujarati", "Pahadi", 
  "Kannada", "Tamil", "Telugu", "Malayalam", "Oriya", "Magahi"
];

const THEMES = [
  { id: "farmer", label: "Farmer Mode (Green)", icon: Palette },
  { id: "dark", label: "Dark Mode", icon: Palette },
  { id: "contrast", label: "High Contrast", icon: ShieldCheck },
];

export function SettingsView() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { 
    language, setLanguage, theme, setTheme, name, setName, city, setCity, profileImage, setProfileImage 
  } = useAppState();
  
  const [localName, setLocalName] = useState(name);
  const [localCity, setLocalCity] = useState(city);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setName(localName);
      setCity(localCity);
      setIsSaving(false);
      toast({ title: "Settings Saved!", description: "Your grid profile has been updated." });
    }, 800);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(file);
      toast({ title: "Photo Updated", description: "Your profile image has been synchronized." });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4">
      <header className="flex items-center gap-6">
        <div className="h-16 w-16 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
          <Settings className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tighter">{t("settings")}</h2>
          <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-[0.2em]">Management & Grid Personalization</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <Card className="glass-card rounded-[3rem] p-10 flex flex-col items-center text-center space-y-8 border-none h-fit">
          <div className="relative group">
            <Avatar className="h-40 w-40 border-8 border-background shadow-2xl">
              <AvatarImage src={profileImage || ""} />
              <AvatarFallback className="bg-primary text-white text-5xl font-black">{name[0]}</AvatarFallback>
            </Avatar>
            <label className="absolute bottom-2 right-2 h-12 w-12 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-xl">
              <Upload className="h-5 w-5" />
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black">{name}</h3>
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{city} Sector</p>
          </div>
          <div className="pt-6 border-t w-full">
            <Badge variant="outline" className="rounded-full px-6 py-2 border-primary/20 text-primary font-black uppercase tracking-widest text-[10px]">
              Verified Agricultural ID
            </Badge>
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-8">
          <Card className="glass-card rounded-[3rem] border-none p-10 space-y-10">
            <div className="space-y-8">
              <h3 className="flex items-center gap-3 text-2xl font-black tracking-tight">
                <User className="h-6 w-6 text-primary" /> {t("profile")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-4">{t("full_name")}</Label>
                  <Input value={localName} onChange={(e) => setLocalName(e.target.value)} className="h-14 rounded-2xl bg-muted/30 border-none font-black text-lg px-6" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-4">{t("city")}</Label>
                  <Input value={localCity} onChange={(e) => setLocalCity(e.target.value)} className="h-14 rounded-2xl bg-muted/30 border-none font-black text-lg px-6" />
                </div>
              </div>
            </div>

            <div className="space-y-8 pt-10 border-t">
              <h3 className="flex items-center gap-3 text-2xl font-black tracking-tight">
                <Languages className="h-6 w-6 text-primary" /> {t("language")}
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <Select value={language} onValueChange={(v: AppLanguage) => setLanguage(v)}>
                  <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-none font-black text-lg px-6">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl max-h-80">
                    {LANGUAGES.map(lang => (
                      <SelectItem key={lang} value={lang} className="rounded-xl font-bold">{lang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-8 pt-10 border-t">
              <h3 className="flex items-center gap-3 text-2xl font-black tracking-tight">
                <Palette className="h-6 w-6 text-primary" /> {t("theme")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {THEMES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id as AppTheme)}
                    className={cn(
                      "p-6 rounded-3xl border-2 transition-all text-center flex flex-col items-center gap-4",
                      theme === t.id 
                        ? "border-primary bg-primary/5 shadow-inner" 
                        : "border-transparent bg-muted/30 hover:bg-muted/50"
                    )}
                  >
                    <t.icon className={cn("h-8 w-8", theme === t.id ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-xs font-black uppercase tracking-widest">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-10 border-t">
              <Button onClick={handleSave} disabled={isSaving} className="w-full h-16 rounded-[2rem] font-black text-xl shadow-xl shadow-primary/20">
                {isSaving ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="h-6 w-6 mr-2" />}
                {t("update_profile")}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
