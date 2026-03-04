
'use client';

import React, { useState, useMemo } from "react";
import { 
  Truck, 
  MapPin, 
  Scale, 
  Phone, 
  Calculator,
  Navigation, 
  Package, 
  CheckCircle2,
  AlertTriangle,
  Search,
  ChevronRight,
  Map as MapIcon,
  Info
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where, addDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Comprehensive Indian Agricultural Hubs Mapping
const STATE_CITY_MAP: Record<string, string[]> = {
  "Andhra Pradesh": ["Guntur", "Vijayawada", "Kurnool", "Nellore", "Eluru"],
  "Bihar": ["Gulabbagh", "Bhagalpur", "Muzaffarpur", "Gaya", "Patna"],
  "Chhattisgarh": ["Raipur", "Durg", "Bilaspur", "Rajnandgaon", "Ambikapur"],
  "Gujarat": ["Ahmedabad", "Surat", "Rajkot", "Vadodara", "Mehsana"],
  "Haryana": ["Karnal", "Rohtak", "Hisar", "Ambala", "Sirsa"],
  "Karnataka": ["Haveri", "Davanagere", "Bijapur", "Gulbarga", "Bellary"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Ujjain", "Jabalpur", "Sagar"],
  "Maharashtra": ["Nashik", "Nagpur", "Pune", "Sangli", "Aurangabad"],
  "Punjab": ["Ludhiana", "Amritsar", "Bathinda", "Patiala", "Jalandhar"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Bikaner", "Kota", "Sri Ganganagar"],
  "Tamil Nadu": ["Erode", "Coimbatore", "Tiruchirappalli", "Salem", "Madurai"],
  "Uttar Pradesh": ["Agra", "Kanpur", "Varanasi", "Lucknow", "Bareilly"],
  "West Bengal": ["Bardhaman", "Hooghly", "Nadia", "Murshidabad", "Birbhum"]
};

const STATES = Object.keys(STATE_CITY_MAP).sort();

export function MandiLink() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [distance, setDistance] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("Grain");
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const vehiclesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "vehicles"));
  }, [firestore]);

  const { data: dbVehicles, isLoading: loadingVehicles } = useCollection(vehiclesQuery);

  const filteredVehicles = useMemo(() => {
    if (!dbVehicles) return [];
    return dbVehicles.filter(v => {
      const matchState = !selectedState || v.state === selectedState;
      const matchCity = !selectedCity || v.city === selectedCity;
      const matchSearch = !searchQuery || 
        v.agencyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.city.toLowerCase().includes(searchQuery.toLowerCase());
      return matchState && matchCity && matchSearch;
    });
  }, [dbVehicles, selectedState, selectedCity, searchQuery]);

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, "bookings"), where("farmerId", "==", user.uid));
  }, [firestore, user]);

  const { data: myBookings, isLoading: loadingBookings } = useCollection(bookingsQuery);

  const calculateEstimate = () => {
    const dist = parseFloat(distance);
    if (!isNaN(dist)) {
      const multiplier = selectedCrop === "Fruit" || selectedCrop === "Vegetable" ? 1.5 : 1.0;
      setEstimatedCost(dist * 22 * multiplier); // Average All-India rate
    }
  };

  const handleBook = (vehicle: any) => {
    if (!firestore || !user) {
      toast({ variant: "destructive", title: "Auth Required", description: "Please sign in to book transport." });
      return;
    }

    const bookingData = {
      farmerId: user.uid,
      vehicleId: vehicle.id,
      agencyName: vehicle.agencyName,
      cropType: selectedCrop,
      distance: parseFloat(distance) || 0,
      estimatedFare: estimatedCost || (parseFloat(distance) * (vehicle.pricePerKm || 20)) || 0,
      status: "Pending",
      createdAt: new Date().toISOString(),
      origin: `${selectedCity || 'Your Farm'}, ${selectedState || 'Local Region'}`,
      destination: "Nearest Regional Mandi Hub"
    };

    addDoc(collection(firestore, "bookings"), bookingData);
    toast({ title: "Booking Request Sent", description: "The agency will confirm your pickup shortly." });
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    // Simulate distance to nearest Mandi
    const simulatedDist = 15 + Math.floor(Math.random() * 45);
    setDistance(simulatedDist.toString());
    toast({
      title: "Location Detected",
      description: `Nearest Mandi hub for ${city} is approx ${simulatedDist} KM away.`,
    });
  };

  const getStatusStep = (status: string) => {
    const steps = ["Pending", "Confirmed", "Picked Up", "In Transit", "Reached Destination"];
    return steps.indexOf(status);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Tabs defaultValue="browse" className="w-full">
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm pb-4 -mx-2 px-2">
          <TabsList className="bg-muted rounded-full p-1 h-12 mb-6 shadow-inner w-fit">
            <TabsTrigger value="browse" className="rounded-full px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-xs uppercase tracking-widest transition-all">
              Find Transport
            </TabsTrigger>
            <TabsTrigger value="bookings" className="rounded-full px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-xs uppercase tracking-widest transition-all">
              Live Shipments
            </TabsTrigger>
          </TabsList>

          <Card className="border-none shadow-xl rounded-3xl bg-white p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">State</label>
                <Select value={selectedState} onValueChange={(v) => { setSelectedState(v); setSelectedCity(""); }}>
                  <SelectTrigger className="rounded-2xl h-11 border-none bg-muted/30 font-bold">
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">City Hub</label>
                <Select value={selectedCity} onValueChange={handleCitySelect} disabled={!selectedState}>
                  <SelectTrigger className="rounded-2xl h-11 border-none bg-muted/30 font-bold">
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedState && STATE_CITY_MAP[selectedState].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Commodity</label>
                <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                  <SelectTrigger className="rounded-2xl h-11 border-none bg-muted/30 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Grain">Grains / Pulses</SelectItem>
                    <SelectItem value="Fruit">Fruits (Perishable)</SelectItem>
                    <SelectItem value="Vegetable">Vegetables (Perishable)</SelectItem>
                    <SelectItem value="Seed">Seeds / Planting Material</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Agency Name</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input 
                    placeholder="Search fleet..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-2xl h-11 pl-9 border-none bg-muted/30 font-bold"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <TabsContent value="browse" className="space-y-10 pt-4">
          {/* Fare Calculator */}
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 text-white p-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <Calculator className="h-48 w-48 rotate-12" />
            </div>
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-4">
                <Badge className="bg-primary/20 text-primary border-none text-[10px] font-black uppercase px-3">Logistics Forecaster</Badge>
                <h3 className="text-3xl font-black tracking-tight">Mandi-Link Fare Estimator</h3>
                <p className="text-slate-400 font-medium">Get accurate pricing for your harvest shipment based on current regional fuel indexes and load type.</p>
                <div className="flex gap-4 pt-4">
                  <div className="relative flex-1">
                    <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input 
                      placeholder="Distance (KM)" 
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                      className="h-14 pl-12 bg-white/5 border-white/10 rounded-2xl font-bold text-lg text-white"
                    />
                  </div>
                  <Button onClick={calculateEstimate} className="h-14 px-8 rounded-2xl font-black bg-primary hover:bg-primary/90">Calculate</Button>
                </div>
              </div>
              {estimatedCost !== null && (
                <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-8 border border-white/10 text-center animate-in zoom-in-95 duration-300">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Estimated Market Fare</p>
                  <p className="text-5xl font-black tracking-tighter">₹{estimatedCost.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-500 mt-4 font-bold italic">Includes Mandi entry fee, insurance & local tolls</p>
                </div>
              )}
            </div>
          </Card>

          {/* Vehicle Directory */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <Truck className="h-7 w-7 text-primary" />
                Verified Regional Fleet
              </h2>
              <Badge variant="outline" className="font-bold text-xs uppercase text-muted-foreground border-border">{filteredVehicles.length} Providers Found</Badge>
            </div>
            
            {loadingVehicles ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <Card key={i} className="h-80 rounded-[2.5rem] bg-muted animate-pulse border-none shadow-sm" />)}
              </div>
            ) : filteredVehicles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVehicles.map((v) => (
                  <Card key={v.id} className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden group hover:shadow-2xl transition-all duration-300">
                    <CardHeader className="p-8 pb-0">
                      <div className="flex justify-between items-start mb-6">
                        <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <Truck className="h-8 w-8" />
                        </div>
                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary bg-primary/5">
                          ₹{v.pricePerKm || 22}/km
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl font-black">{v.agencyName}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-black text-slate-700 uppercase tracking-tight">Base Hub: {v.city}, {v.state}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                      <div className="p-4 bg-muted/30 rounded-2xl space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          <span>Vehicle Class</span>
                          <span>Payload</span>
                        </div>
                        <div className="flex justify-between font-bold text-sm">
                          <span>{v.type}</span>
                          <span>{v.type.includes('Heavy') ? '15 Tons' : '2-5 Tons'}</span>
                        </div>
                      </div>
                      
                      {(selectedCrop === 'Fruit' || selectedCrop === 'Vegetable') && v.type.includes('Refrigerated') ? (
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-blue-600" />
                          <span className="text-[10px] font-black text-blue-900 uppercase">Recommended for perishables</span>
                        </div>
                      ) : (
                        <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                          <Info className="h-5 w-5 text-slate-400" />
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Verified Provider • Standard Transit</span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="p-8 pt-0 flex gap-4">
                      <Button 
                        onClick={() => handleBook(v)}
                        className="flex-1 h-12 rounded-xl font-black gap-2 shadow-lg shadow-primary/20"
                      >
                        Request Booking
                      </Button>
                      <Button variant="outline" size="icon" asChild className="h-12 w-12 rounded-xl border-slate-200 hover:border-primary transition-colors">
                        <a href={`tel:${v.contact || '+919876543210'}`}><Phone className="h-5 w-5" /></a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-muted/20 rounded-[4rem] border-2 border-dashed border-border/50">
                <MapPin className="h-20 w-20 text-muted-foreground/20 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-slate-800">No Agencies in {selectedCity || selectedState || 'Region'}</h3>
                <p className="text-muted-foreground mt-2 font-medium">Try selecting a different State or Hub for broader availability.</p>
                <Button variant="outline" className="mt-8 rounded-full h-12 px-8 font-black text-xs uppercase tracking-widest" onClick={() => { setSelectedState(""); setSelectedCity(""); }}>View Neighboring Cities</Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6 pt-4">
          {!myBookings?.length ? (
            <div className="text-center py-40 bg-muted/20 rounded-[4rem]">
              <Package className="h-16 w-16 text-muted-foreground/20 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-slate-800">No Active Shipments</h3>
              <p className="text-muted-foreground mt-2 font-medium">Find and book transport in the "Find Transport" tab to start tracking.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {myBookings.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((booking) => (
                <Card key={booking.id} className="border-none shadow-xl rounded-[3rem] overflow-hidden bg-white">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-0">
                    <div className="p-8 lg:border-r border-border bg-slate-50/50 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-muted-foreground uppercase">ID: {booking.id.slice(-6)}</p>
                          <h4 className="font-black text-lg leading-tight">{booking.agencyName}</h4>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Commodity</p>
                        <p className="text-sm font-bold text-slate-700">{booking.cropType}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Fare</p>
                        <p className="text-xl font-black text-primary">₹{booking.estimatedFare.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="p-8 lg:col-span-3 space-y-8">
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="h-4 w-4 rounded-full bg-primary ring-4 ring-primary/10" />
                            <div className="w-0.5 h-12 bg-muted-foreground/20 border-dashed border-l" />
                            <div className="h-4 w-4 rounded-full bg-muted shadow-inner" />
                          </div>
                          <div className="flex flex-col justify-between py-0.5">
                            <div>
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Origin Point</p>
                              <p className="text-xs font-bold">{booking.origin}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Delivery Target</p>
                              <p className="text-xs font-bold">{booking.destination}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <Badge className={cn(
                            "rounded-full px-6 h-10 font-black text-xs uppercase tracking-widest",
                            booking.status === 'Reached Destination' ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'
                          )}>
                            {booking.status}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 rounded-full text-destructive hover:bg-destructive/10"
                            onClick={() => toast({ title: "Issue Logged", description: "Authorities notified. Reference ID: " + booking.id.slice(-4), variant: "destructive" })}
                          >
                            <AlertTriangle className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>

                      {/* Progress Stepper */}
                      <div className="relative pt-4">
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-1000" 
                            style={{ width: `${(getStatusStep(booking.status) + 1) * 20}%` }} 
                          />
                        </div>
                        <div className="flex justify-between mt-4">
                          {["Booked", "Confirm", "Pickup", "Transit", "Delivered"].map((label, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-1">
                              <div className={cn(
                                "h-2 w-2 rounded-full transition-colors",
                                getStatusStep(booking.status) >= idx ? "bg-primary" : "bg-muted"
                              )} />
                              <span className={cn(
                                "text-[8px] font-black uppercase tracking-tighter",
                                getStatusStep(booking.status) >= idx ? "text-primary" : "text-muted-foreground"
                              )}>{label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
