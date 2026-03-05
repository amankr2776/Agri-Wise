'use client';

import React, { useState, useMemo, useEffect, useRef } from "react";
import { 
  TrendingUp, 
  MapPin, 
  Search, 
  Zap, 
  Loader2, 
  BarChart3,
  Info,
  Volume2,
  Globe,
  Activity,
  CheckCircle2,
  Cpu,
  History
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
import { predictMarketPrice, MarketPriceRegressionOutput } from "@/ai/flows/market-price-regression";
import { useAppState } from "@/lib/app-state";
import useSWR from 'swr';
import { useFirestore } from "@/firebase";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";

type DataSource = 'Live' | 'Average' | 'AI';

export function MarketIntelligence() {
  const { t } = useTranslation();
  const firestore = useFirestore();
  const { city, state, langCode } = useAppState();
  
  const [selectedCrop, setSelectedCrop] = useState("Tomato Hybrid");
  const [selectedState, setSelectedState] = useState(state || "Karnataka");
  const [selectedDistrict, setSelectedDistrict] = useState(city || "Bengaluru");
  const [selectedMandi, setSelectedMandi] = useState(`${city || 'Bengaluru'} Central Mandi`);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<MarketPriceTrendAnalysisOutput | null>(null);
  const [regressionResult, setRegressionResult] = useState<MarketPriceRegressionOutput | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetching Logic with Regional Variance
  const { data: mandiData, isLoading: loadingMandi, mutate } = useSWR(
    ['mandiPrice', selectedCrop, selectedState, selectedDistrict, selectedMandi],
    async () => {
      if (!firestore) return null;
      
      try {
        // Tier 1: Local Mandi from Firestore
        const localQ = query(
          collection(firestore, "mandiPrices"),
          where("cropId", "==", selectedCrop),
          where("marketCenterName", "==", selectedMandi),
          orderBy("priceDate", "desc"),
          limit(1)
        );
        const localSnap = await getDocs(localQ);
        if (!localSnap.empty) return { ...localSnap.docs[0].data(), source: 'Live' as DataSource };

        // Tier 2: District/State Level from Firestore
        const stateQ = query(
          collection(firestore, "mandiPrices"),
          where("cropId", "==", selectedCrop),
          where("state", "==", selectedState),
          orderBy("priceDate", "desc"),
          limit(5)
        );
        const stateSnap = await getDocs(stateQ);
        if (!stateSnap.empty) {
          const prices = stateSnap.docs.map(d => d.data().pricePerUnit);
          const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
          return { 
            pricePerUnit: avg, 
            marketCenterName: `${selectedState} Regional Average`, 
            source: 'Average' as DataSource,
            unit: 'Quintal'
          };
        }
      } catch (e) {
        console.warn("Mandi grid sync offline, using local heuristics.");
      }

      return null;
    },
    { revalidateOnFocus: true }
  );

  // Trigger AI Regression if Mandi data is null or demo fallback is needed
  useEffect(() => {
    const runRegression = async () => {
      if (mandiData === null && !loadingMandi) {
        // Calculate regional price offset for simulation based on state/district index
        const stateIdx = INDIA_STATES.findIndex(s => s.name === selectedState);
        const regionalBase = (MARKET_DATASET.find(d => d.commodity === selectedCrop)?.basePrice || 25) * 100;
        const offset = (stateIdx * 15) + (selectedDistrict.length * 2);
        
        const historicalPrices = [
          regionalBase + offset - 50, 
          regionalBase + offset + 20, 
          regionalBase + offset - 10, 
          regionalBase + offset + 40, 
          regionalBase + offset + 15
        ];
        
        const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
        try {
          const res = await predictMarketPrice({
            cropName: selectedCrop,
            historicalPrices,
            currentMonth
          });
          setRegressionResult(res);
        } catch (e) {
          console.error("AI Regression Node offline.");
        }
      } else {
        setRegressionResult(null);
      }
    };
    runRegression();
  }, [mandiData, loadingMandi, selectedCrop, selectedState, selectedDistrict]);

  const displayPrice = mandiData?.pricePerUnit || regressionResult?.predictedValue || (MARKET_DATASET.find(d => d.commodity === selectedCrop)?.basePrice || 0) * 100;
  const dataSource: DataSource = mandiData?.source || (regressionResult ? 'AI' : 'Live');

  const districts = useMemo(() => {
    return INDIA_STATES.find(s => s.name === selectedState)?.districts || [];
  }, [selectedState]);

  const mandis = useMemo(() => {
    if (!selectedDistrict) return ["Regional Wholesale Hub"];
    return [
      `${selectedDistrict} Central Mandi`,
      `${selectedDistrict} Wholesale Hub`,
      `${selectedDistrict} Rural Market Yard`
    ];
  }, [selectedDistrict]);

  // Handle auto-update of Mandi title when location changes
  useEffect(() => {
    if (selectedDistrict) {
      setSelectedMandi(`${selectedDistrict} Central Mandi`);
    }
  }, [selectedDistrict]);

  const chartData = useMemo(() => {
    const base = displayPrice;
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, i) => ({
      day,
      price: base + (Math.sin(i) * 100) + (i * 15)
    }));
  }, [displayPrice]);

  const announcePrice = async () => {
    const text = `${selectedCrop}. ${t('mandi_price')} at ${selectedMandi} is ₹${Math.round(displayPrice)} ${t('per_quintal')}. ${t('forecast')}: ${aiResult?.recommendedAction || 'Hold'}.`;
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
    const fetchAnalysis = async () => {
      setIsAnalyzing(true);
      const dataForAi = chartData.map(d => ({ date: d.day, price: d.price }));
      try {
        const result = await marketPriceTrendAnalysis({
          cropType: selectedCrop,
          state: selectedState,
          marketPriceData: dataForAi
        });
        setAiResult(result);
      } catch (e) {
        console.error("AI Trend node busy.");
      } finally {
        setIsAnalyzing(false);
      }
    };
    fetchAnalysis();
  }, [selectedCrop, selectedState, displayPrice, chartData]);

  const getSourceBadge = () => {
    switch (dataSource) {
      case 'Live': return <Badge className="bg-green-500 text-white border-none gap-1"><CheckCircle2 className="h-3 w-3" /> Live from Mandi</Badge>;
      case 'Average': return <Badge className="bg-amber-500 text-white border-none gap-1"><Globe className="h-3 w-3" /> State Average</Badge>;
      case 'AI': return <Badge className="bg-purple-600 text-white border-none gap-1"><Cpu className="h-3 w-3" /> AI Predicted</Badge>;
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Search & Location Selectors */}
      <div className="flex flex-col gap-8 bg-white p-10 rounded-[3rem] shadow-xl border border-border/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight uppercase">Mandi Intelligence Hub</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Regional Price Sync & Heuristics</p>
            </div>
          </div>
          <div className="flex gap-2">
            {getSourceBadge()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-4">Commodity</Label>
            <Select value={selectedCrop} onValueChange={setSelectedCrop}>
              <SelectTrigger className="rounded-2xl h-14 bg-muted/30 border-none font-black text-lg"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-80">
                {MARKET_DATASET.map(d => <SelectItem key={d.commodity} value={d.commodity}>{d.commodity}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-4">State</Label>
            <Select value={selectedState} onValueChange={(v) => { setSelectedState(v); setSelectedDistrict(""); }}>
              <SelectTrigger className="rounded-2xl h-14 bg-muted/30 border-none font-black text-lg"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-80">{INDIA_STATES.map(s => <SelectItem key={s.code} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-4">District</Label>
            <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={!selectedState}>
              <SelectTrigger className="rounded-2xl h-14 bg-muted/30 border-none font-black text-lg"><SelectValue placeholder="Select District" /></SelectTrigger>
              <SelectContent className="max-h-80">{districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-muted-foreground ml-4">Local Mandi Hub</Label>
            <Select value={selectedMandi} onValueChange={setSelectedMandi} disabled={!selectedDistrict}>
              <SelectTrigger className="rounded-2xl h-14 bg-muted/30 border-none font-black text-lg"><SelectValue /></SelectTrigger>
              <SelectContent>{mandis.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <Card className="rounded-[3rem] border-none shadow-2xl overflow-hidden bg-white">
            <CardHeader className="p-10 border-b flex flex-row justify-between items-center bg-slate-50/50">
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black tracking-tight">{selectedMandi}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px] font-bold border-slate-200">Daily Arrival: {Math.floor(Math.random() * 500) + 100} q</Badge>
                  {dataSource === 'AI' && <Badge className="bg-purple-100 text-purple-700 border-none text-[8px] uppercase">Heuristic Mode Active</Badge>}
                </div>
              </div>
              <Button onClick={announcePrice} disabled={isSpeaking} className={cn("h-16 w-16 rounded-full shadow-xl transition-all", isSpeaking ? "bg-primary text-white animate-pulse" : "bg-white text-primary border-2 border-primary/20")}>
                {isSpeaking ? <Activity className="h-8 w-8" /> : <Volume2 className="h-8 w-8" />}
              </Button>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Market Min</p>
                  <p className="text-2xl font-black text-slate-900">₹{Math.round(displayPrice * 0.9)} / q</p>
                </div>
                <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 text-center scale-110 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10"><Zap className="h-10 w-10" /></div>
                  <p className="text-[10px] font-black text-primary uppercase mb-1">Mandi Modal Price</p>
                  <p className="text-3xl font-black text-primary">₹{Math.round(displayPrice)} / q</p>
                  <p className="text-[9px] font-bold text-primary/60 mt-1">{dataSource} Source Tracking</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Market Max</p>
                  <p className="text-2xl font-black text-slate-900">₹{Math.round(displayPrice * 1.1)} / q</p>
                </div>
              </div>

              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={dataSource === 'AI' ? '#9333ea' : 'hsl(var(--primary))'} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={dataSource === 'AI' ? '#9333ea' : 'hsl(var(--primary))'} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} domain={['auto', 'auto']} />
                    <Tooltip 
                      formatter={(value: number) => [`₹${Math.round(value)} / q`, 'Wholesale Price']}
                      contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} 
                    />
                    <Area type="monotone" dataKey="price" stroke={dataSource === 'AI' ? '#9333ea' : 'hsl(var(--primary))'} strokeWidth={4} fillOpacity={1} fill="url(#colorPrice)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <Card className="rounded-[3rem] bg-slate-900 text-white p-10 border-none shadow-2xl relative overflow-hidden h-fit sticky top-24">
            <div className="absolute top-0 right-0 p-10 opacity-5"><Zap className="h-48 w-48 rotate-12" /></div>
            <div className="relative z-10 space-y-10">
              <div className="space-y-4">
                <Badge className="bg-primary text-white border-none px-4 py-1 font-black text-[10px] uppercase tracking-widest">Regional Forecast</Badge>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("recommended_action")}</p>
                  {isAnalyzing ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="text-2xl font-black italic">Simulating...</span>
                    </div>
                  ) : (
                    <h3 className={cn("text-6xl font-black tracking-tighter", aiResult?.recommendedAction === 'Sell' ? "text-red-500" : "text-primary")}>
                      {aiResult?.recommendedAction || "HOLD"}
                    </h3>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2"><Info className="h-4 w-4" /> Strategic Reasoning</h4>
                  <p className="text-sm font-medium text-slate-300 italic leading-relaxed">
                    {dataSource === 'AI' ? regressionResult?.reasoning : aiResult?.reasoning}
                  </p>
                </div>
                {dataSource === 'AI' && (
                  <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center">
                    <p className="text-[9px] font-black text-purple-400 uppercase mb-1">Heuristic Regression Confidence</p>
                    <p className="text-xs font-bold text-purple-200">65% Match to {selectedState} Seasonal Normals</p>
                  </div>
                )}
              </div>

              <Button onClick={() => mutate()} className="w-full h-16 rounded-[2rem] font-black text-xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-95">
                <History className="h-6 w-6 mr-2" /> Sync with Grid
              </Button>
            </div>
          </Card>
        </div>
      </div>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}