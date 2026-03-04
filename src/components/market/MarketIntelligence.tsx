
'use client';

import React, { useState, useMemo } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Search, 
  Zap, 
  Loader2, 
  ArrowRight,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

export function MarketIntelligence() {
  const { t } = useTranslation();
  const [selectedCrop, setSelectedCrop] = useState("Wheat");
  const [selectedState, setSelectedState] = useState("Punjab");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const chartData = [
    { month: "May", price: 1800 },
    { month: "Jun", price: 1950 },
    { month: "Jul", price: 1700 },
    { month: "Aug", price: 2100 },
    { month: "Sep", price: 2450 },
    { month: "Oct", price: 2200 },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap gap-6 items-end">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase ml-4">{t("commodity")}</Label>
          <Select value={selectedCrop} onValueChange={setSelectedCrop}>
            <SelectTrigger className="w-64 rounded-2xl h-12 glass-card font-black border-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Wheat">Wheat</SelectItem>
              <SelectItem value="Paddy">Paddy</SelectItem>
              <SelectItem value="Cotton">Cotton</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase ml-4">{t("jurisdiction")}</Label>
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="w-64 rounded-2xl h-12 glass-card font-black border-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Punjab">Punjab</SelectItem>
              <SelectItem value="Haryana">Haryana</SelectItem>
              <SelectItem value="Maharashtra">Maharashtra</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-8 glass-card rounded-[3rem] p-10 border-none">
          <CardHeader className="p-0 mb-10 flex flex-row justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-black flex items-center gap-3">
                <TrendingUp className="h-7 w-7 text-primary" /> {selectedCrop} {t("market")}
              </CardTitle>
            </div>
            <Badge variant="outline" className="font-black">{t("mandi_price")}</Badge>
          </CardHeader>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={6} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-4 rounded-[3rem] bg-slate-950 p-10 text-white border-none shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-10 flex flex-col h-full">
            <div className="space-y-4">
              <Badge className="bg-primary/20 text-primary border-none">{t("forecast")}</Badge>
              <p className="text-[10px] font-black text-slate-500 uppercase">{t("recommended_action")}</p>
              <h3 className="text-5xl font-black tracking-tighter text-primary">HOLD</h3>
              <p className="text-slate-400 italic">Prices are projected to peak in late September due to seasonal supply shifts.</p>
            </div>
            <Button className="mt-auto h-14 rounded-2xl font-black text-lg bg-primary hover:bg-primary/90">
              Apply Strategy <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return <label className={cn("text-muted-foreground", className)}>{children}</label>;
}
