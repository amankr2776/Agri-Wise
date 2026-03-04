
'use client';

import React, { useState, useEffect } from "react";
import { 
  User, 
  Languages, 
  MapPin, 
  Save, 
  ShieldCheck, 
  Settings,
  Upload,
  Eye
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppState, AppLanguage } from "@/lib/app-state";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";

const LANGUAGES: AppLanguage[] = [
  "English", "Hindi", "Bhojpuri", "Punjabi", "Haryanvi", 
  "Bengali", "Marathi", "Rajasthani", "Gujarati", "Pahadi", 
  "Kannada", "Tamil", "Telugu", "Malayalam", "Oriya", "Magahi"
];

export function SettingsView() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { 
    language, setLanguage, name, setName, city, setCity, profileImage, setProfileImage 
  } = useAppState();
  
  const [localName, setLocalName] = useState(name);
  const [localCity, setLocalCity] = useState(city);

  const handleSave = () => {
    setName(localName);
    setCity(localCity);
    toast({ title: t("save"), description: "Profile updated successfully." });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <header className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Settings className="h-8 w-8" />
        </div>
        <h2 className="text-3xl font-black tracking-tight">{t("settings")}</h2>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card className="glass-card rounded-[2.5rem] border-none shadow-xl">
            <CardHeader className="p-8">
              <CardTitle className="flex items-center gap-3 text-xl font-black">
                <User className="h-5 w-5 text-primary" /> {t("profile")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">{t("profile")}</Label>
                  <Input value={localName} onChange={(e) => setLocalName(e.target.value)} className="h-12 glass-card font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground">City</Label>
                  <Input value={localCity} onChange={(e) => setLocalCity(e.target.value)} className="h-12 glass-card font-bold" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">{t("language")}</Label>
                <Select value={language} onValueChange={(v: AppLanguage) => setLanguage(v)}>
                  <SelectTrigger className="h-12 glass-card font-bold">
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4 text-primary" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {LANGUAGES.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} className="w-full h-12 rounded-xl font-black uppercase">{t("save")}</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
