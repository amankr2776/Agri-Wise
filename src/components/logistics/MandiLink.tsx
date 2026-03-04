
'use client';

import React, { useState, useMemo, useEffect } from "react";
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
  ArrowRight
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "@/hooks/use-translation";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { INDIA_STATES } from "@/lib/india-data";

const STEPS = ["Pending", "Confirmed", "Picked Up", "In Transit", "Reached Destination"];

export function MandiLink() {
  const { t } = useTranslation();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [filterState, setFilterState] = useState<string>("");
  const [filterCity, setFilterCity] = useState<string>("");
  const [selectedCrop, setSelectedCrop] = useState("Wheat");
  const [distance, setDistance] = useState("");
  const [activeTab, setActiveTab] = useState("browse");

  // Fetch Vehicles - Real-time filtering via Query where possible, or client-side for All-India view
  const vehiclesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    let q = query(collection(firestore, "vehicles"), where("isAvailable", "==", true));
    return q;
  }, [firestore]);

  const { data: vehicles, isLoading: loadingVehicles } = useCollection(vehiclesQuery);

  // Fetch Farmer's Bookings
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

  // Simulate Distance to Nearest Mandi when city changes
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

    toast({
      title: "Booking Requested",
      description: `Transport request sent to ${v.agencyName}. Total Est: ₹${estFare.toLocaleString()}`,
    });
    setActiveTab("bookings");
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
          {/* Fare Estimator Sidebar */}
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
                  <Input 
                    type="number" 
                    placeholder="Auto-calculated" 
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="rounded-2xl h-14 bg-white/5 border-white/10 pl-14 font-black text-xl" 
                  />
                </div>
                <p className="text-[9px] text-slate-500 italic ml-4">Distance based on selected Mandi Hub</p>
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

          {/* All-India Filter & Browse Area */}
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
              {filterState && (
                <div className="flex justify-between items-center pt-4 border-t border-dashed">
                  <p className="text-xs font-bold text-muted-foreground">
                    Showing agencies in <span className="text-primary">{filterCity || filterState}</span>
                  </p>
                  <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase h-8" onClick={() => { setFilterState(""); setFilterCity(""); }}>Clear Filters</Button>
                </div>
              )}
            </div>

            {loadingVehicles ? (
              <div className="py-20 text-center flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Scanning National Logistics Grid...</p>
              </div>
            ) : filteredVehicles.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed flex flex-col items-center gap-6"
              >
                <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center">
                  <Search className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900">No Local Agencies Found</h3>
                  <p className="text-muted-foreground max-w-md mx-auto font-medium">
                    We currently don't have registered providers in <span className="font-bold text-primary">{filterCity || filterState}</span>. 
                    Try looking in neighboring districts or clear the city filter.
                  </p>
                </div>
                <Button onClick={() => setFilterCity("")} className="rounded-full px-8 h-12 font-black">View All {filterState} Agencies</Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredVehicles.map((v) => (
                    <motion.div
                      key={v.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
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

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-2xl bg-muted/50 border border-border/50 text-center">
                            <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Fleet Type</p>
                            <p className="text-xs font-bold">{v.type}</p>
                          </div>
                          <div className="p-4 rounded-2xl bg-muted/50 border border-border/50 text-center">
                            <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Capacity</p>
                            <p className="text-xs font-bold">Verified Load</p>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <Button onClick={() => handleBook(v)} className="flex-1 h-12 rounded-xl font-black shadow-lg shadow-primary/20">Book Harvest</Button>
                          <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-slate-200" asChild>
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
        {loadingBookings ? (
          <div className="py-20 text-center"><Loader2 className="animate-spin h-10 w-10 mx-auto text-primary" /></div>
        ) : !myBookings?.length ? (
          <Card className="border-dashed border-2 p-32 text-center bg-muted/20 rounded-[4rem]">
            <Package className="h-20 w-20 text-muted-foreground/20 mx-auto mb-8" />
            <h3 className="text-3xl font-black">No Active Shipments</h3>
            <p className="text-muted-foreground mt-2 font-medium italic">Book a professional vehicle to move your harvest to the Mandi.</p>
            <Button onClick={() => setActiveTab("browse")} className="mt-8 rounded-full px-10 h-14 font-black text-lg">Browse National Grid</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {myBookings.map((booking) => (
              <Card key={booking.id} className="glass-card border-none shadow-2xl rounded-[3rem] overflow-hidden group">
                <div className="bg-slate-900 p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <TrendingUp className="h-32 w-32 rotate-12" />
                  </div>
                  <div className="flex items-center gap-8 relative z-10">
                    <div className="h-20 w-20 bg-primary/20 rounded-3xl flex items-center justify-center text-primary shadow-xl">
                      <Package className="h-10 w-10" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h4 className="text-3xl font-black tracking-tight">{booking.cropType} Shipment</h4>
                        <Badge className="bg-primary text-white border-none font-black text-[10px] uppercase tracking-widest">{booking.status}</Badge>
                      </div>
                      <p className="text-slate-400 font-medium flex items-center gap-2">
                        <Truck className="h-4 w-4" /> {booking.agencyName} • {booking.distance} KM Trip
                      </p>
                    </div>
                  </div>
                  <div className="text-right relative z-10">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Estimated Fare</p>
                    <p className="text-4xl font-black text-primary">₹{booking.estimatedFare.toLocaleString()}</p>
                  </div>
                </div>

                <div className="p-10 space-y-10">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center px-2">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Journey Progress</span>
                      <span className="text-xs font-bold text-primary">{Math.round(getProgress(booking.status))}% Complete</span>
                    </div>
                    <Progress value={getProgress(booking.status)} className="h-3 rounded-full bg-muted shadow-inner" />
                    <div className="grid grid-cols-5 gap-2">
                      {STEPS.map((step, i) => {
                        const isPast = STEPS.indexOf(booking.status) >= i;
                        const isCurrent = booking.status === step;
                        return (
                          <div key={step} className="flex flex-col items-center gap-3 text-center">
                            <div className={cn(
                              "h-8 w-8 rounded-full flex items-center justify-center transition-all duration-500",
                              isPast ? "bg-primary text-white scale-110 shadow-lg" : "bg-muted text-muted-foreground"
                            )}>
                              {isPast ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-[10px] font-bold">{i+1}</span>}
                            </div>
                            <p className={cn(
                              "text-[8px] font-black uppercase tracking-tighter hidden md:block",
                              isCurrent ? "text-primary scale-110" : "text-muted-foreground opacity-60"
                            )}>{step}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-border/50">
                      <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <Navigation className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-black text-muted-foreground uppercase">Target Destination</p>
                        <p className="text-xs font-bold">{booking.destination}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <Button variant="outline" className="rounded-xl h-12 px-6 font-black gap-2 border-destructive/20 text-destructive hover:bg-destructive/5">
                        <AlertCircle className="h-4 w-4" /> Report Delay
                      </Button>
                      <Button variant="outline" className="rounded-xl h-12 px-6 font-black gap-2">
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
    </Tabs>
  );
}
