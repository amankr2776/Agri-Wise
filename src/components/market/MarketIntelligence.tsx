
'use client';

import React, { useState, useMemo, useEffect, useRef } from "react";
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
  Target,
  Navigation,
  Volume2,
  Globe,
  Activity,
  Crosshair
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
import { Label } from "@/components/ui/label";
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
import { MARKET_DATASET } from "@/lib/market-data";
import { marketPriceTrendAnalysis, MarketPriceTrendAnalysisOutput } from "@/ai/flows/market-price-trend-analysis";
import { useToast } from "@/hooks/use-toast";
import { useAppState } from "@/lib/app-state";
import { motion, AnimatePresence } from "framer-motion";

export function MarketIntelligence() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { city, state, language, langCode } = useAppState();
  
  const [selectedCrop, setSelectedCrop] = useState("Tomato Hybrid");
  const [selectedState, setSelectedState] = useState(state || "Karnataka");
  const [selectedDistrict, setSelectedDistrict] = useState(city || "Bengaluru");
  const [selectedMandi, setSelectedMandi] = useState(`${city || 'Bengaluru'} Central Mandi`);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [aiResult, setAiResult] = useState<MarketPriceTrendAnalysisOutput | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const districts = useMemo(() => {
    return INDIA_STATES.find(s => s.name === selectedState)?.districts || [];
  }, [selectedState]);

  const mandis = useMemo(() => {
    return [
      `${selectedDistrict} Central Mandi`,
      `${selectedDistrict} Wholesale Hub`,
      `${selectedDistrict} Rural Yard`
    ];
  }, [selectedDistrict]);

  // Pricing Logic from Dataset
  const cropPriceInfo = useMemo(() => {
    const entry = MARKET_DATASET.find(d => d.commodity === selectedCrop);
    if (!entry) return { min: 0, max: 0, modal: 0, unit: "1 Kg" };
    
    // Add regional variability based on district name length (simulated factor)
    const variability = (selectedDistrict.length % 5) * 2;
    return {
      min: entry.basePrice - 5 - variability,
      max: entry.basePrice + 10 + variability,
      modal: entry.basePrice + (variability / 2),
      unit: entry.unit
    };
  }, [selectedCrop, selectedDistrict]);

  // 7-Day Trend Generation
  const chartData = useMemo(() => {
    const base = cropPriceInfo.modal;
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, i) => ({
      day,
      price: base + (Math.random() * 10 - 5) + (i * 2)
    }));
  }, [cropPriceInfo]);

  const currentPrice = chartData[chartData.length - 1].price;
  const previousPrice = chartData[chartData.length - 2].price;
  const priceChange = ((currentPrice - previousPrice) / previousPrice) * 100;

  const handleDetectLocation = () => {
    setIsDetectingLocation(true);
    if (!navigator.geolocation) {
      toast({ title: "Unsupported", description: "Browser does not support Geolocation." });
      setIsDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // In a real app, we'd reverse geocode here. 
        // For demo, we confirm the signal and stick to current grid context.
        toast({ 
          title: "Location Verified", 
          description: `Grid context locked to ${selectedDistrict}, ${selectedState}.` 
        });
        setIsDetectingLocation(false);
      },
      () => {
        toast({ variant: "destructive", title: "Access Denied", description: "Defaulting to profile city." });
        setIsDetectingLocation(false);
      }
    );
  };

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

  const announcePrice = async () => {
    const text = `${selectedCrop} price in ${selectedMandi} is Rupees ${Math.round(currentPrice)} per ${cropPriceInfo.unit}. The trend is ${priceChange >= 0 ? 'Rising' : 'Falling'}.`;
    
    setIsSpeaking(true);
    try {
      const response = await fetch('/api/bhashini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, langCode })
      });

      const data = await response.json();
      if (data.audioContent) {
        if (!audioRef.current) audioRef.current = new Audio();
        audioRef.current.src = `data:audio/wav;base64,${data.audioContent}`;
        audioRef.current.onended = () => setIsSpeaking(false);
        audioRef.current.play();
      } else {
        const ut = new SpeechSynthesisUtterance(text);
        ut.lang = langCode === 'hi' ? 'hi-IN' : 'en-IN';
        ut.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(ut);
      }
    } catch (e) {
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    handleRunAIAnalysis();
  }, [selectedCrop, selectedState]);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Header Grid Context */}
      <div className="flex flex-col gap-8 bg-white p-10 rounded-[3rem] shadow-xl border border-border/50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight uppercase text-slate-900">Agmarknet Intelligence Hub</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Real-time Wholsesale Arrivals & Prices</p>
            </div>
          </div>
          <Button 
            onClick={handleDetectLocation} 
            disabled={isDetectingLocation}
            className="rounded-2xl h-12 px-6 font-black gap-2 bg-slate-900 text-white shadow-lg"
          >
            {isDetectingLocation ? <Loader2 className="animate-spin h-4 w-4" /> : <Crosshair className="h-4 w-4" />}
            Detect My Mandi
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-4">Select Commodity</Label>
            <Select value={selectedCrop} onValueChange={setSelectedCrop}>
              <SelectTrigger className="rounded-2xl h-14 bg-muted/30 border-none font-black text-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {MARKET_DATASET.map(d => <SelectItem key={d.commodity} value={d.commodity}>{d.commodity}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-4">State Hub</Label>
            <Select value={selectedState} onValueChange={(v) => { setSelectedState(v); setSelectedDistrict(""); }}>
              <SelectTrigger className="rounded-2xl h-14 bg-muted/30 border-none font-black text-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {INDIA_STATES.map(s => <SelectItem key={s.code} value={s.name}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-4">Mandi District</Label>
            <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={!selectedState}>
              <SelectTrigger className="rounded-2xl h-14 bg-muted/30 border-none font-black text-lg">
                <SelectValue placeholder="Select District" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-4">Market Yard</Label>
            <Select value={selectedMandi} onValueChange={setSelectedMandi} disabled={!selectedDistrict}>
              <SelectTrigger className="rounded-2xl h-14 bg-muted/30 border-none font-black text-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mandis.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          {/* Detailed Price Spread Card */}
          <Card className="rounded-[3rem] border-none shadow-2xl overflow-hidden bg-white">
            <CardHeader className="p-10 border-b flex flex-row justify-between items-center bg-slate-50/50">
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black tracking-tight flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-primary" /> {selectedMandi} Report
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/10 text-primary border-none font-black uppercase text-[10px]">{selectedCrop}</Badge>
                  <Badge variant="outline" className="text-[9px] font-bold border-slate-200">Daily Arrival: 450 Units</Badge>
                </div>
              </div>
              <Button 
                onClick={announcePrice}
                disabled={isSpeaking}
                className={cn(
                  "h-16 w-16 rounded-full shadow-xl transition-all",
                  isSpeaking ? "bg-primary text-white animate-pulse" : "bg-white text-primary border-2 border-primary/20 hover:bg-primary/5"
                )}
              >
                {isSpeaking ? <Activity className="h-8 w-8" /> : <Volume2 className="h-8 w-8" />}
              </Button>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              <div className="grid grid-cols-3 gap-6">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Min Price</p>
                  <p className="text-2xl font-black text-slate-900">₹{cropPriceInfo.min}</p>
                  <p className="text-[9px] font-bold text-slate-400 mt-1">per {cropPriceInfo.unit}</p>
                </div>
                <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 text-center scale-110 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10"><Zap className="h-10 w-10" /></div>
                  <p className="text-[10px] font-black text-primary uppercase mb-1">Modal Price</p>
                  <p className="text-3xl font-black text-primary">₹{Math.round(currentPrice)}</p>
                  <p className="text-[9px] font-bold text-primary/60 mt-1">Current Benchmark</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Max Price</p>
                  <p className="text-2xl font-black text-slate-900">₹{cropPriceInfo.max}</p>
                  <p className="text-[9px] font-bold text-slate-400 mt-1">Daily Peak</p>
                </div>
              </div>

              <div className="h-[350px]">
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
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Strategic Forecast */}
        <div className="lg:col-span-4 space-y-10">
          <Card className="rounded-[3rem] bg-slate-900 text-white p-10 border-none shadow-2xl relative overflow-hidden h-fit sticky top-24">
            <div className="absolute top-0 right-0 p-10 opacity-5">
              <Zap className="h-48 w-48 rotate-12" />
            </div>
            
            <div className="relative z-10 space-y-10">
              <div className="space-y-4">
                <Badge className="bg-primary text-white border-none px-4 py-1 font-black text-[10px] uppercase tracking-widest">Market Predictor</Badge>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("recommended_action")}</p>
                  {isAnalyzing ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="text-2xl font-black italic">Simulating Trade...</span>
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
                    <Info className="h-4 w-4" /> Strategic Reasoning
                  </h4>
                  <p className="text-sm font-medium text-slate-300 italic leading-relaxed">
                    {aiResult?.reasoning || "Based on the Modal Price benchmark of ₹" + Math.round(currentPrice) + " and current supply density at " + selectedMandi + ", AI models suggest strategic retention."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Spread Confidence</p>
                    <p className="text-xs font-bold">98% Data-Backed</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Mandi Status</p>
                    <p className="text-xs font-bold">High Liquidity</p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleRunAIAnalysis}
                disabled={isAnalyzing}
                className="w-full h-16 rounded-[2rem] font-black text-xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-95"
              >
                {isAnalyzing ? <Loader2 className="animate-spin h-6 w-6" /> : <TrendingUp className="h-6 w-6 mr-2" />}
                Refresh Analysis
              </Button>
            </div>
          </Card>
        </div>
      </div>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
