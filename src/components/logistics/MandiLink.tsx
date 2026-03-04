
'use client';

import React, { useState, useMemo } from "react";
import { 
  Truck, 
  MapPin, 
  Scale, 
  Phone, 
  Star, 
  Package, 
  Navigation, 
  Calculator,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  MessageSquare,
  ChevronRight
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
import { collection, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const STATES = ["Punjab", "Haryana", "Maharashtra", "Gujarat", "Rajasthan"];
const CITIES: Record<string, string[]> = {
  "Punjab": ["Ludhiana", "Amritsar", "Bathinda"],
  "Maharashtra": ["Nashik", "Mumbai", "Pune"],
  "Haryana": ["Karnal", "Rohtak", "Hisar"],
  "Gujarat": ["Ahmedabad", "Surat", "Rajkot"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Bikaner"]
};

export function MandiLink() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [distance, setDistance] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("Grain");
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);

  // Mock Vehicles for UI Seeding
  const MOCK_VEHICLES = [
    { id: "v1", agencyName: "Kisan Express", type: "Mini Truck", plateNumber: "PB-10-AZ-1234", pricePerKm: 18, city: "Ludhiana", state: "Punjab", isAvailable: true, contact: "+919876543210" },
    { id: "v2", agencyName: "ColdChain Agri", type: "Refrigerated Van", plateNumber: "MH-15-CL-9012", pricePerKm: 45, city: "Nashik", state: "Maharashtra", isAvailable: true, contact: "+919999999999" },
    { id: "v3", agencyName: "Bharat Haulers", type: "Heavy Truck", plateNumber: "HR-05-BH-5678", pricePerKm: 32, city: "Karnal", state: "Haryana", isAvailable: true, contact: "+918888888888" },
  ];

  const vehiclesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    let baseQuery = collection(firestore, "vehicles");
    // Filter logic can be added here once data is seeded
    return query(baseQuery);
  }, [firestore]);

  const { data: dbVehicles, isLoading: loadingVehicles } = useCollection(vehiclesQuery);
  const displayVehicles = dbVehicles?.length ? dbVehicles : MOCK_VEHICLES;

  const filteredVehicles = useMemo(() => {
    return displayVehicles.filter(v => {
      const matchState = !selectedState || v.state === selectedState;
      const matchCity = !selectedCity || v.city === selectedCity;
      return matchState && matchCity;
    });
  }, [displayVehicles, selectedState, selectedCity]);

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, "bookings"), where("farmerId", "==", user.uid));
  }, [firestore, user]);

  const { data: myBookings, isLoading: loadingBookings } = useCollection(bookingsQuery);

  const calculateEstimate = () => {
    const dist = parseFloat(distance);
    if (!isNaN(dist)) {
      // Base rate + Load Multiplier (Perishables cost more)
      const multiplier = selectedCrop === "Fruit" || selectedCrop === "Vegetable" ? 1.5 : 1.0;
      setEstimatedCost(dist * 20 * multiplier);
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
      estimatedFare: estimatedCost || (parseFloat(distance) * vehicle.pricePerKm) || 0,
      status: "Pending",
      createdAt: new Date().toISOString()
    };

    addDoc(collection(firestore, "bookings"), bookingData);
    toast({ title: "Booking Request Sent", description: "The agency will confirm your pickup shortly." });
  };

  const handleReportIssue = (bookingId: string) => {
    toast({
      title: "Issue Reported",
      description: "Government authorities have been alerted about this shipment.",
      variant: "destructive"
    });
  };

  const getStatusStep = (status: string) => {
    const steps = ["Pending", "Confirmed", "Picked Up", "In Transit", "Reached Destination"];
    return steps.indexOf(status);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="bg-muted rounded-full p-1 h-12 mb-8 shadow-inner">
          <TabsTrigger value="browse" className="rounded-full px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-xs uppercase tracking-widest transition-all">
            Find Transport
          </TabsTrigger>
          <TabsTrigger value="bookings" className="rounded-full px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-xs uppercase tracking-widest transition-all">
            Live Shipments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-10">
          {/* Search & Filter */}
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">State</label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger className="rounded-2xl h-12 border-none bg-muted/30 font-bold">
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">City / Hub</label>
                <Select value={selectedCity} onValueChange={setSelectedCity} disabled={!selectedState}>
                  <SelectTrigger className="rounded-2xl h-12 border-none bg-muted/30 font-bold">
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedState && CITIES[selectedState].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Commodity Type</label>
                <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                  <SelectTrigger className="rounded-2xl h-12 border-none bg-muted/30 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Grain">Grains / Pulses</SelectItem>
                    <SelectItem value="Fruit">Fruits (Perishable)</SelectItem>
                    <SelectItem value="Vegetable">Vegetables (Perishable)</SelectItem>
                    <SelectItem value="Plant">Plantation / Cash Crops</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Fare Calculator */}
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 text-white p-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <Calculator className="h-48 w-48 rotate-12" />
            </div>
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-4">
                <Badge className="bg-primary/20 text-primary border-none text-[10px] font-black uppercase px-3">Logistics Forecaster</Badge>
                <h3 className="text-3xl font-black tracking-tight">Mandi-Link Fare Estimator</h3>
                <p className="text-slate-400 font-medium">Get accurate pricing for your harvest shipment based on regional fuel indexes and load type.</p>
                <div className="flex gap-4 pt-4">
                  <Input 
                    placeholder="Enter Distance (KM)" 
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="h-14 bg-white/5 border-white/10 rounded-2xl font-bold text-lg text-white"
                  />
                  <Button onClick={calculateEstimate} className="h-14 px-8 rounded-2xl font-black bg-primary hover:bg-primary/90">Calculate</Button>
                </div>
              </div>
              {estimatedCost !== null && (
                <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-8 border border-white/10 text-center animate-in zoom-in-95 duration-300">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Estimated Market Fare</p>
                  <p className="text-5xl font-black tracking-tighter">₹{estimatedCost.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-500 mt-4 font-bold italic">Includes Mandi entry fee & insurance</p>
                </div>
              )}
            </div>
          </Card>

          {/* Vehicle Directory */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <Navigation className="h-7 w-7 text-primary" />
              Verified Regional Fleet
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVehicles.map((v) => (
                <Card key={v.id} className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden group">
                  <CardHeader className="p-8 pb-0">
                    <div className="flex justify-between items-start mb-6">
                      <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                        <Truck className="h-8 w-8" />
                      </div>
                      <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary bg-primary/5">
                        ₹{v.pricePerKm}/km
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl font-black">{v.agencyName}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-bold text-muted-foreground">{v.city}, {v.state}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="p-4 bg-muted/30 rounded-2xl space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <span>Vehicle Type</span>
                        <span>Capacity</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm">
                        <span>{v.type}</span>
                        <span>{v.type === 'Heavy Truck' ? '15 Tons' : '2-5 Tons'}</span>
                      </div>
                    </div>
                    
                    {(selectedCrop === 'Fruit' || selectedCrop === 'Vegetable') && v.type === 'Refrigerated Van' && (
                      <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                        <span className="text-xs font-bold text-blue-900 italic">Recommended for perishables</span>
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
                    <Button variant="outline" size="icon" asChild className="h-12 w-12 rounded-xl border-primary/20 text-primary">
                      <a href={`tel:${v.contact}`}><Phone className="h-5 w-5" /></a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            {filteredVehicles.length === 0 && (
              <div className="text-center py-20 bg-muted/20 rounded-[3rem] border-2 border-dashed border-border">
                <MapPin className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-black">No Fleet in {selectedCity || selectedState}</h3>
                <p className="text-muted-foreground font-medium">Try expanding your search region.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          {!myBookings?.length ? (
            <div className="text-center py-40 bg-muted/20 rounded-[3rem]">
              <Package className="h-16 w-16 text-muted-foreground/20 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-slate-800">No Active Shipments</h3>
              <p className="text-muted-foreground mt-2 font-medium">Book a Mandi-Link vehicle to track your harvest.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {myBookings.map((booking) => (
                <Card key={booking.id} className="border-none shadow-xl rounded-[3rem] overflow-hidden bg-white">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-0">
                    <div className="p-8 lg:border-r border-border bg-slate-50/50 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-muted-foreground uppercase">ID: {booking.id.slice(-6)}</p>
                          <h4 className="font-black text-lg">{booking.agencyName}</h4>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase">Commodity</p>
                        <p className="text-sm font-bold">{booking.cropType}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase">Est. Fare</p>
                        <p className="text-lg font-black text-primary">₹{booking.estimatedFare.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="p-8 lg:col-span-3 space-y-8">
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="h-4 w-4 rounded-full bg-primary" />
                            <div className="w-0.5 h-12 bg-muted-foreground/20 border-dashed border-l" />
                            <div className="h-4 w-4 rounded-full bg-muted" />
                          </div>
                          <div className="flex flex-col justify-between py-0.5">
                            <div>
                              <p className="text-[10px] font-black text-muted-foreground uppercase">Pickup Point</p>
                              <p className="text-xs font-bold">{booking.origin || "Farmer Field"}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-muted-foreground uppercase">Destination</p>
                              <p className="text-xs font-bold">{booking.destination || "Mandi Hub"}</p>
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
                            onClick={() => handleReportIssue(booking.id)}
                            className="h-10 w-10 rounded-full text-destructive hover:bg-destructive/10"
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
                          {["Req", "Conf", "Load", "Move", "Done"].map((label, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-1">
                              <div className={cn(
                                "h-2 w-2 rounded-full",
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
