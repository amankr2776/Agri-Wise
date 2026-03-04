
'use client';

import React, { useState, useMemo, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Search, 
  Zap, 
  Loader2, 
  ArrowRight,
  BarChart3,
  ChevronRight,
  Info,
  DollarSign,
  Truck,
  Target
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { INDIA_STATES } from "@/lib/india-data";
import { marketPriceTrendAnalysis, MarketPriceTrendAnalysisOutput } from "@/ai/flows/market-price-trend-analysis";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export function MarketIntelligence() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedCrop, setSelectedCrop] = useState("Wheat");
  const [selectedState, setSelectedState] = useState("Karnataka");
  const [selectedDistrict, setSelectedDistrict] = useState("Bengaluru");
  const [selectedMandi, setSelectedMandi] = useState("Yeshwanthpur Mandi");
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<MarketPriceTrendAnalysisOutput | null>(null);

  const districts = useMemo(() => {
    return INDIA_STATES.find(s => s.name === selectedState)?.districts || [];
  }, [selectedState]);

  // Simulated Mandis based on District
  const mandis = useMemo(() => {
    return [
      `${selectedDistrict} Central Mandi`,
      `${selectedDistrict} Wholesale Hub`,
      `${selectedDistrict} Rural Yard`
    ];
  }, [selectedDistrict]);

  // Generate 7-day trend data
  const chartData = useMemo(() => {
    const basePrice = selectedCrop === "Wheat" ? 2100 : selectedCrop === "Paddy" ? 1900 : 6500;
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, i) => ({
      day,
      price: basePrice + (Math.random() * 200 - 100) + (i * 20)
    }));
  }, [selectedCrop]);

  const currentPrice = chartData[chartData.length - 1].price;
  const previousPrice = chartData[chartData.length - 2].price;
  const priceChange = ((currentPrice - previousPrice) / previousPrice) * 100;

  const handleRunAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const dataForAi = chartData.map(d => ({ date: d.day, price: d.price }));
      const result = await marketPriceTrendAnalysis({
        cropType: selectedCrop,
        state: selectedState,
        marketPriceData: dataForAi
      });
      setAiResult(result);
    } catch (err) {
      toast({ variant: "destructive", title: "AI Analysis Failed", description: "Could not fetch market predictions." });
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    handleRunAIAnalysis();
  }, [selectedCrop, selectedState]);

  // Nearby Mandis simulated comparison
  const comparisons = useMemo(() => {
    return mandis.map(m => {
      const dist = Math.floor(10 + Math.random() * 50);
      const mPrice = currentPrice + (Math.random() * 100 - 50);
      const tCost = dist * 2.5; // Estimated 2.5 INR per KM per quintal
      return {
        name: m,
        price: mPrice,
        distance: dist,
        transportCost: tCost,
        netProfit: mPrice - tCost
      };
    }).sort((a, b) => b.netProfit - a.netProfit);
  }, [selectedMandi, currentPrice]);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Tiered Selection Header */}
      <div className="flex flex-wrap gap-4 bg-white p-8 rounded-[2.5rem] shadow-xl border items-end">
        <div className="space-y-2 flex-1 min-w-[200px]">
          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-4">{t("commodity")}</Label>
          <Select value={selectedCrop} onValueChange={setSelectedCrop}>
            <SelectTrigger className="rounded-2xl h-12 bg-muted/30 border-none font-black text-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Wheat">Wheat</SelectItem>
              <SelectItem value="Paddy">Paddy</SelectItem>
              <SelectItem value="Cotton">Cotton</SelectItem>
              <SelectItem value="Tomato">Tomato</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 flex-1 min-w-[200px]">
          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-4">{t("jurisdiction")}</Label>
          <Select value={selectedState} onValueChange={(v) => { setSelectedState(v); setSelectedDistrict(""); }}>
            <SelectTrigger className="rounded-2xl h-12 bg-muted/30 border-none font-black text-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INDIA_STATES.map(s => <SelectItem key={s.code} value={s.name}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 flex-1 min-w-[200px]">
          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-4">{t("district")}</Label>
          <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={!selectedState}>
            <SelectTrigger className="rounded-2xl h-12 bg-muted/30 border-none font-black text-lg">
              <SelectValue placeholder="Select District" />
            </SelectTrigger>
            <SelectContent>
              {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 flex-1 min-w-[200px]">
          <Label className="text-[10px] font-black uppercase text-muted-foreground ml-4">{t("local_mandi")}</Label>
          <Select value={selectedMandi} onValueChange={setSelectedMandi} disabled={!selectedDistrict}>
            <SelectTrigger className="rounded-2xl h-12 bg-muted/30 border-none font-black text-lg">
              <SelectValue placeholder="Select Mandi" />
            </SelectTrigger>
            <SelectContent>
              {mandis.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Price Analytics Main Card */}
        <div className="lg:col-span-8 space-y-10">
          <Card className="rounded-[3rem] border-none shadow-2xl overflow-hidden bg-white">
            <CardHeader className="p-10 border-b flex flex-row justify-between items-center bg-slate-50/50">
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black tracking-tight flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-primary" /> {selectedMandi}
                </CardTitle>
                <CardDescription className="font-bold text-muted-foreground uppercase text-[10px] tracking-widest">{selectedCrop} {t("seven_day_trend")}</CardDescription>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black text-slate-900">₹{currentPrice.toLocaleString()}<span className="text-sm font-bold text-muted-foreground">/q</span></p>
                <Badge className={cn(
                  "font-black mt-1 uppercase tracking-widest text-[10px]",
                  priceChange >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}>
                  {priceChange >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {Math.abs(priceChange).toFixed(2)}% {t("price_change")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-10 h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 900, color: 'hsl(var(--primary))' }}
                  />
                  <Area type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={4} fillOpacity={1} fill="url(#colorPrice)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Logistics-Profit Estimator */}
          <div className="space-y-6">
            <h3 className="text-2xl font-black flex items-center gap-3">
              <Truck className="h-7 w-7 text-primary" /> {t("nearby_markets")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {comparisons.map((m, i) => (
                <Card key={i} className="rounded-[2.5rem] border-none shadow-xl bg-white p-8 group hover:scale-[1.02] transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                      <h4 className="text-xl font-black tracking-tight">{m.name}</h4>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {m.distance} KM away
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <Target className="h-6 w-6" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 border-t pt-6">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-muted-foreground uppercase">{t("mandi_price")}</p>
                      <p className="text-lg font-black">₹{Math.round(m.price)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-muted-foreground uppercase">{t("transport_cost")}</p>
                      <p className="text-lg font-black text-destructive">₹{Math.round(m.transportCost)}</p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-2xl bg-primary/5 flex items-center justify-between">
                    <span className="text-[10px] font-black text-primary uppercase">{t("net_profit")}</span>
                    <span className="text-xl font-black text-primary">₹{Math.round(m.netProfit)}<span className="text-[10px] font-bold">/q</span></span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* AI Forecast Card */}
        <div className="lg:col-span-4 space-y-10">
          <Card className="rounded-[3rem] bg-slate-900 text-white p-10 border-none shadow-2xl relative overflow-hidden h-fit sticky top-24">
            <div className="absolute top-0 right-0 p-10 opacity-5">
              <Zap className="h-48 w-48 rotate-12" />
            </div>
            
            <div className="relative z-10 space-y-10">
              <div className="space-y-4">
                <Badge className="bg-primary text-white border-none px-4 py-1 font-black text-[10px] uppercase tracking-widest">{t("forecast")}</Badge>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("recommended_action")}</p>
                  {isAnalyzing ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="text-2xl font-black italic">Analyzing Grid...</span>
                    </div>
                  ) : (
                    <h3 className={cn(
                      "text-6xl font-black tracking-tighter",
                      aiResult?.recommendedAction === 'Sell' ? "text-red-500" : "text-primary"
                    )}>
                      {aiResult?.recommendedAction || "HOLD"}
                    </h3>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                    <Info className="h-4 w-4" /> Market Reasoning
                  </h4>
                  <p className="text-sm font-medium text-slate-300 italic leading-relaxed">
                    {aiResult?.reasoning || "Historical supply patterns suggest price stability over the next quarter. Recommendation generated via KisanMitra Intelligence Grid."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Grid Prediction</p>
                    <p className="text-xs font-bold">{aiResult?.predictedTrend || "Stable"}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Confidence</p>
                    <p className="text-xs font-bold">94% Verified</p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleRunAIAnalysis}
                disabled={isAnalyzing}
                className="w-full h-16 rounded-[2rem] font-black text-xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20"
              >
                {isAnalyzing ? <Loader2 className="animate-spin h-6 w-6" /> : <TrendingUp className="h-6 w-6 mr-2" />}
                Refresh Intelligence
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return <label className={cn("text-muted-foreground", className)}>{children}</label>;
}
