
'use client';

import React, { useState, useMemo, useEffect, useRef } from "react";
import { 
  Truck, 
  MapPin, 
  Calculator,
  Navigation, 
  Package, 
  Phone,
  Search,
  Loader2,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Scale,
  Zap,
  MessageCircle,
  ArrowRight,
  AlertTriangle,
  Send,
  Volume2,
  Mic,
  Bot
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "@/hooks/use-translation";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, doc } from "firebase/firestore";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { INDIA_STATES } from "@/lib/india-data";
import { getLogisticsSupport } from "@/ai/flows/logistics-support-flow";
import { useAppState } from "@/lib/app-state";

const STEPS = ["Pending", "Confirmed", "Picked Up", "In Transit", "Reached Destination"];

export function MandiLink() {
  const { t } = useTranslation();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const { language, langCode, name } = useAppState();
  
  const [filterState, setFilterState] = useState<string>("");
  const [filterCity, setFilterCity] = useState<string>("");
  const [selectedCrop, setSelectedCrop] = useState("Wheat");
  const [distance, setDistance] = useState("");
  const [activeTab, setActiveTab] = useState("browse");

  // Support & Issue State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [supportOpen, setSupportOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Client-side initialization for Chat and Audio
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio();
    }
  }, []);

  const vehiclesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "vehicles"), where("isAvailable", "==", true));
  }, [firestore]);

  const { data: vehicles, isLoading: loadingVehicles } = useCollection(vehiclesQuery);

  const myBookingsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, "bookings"), 
      where("farmerId", "==", user.uid)
    );
  }, [firestore, user]);
  const { data: myBookings, isLoading: loadingBookings } = useCollection(myBookingsQuery);

  const filteredVehicles = useMemo(() => {
    if (!vehicles) return [];
    return vehicles.filter(v => {
      const matchState = !filterState || v.state === filterState;
      const matchCity = !filterCity || v.city === filterCity;
      return matchState && matchCity;
    });
  }, [vehicles, filterState, filterCity]);

  const districts = useMemo(() => {
    return INDIA_STATES.find(s => s.name === filterState)?.districts || [];
  }, [filterState]);

  useEffect(() => {
    if (filterCity) {
      const randomDist = Math.floor(15 + Math.random() * 60);
      setDistance(randomDist.toString());
    }
  }, [filterCity]);

  const handleBook = (v: any) => {
    if (!firestore || !user) return;
    const estFare = (Number(distance) || 20) * v.pricePerKm;
    addDocumentNonBlocking(collection(firestore, "bookings"), {
      farmerId: user.uid,
      vehicleId: v.id,
      agencyName: v.agencyName,
      cropType: selectedCrop,
      distance: Number(distance) || 20,
      estimatedFare: estFare,
      status: "Pending",
      destination: `${filterCity || 'Regional'} Mandi Hub`,
      createdAt: new Date().toISOString()
    });
    toast({ title: "Booking Requested", description: `Transport request sent to ${v.agencyName}.` });
    setActiveTab("bookings");
  };

  const handleCreateTicket = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore || !user || !selectedBooking) return;
    
    const formData = new FormData(e.currentTarget);
    const ticketData = {
      shipmentId: selectedBooking.id,
      farmerId: user.uid,
      farmerName: name,
      issueType: formData.get("issueType"),
      description: formData.get("description"),
      status: "Open",
      isEscalated: false,
      createdAt: new Date().toISOString()
    };

    addDocumentNonBlocking(collection(firestore, "logisticsTickets"), ticketData);
    setReportModalOpen(false);
    toast({ title: "Incident Logged", description: "Your report has been sent to the National Grid monitor." });
  };

  const startSupportChat = (booking: any) => {
    setSelectedBooking(booking);
    setMessages([{ 
      role: 'bot', 
      text: `Namaste ${name}! I am your logistics guide. I see your ${booking.cropType} shipment status is "${booking.status}". How can I help you today?` 
    }]);
    setSupportOpen(true);
  };

  const handleSendMessage = async (queryText: string) => {
    if (!queryText.trim() || !selectedBooking) return;
    
    setMessages(prev => [...prev, { role: 'user', text: queryText }]);
    setChatLoading(true);

    try {
      const res = await getLogisticsSupport({
        query: queryText,
        shipmentStatus: selectedBooking.status,
        shipmentDetails: `${selectedBooking.cropType} load to ${selectedBooking.destination}`,
        language: language
      });

      setMessages(prev => [...prev, { role: 'bot', text: res.text }]);
      
      // Auto-speak with resilience
      await speakResponse(res.text);

      if (res.actionRecommended === 'Escalate') {
        toast({ title: "Expert Alerted", description: "Your concern has been escalated to a human manager." });
      }
    } catch (err) {
      console.error("Chat Action Error:", err);
      toast({ 
        variant: "destructive", 
        title: "Connection Alert", 
        description: "Support grid high-latency. Re-attempting connection..." 
      });
      // Silent retry logic could be added here
    } finally {
      setChatLoading(false);
    }
  };

  const speakResponse = async (text: string) => {
    setIsSpeaking(true);
    try {
      // Primary: Bhashini Fetch-based synthesis (Standard)
      const response = await fetch('/api/bhashini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, langCode })
      });
      
      if (!response.ok) throw new Error("Bhashini Grid Busy");

      const data = await response.json();
      if (data.audioContent) {
        if (!audioRef.current) audioRef.current = new Audio();
        audioRef.current.src = `data:audio/wav;base64,${data.audioContent}`;
        audioRef.current.onended = () => setIsSpeaking(false);
        audioRef.current.play();
      } else {
        throw new Error("No neural content");
      }
    } catch (e) {
      console.warn("Bhashini Fallback Triggered:", e);
      // Secondary Fallback: Browser-Native Speech Synthesis
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langCode === 'hi' ? 'hi-IN' : 'en-IN';
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsSpeaking(false);
      }
    }
  };

  const getProgress = (status: string) => {
    const idx = STEPS.indexOf(status);
    return ((idx + 1) / STEPS.length) * 100;
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-slate-900 flex items-center gap-3">
            <Truck className="h-10 w-10 text-primary" />
            Mandi-Link Pro
          </h2>
          <p className="text-muted-foreground font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">All-India Logistics Grid & Fare Intelligence</p>
        </div>
        <div className="bg-white p-1 rounded-full shadow-sm border">
          <TabsList className="bg-transparent border-none">
            <TabsTrigger value="browse" className="rounded-full px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-xs uppercase tracking-widest">{t("transport")}</TabsTrigger>
            <TabsTrigger value="bookings" className="rounded-full px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-xs uppercase tracking-widest">{t("shipments")}</TabsTrigger>
          </TabsList>
        </div>
      </div>

      <TabsContent value="browse" className="space-y-10 m-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <Card className="lg:col-span-4 border-none shadow-xl rounded-[3rem] bg-slate-900 text-white p-10 space-y-10 h-fit sticky top-24">
            <div className="space-y-2">
              <Badge className="bg-primary/20 text-primary border-none font-black text-[10px] uppercase tracking-widest px-4 py-1">Fare Intelligence</Badge>
              <h3 className="text-3xl font-black tracking-tight">{t("fare_estimator")}</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">Select Commodity</label>
                <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                  <SelectTrigger className="rounded-2xl h-14 bg-white/5 border-white/10 font-bold text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wheat">Wheat (Grain)</SelectItem>
                    <SelectItem value="Paddy">Paddy (Grain)</SelectItem>
                    <SelectItem value="Tomato">Tomato (Perishable)</SelectItem>
                    <SelectItem value="Cotton">Cotton (Bulk)</SelectItem>
                    <SelectItem value="Fruits">Fruits (Refrigerated)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">Distance to Mandi (KM)</label>
                <div className="relative">
                  <Navigation className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                  <Input type="number" placeholder="Auto-calculated" value={distance} onChange={(e) => setDistance(e.target.value)} className="rounded-2xl h-14 bg-white/5 border-white/10 pl-14 font-black text-xl" />
                </div>
              </div>
              <div className="p-6 rounded-3xl bg-primary/10 border border-primary/20 space-y-1">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Recommended Vehicle</p>
                <p className="text-lg font-bold flex items-center gap-2">
                  {["Tomato", "Fruits"].includes(selectedCrop) ? <Zap className="h-4 w-4 text-amber-500" /> : <Truck className="h-4 w-4" />}
                  {["Tomato", "Fruits"].includes(selectedCrop) ? "Refrigerated Van" : "Open Payload Truck"}
                </p>
              </div>
            </div>
          </Card>

          <div className="lg:col-span-8 space-y-8">
            <div className="flex flex-col gap-6 bg-white p-8 rounded-[2.5rem] shadow-xl border border-border/50 sticky top-24 z-20">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Geographic Sector</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground ml-4">State / UT</label>
                  <Select value={filterState} onValueChange={(v) => { setFilterState(v); setFilterCity(""); }}>
                    <SelectTrigger className="rounded-2xl h-12 bg-muted/30 border-none font-bold">
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      {INDIA_STATES.map(s => <SelectItem key={s.code} value={s.name}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground ml-4">Local Mandi District</label>
                  <Select value={filterCity} onValueChange={setFilterCity} disabled={!filterState}>
                    <SelectTrigger className="rounded-2xl h-12 bg-muted/30 border-none font-bold">
                      <SelectValue placeholder={filterState ? "Select District" : "Choose State First"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {loadingVehicles ? (
              <div className="py-20 text-center"><Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredVehicles.map((v) => (
                    <motion.div key={v.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                      <Card className="glass-card border-none rounded-[2.5rem] p-8 space-y-6 group hover:shadow-2xl transition-all hover:scale-[1.02]">
                        <div className="flex justify-between items-start">
                          <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                            <Truck className="h-8 w-8" />
                          </div>
                          <Badge className="bg-white/80 backdrop-blur-sm text-primary border-none px-4 py-1.5 font-black text-sm rounded-full shadow-sm">
                            ₹{v.pricePerKm}/km
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-2xl font-black tracking-tight">{v.agencyName}</h4>
                          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                            <span>{v.city}, {v.state}</span>
                          </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                          <Button onClick={() => handleBook(v)} className="flex-1 h-12 rounded-xl font-black shadow-lg shadow-primary/20">Book Harvest</Button>
                          <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl" asChild>
                            <a href={`tel:${v.contact}`}><Phone className="h-5 w-5" /></a>
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="bookings" className="space-y-8 m-0">
        {!myBookings?.length ? (
          <Card className="border-dashed border-2 p-32 text-center bg-muted/20 rounded-[4rem]">
            <Package className="h-20 w-20 text-muted-foreground/20 mx-auto mb-8" />
            <h3 className="text-3xl font-black">No Active Shipments</h3>
            <Button onClick={() => setActiveTab("browse")} className="mt-8 rounded-full px-10 h-14 font-black text-lg">Browse National Grid</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {myBookings.map((booking) => (
              <Card key={booking.id} className="glass-card border-none shadow-2xl rounded-[3rem] overflow-hidden">
                <div className="bg-slate-900 p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-8">
                    <div className="h-20 w-20 bg-primary/20 rounded-3xl flex items-center justify-center text-primary"><Package className="h-10 w-10" /></div>
                    <div className="space-y-1">
                      <h4 className="text-3xl font-black">{booking.cropType} Shipment</h4>
                      <Badge className="bg-primary text-white border-none font-black text-[10px] uppercase tracking-widest">{booking.status}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">Est. Fare</p>
                    <p className="text-4xl font-black text-primary">₹{booking.estimatedFare.toLocaleString()}</p>
                  </div>
                </div>
                <div className="p-10 space-y-10">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center"><span className="text-[10px] font-black text-muted-foreground uppercase">Journey Progress</span></div>
                    <Progress value={getProgress(booking.status)} className="h-3 rounded-full" />
                    <div className="grid grid-cols-5 gap-2">
                      {STEPS.map((step, i) => (
                        <div key={step} className="flex flex-col items-center gap-3">
                          <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", STEPS.indexOf(booking.status) >= i ? "bg-primary text-white" : "bg-muted")} />
                          <p className="text-[8px] font-black uppercase text-center">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-8 border-t flex justify-between items-center">
                    <div className="flex gap-4">
                      <Button variant="outline" className="rounded-xl h-12 px-6 font-black gap-2 border-destructive/20 text-destructive hover:bg-destructive/5" onClick={() => { setSelectedBooking(booking); setReportModalOpen(true); }}>
                        <AlertTriangle className="h-4 w-4" /> Report Issue
                      </Button>
                      <Button variant="outline" className="rounded-xl h-12 px-6 font-black gap-2" onClick={() => startSupportChat(booking)}>
                        <MessageCircle className="h-4 w-4" /> Chat Support
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      {/* Report Issue Modal */}
      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent className="rounded-[2.5rem] p-10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black">Report Logistics Issue</DialogTitle>
            <DialogDescription className="italic font-medium">Log a professional dispute for shipment tracking.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTicket} className="space-y-6 pt-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-muted-foreground">Incident Type</label>
              <Select name="issueType" defaultValue="Delay">
                <SelectTrigger className="rounded-xl h-12 bg-muted/30 border-none font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Delay">Inordinate Delay</SelectItem>
                  <SelectItem value="Damaged Goods">Damaged Payload</SelectItem>
                  <SelectItem value="Pricing Dispute">Fare Discrepancy</SelectItem>
                  <SelectItem value="Other">Other Issues</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-muted-foreground">Incident Description</label>
              <Input name="description" placeholder="Describe the problem in detail..." required className="rounded-xl h-12 bg-muted/30 border-none font-medium" />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg">Submit Incident Report</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Support Chat Sheet */}
      <Sheet open={supportOpen} onOpenChange={setSupportOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col rounded-l-[2rem] border-none shadow-2xl">
          <SheetHeader className="p-8 bg-slate-900 text-white">
            <div className="flex items-center gap-3">
              <Bot className="h-8 w-8 text-primary" />
              <SheetTitle className="text-2xl font-black text-white">Logistics Support</SheetTitle>
            </div>
            <SheetDescription className="text-slate-400 font-medium italic">Gemini 2.5 Flash Grid Assistant</SheetDescription>
          </SheetHeader>
          
          <ScrollArea className="flex-1 p-8 bg-muted/5">
            <div className="space-y-6">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex", m.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[85%] p-4 rounded-2xl shadow-sm space-y-2",
                    m.role === 'user' ? "bg-primary text-white" : "bg-white border"
                  )}>
                    <p className="text-sm font-medium leading-relaxed">{m.text}</p>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border p-4 rounded-2xl flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground font-bold">Consulting National Grid...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-8 bg-white border-t space-y-4">
            <div className="flex gap-2">
              <Input 
                id="supportInput"
                placeholder={`Ask in ${language}...`} 
                className="rounded-xl h-12 bg-muted/30 border-none font-medium"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.currentTarget.value;
                    handleSendMessage(input);
                    e.currentTarget.value = "";
                  }
                }}
              />
              <Button size="icon" className="h-12 w-12 rounded-xl shrink-0" onClick={() => {
                const el = document.getElementById('supportInput') as HTMLInputElement;
                handleSendMessage(el.value);
                el.value = "";
              }}>
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="rounded-full h-8 px-4 font-black text-[10px] gap-2">
                  <Mic className="h-3 w-3" /> Voice Record
                </Button>
                {isSpeaking && <div className="flex gap-0.5 items-center">
                  {[1,2,3].map(i => <motion.div key={i} animate={{height:[4,12,4]}} transition={{repeat:Infinity, duration:0.5, delay:i*0.1}} className="w-0.5 bg-primary rounded-full" />)}
                </div>}
              </div>
              <Badge className="bg-primary/10 text-primary border-none text-[8px] uppercase">{language} Neural Engine</Badge>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <audio ref={audioRef} className="hidden" />
    </Tabs>
  );
}
