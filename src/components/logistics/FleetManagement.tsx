
'use client';

import React, { useState } from "react";
import { 
  Truck, 
  MapPin, 
  Phone, 
  Edit3, 
  Save, 
  Plus, 
  TrendingUp, 
  Globe,
  Settings2,
  Package,
  CheckCircle2,
  AlertCircle,
  Navigation,
  Loader2,
  RefreshCw,
  MoreVertical,
  User,
  Building2,
  DollarSign,
  Zap,
  X,
  Check,
  Globe2
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useFirestore, useCollection, useUser, useMemoFirebase, useDoc } from "@/firebase";
import { collection, query, where, doc, updateDoc, addDoc, getDocs, writeBatch } from "firebase/firestore";
import { updateDocumentNonBlocking, addDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { INDIA_STATES } from "@/lib/india-data";

const STANDARD_FLEET_TEMPLATES = [
  { type: "Mini Truck (2T)", price: 18, platePrefix: "MT" },
  { type: "Heavy Truck (15T)", price: 35, platePrefix: "HT" },
  { type: "Pickup Van (1T)", price: 14, platePrefix: "PV" },
  { type: "Refrigerated Van (5T)", price: 45, platePrefix: "RV" },
  { type: "Tractor Trailer (8T)", price: 22, platePrefix: "TT" }
];

export function FleetManagement() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("bookings");
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  
  // Inline editing state
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>("");
  const [editContact, setEditContact] = useState<string>("");

  // Fetch Agency Profile
  const userRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, "users", user.uid);
  }, [firestore, user]);
  const { data: profile } = useDoc(userRef);

  // Fetch Provider's Fleet
  const fleetQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, "vehicles"), where("ownerId", "==", user.uid));
  }, [firestore, user]);
  const { data: myFleet, isLoading: loadingFleet } = useCollection(fleetQuery);

  // Fetch Active Bookings
  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, "bookings"));
  }, [firestore, user]);
  const { data: incomingBookings, isLoading: loadingBookings } = useCollection(bookingsQuery);

  const handleUpdateStatus = (bookingId: string, nextStatus: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, "bookings", bookingId);
    updateDocumentNonBlocking(docRef, { 
      status: nextStatus,
      updatedAt: new Date().toISOString() 
    });
    
    toast({
      title: "Shipment Updated",
      description: `Status changed to ${nextStatus}. The farmer has been notified.`,
    });
  };

  const handleInitializeAllIndiaFleet = async () => {
    if (!firestore || !user) return;
    setIsSeeding(true);
    
    try {
      const vehiclesCol = collection(firestore, "vehicles");
      // Seed 2 vehicles for every state to show national reach
      for (const state of INDIA_STATES) {
        for (let i = 0; i < 2; i++) {
          const template = STANDARD_FLEET_TEMPLATES[Math.floor(Math.random() * STANDARD_FLEET_TEMPLATES.length)];
          const district = state.districts[i % state.districts.length];
          const plate = `${state.code}-${Math.floor(10 + Math.random() * 89)}-${template.platePrefix}-${Math.floor(1000 + Math.random() * 8999)}`;
          
          await addDoc(vehiclesCol, {
            ownerId: user.uid,
            agencyName: `${state.name} Agri-Freight ${i + 1}`,
            type: template.type,
            plateNumber: plate,
            pricePerKm: template.price + Math.floor(Math.random() * 10),
            contact: "+91 90000 00000",
            city: district,
            state: state.name,
            isAvailable: true,
            createdAt: new Date().toISOString()
          });
        }
      }
      toast({ title: "All-India Fleet Deployed", description: "Successfully seeded 70+ logistics units across India." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: e.message });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore || !user) return;
    
    const formData = new FormData(e.currentTarget);
    const vehicleData = {
      ownerId: user.uid,
      agencyName: profile?.firstName || "My Logistics Agency",
      type: formData.get("type") as string,
      plateNumber: (formData.get("plateNumber") as string).toUpperCase(),
      pricePerKm: Number(formData.get("pricePerKm")) || profile?.basePrice || 25,
      contact: formData.get("contact") as string || profile?.phone || "+919876543210",
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      isAvailable: true,
      createdAt: new Date().toISOString()
    };

    addDocumentNonBlocking(collection(firestore, "vehicles"), vehicleData);
    setIsAddVehicleOpen(false);
    toast({ title: "Vehicle Added", description: "The new vehicle is now listed in the Mandi-Link marketplace." });
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userRef || !user) return;
    setIsUpdatingProfile(true);
    
    const formData = new FormData(e.currentTarget);
    setDocumentNonBlocking(userRef, {
      id: user.uid,
      firstName: formData.get("agencyName"),
      phone: formData.get("contact"),
      basePrice: Number(formData.get("basePrice")),
      city: formData.get("city"),
      state: formData.get("state"),
      role: "Logistics"
    }, { merge: true });

    setIsUpdatingProfile(false);
    toast({ title: "Profile Updated", description: "Agency details have been synchronized." });
  };

  const getNextStatus = (current: string) => {
    const sequence = ["Pending", "Confirmed", "Picked Up", "In Transit", "Reached Destination"];
    const idx = sequence.indexOf(current);
    return idx < sequence.length - 1 ? sequence[idx + 1] : null;
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Truck className="h-9 w-9 text-primary" />
            Logistics Provider Hub
          </h2>
          <p className="text-muted-foreground font-medium mt-1 uppercase text-[10px] tracking-widest">National Fleet Oversight & Agency Management</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1 rounded-full shadow-sm border">
          <Button 
            variant="outline" 
            onClick={handleInitializeAllIndiaFleet} 
            disabled={isSeeding}
            className="rounded-full h-10 px-6 font-black text-xs border-primary/20 text-primary"
          >
            {isSeeding ? <Loader2 className="animate-spin mr-2" /> : <Globe2 className="h-4 w-4 mr-2" />}
            Deploy All-India Fleet
          </Button>
          <Dialog open={isAddVehicleOpen} onOpenChange={setIsAddVehicleOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full h-10 px-8 font-black text-xs bg-primary shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4 mr-2" /> Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2rem] sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">Register New Vehicle</DialogTitle>
                <DialogDescription>Add a new custom unit to your active service fleet.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddVehicle} className="space-y-6 pt-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vehicle Type</Label>
                  <Select name="type" defaultValue="Mini Truck (2T)">
                    <SelectTrigger className="rounded-xl h-12 border-none bg-muted/30 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Heavy Truck (15T)">Heavy Truck (15T)</SelectItem>
                      <SelectItem value="Mini Truck (2T)">Mini Truck (2T)</SelectItem>
                      <SelectItem value="Pickup Van (1T)">Pickup Van (1T)</SelectItem>
                      <SelectItem value="Refrigerated Van (5T)">Refrigerated Van (5T)</SelectItem>
                      <SelectItem value="Tractor Trailer (8T)">Tractor Trailer (8T)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Base City</Label>
                    <Input name="city" placeholder="e.g. Ludhiana" required className="rounded-xl h-12 bg-muted/30 border-none font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">State</Label>
                    <Input name="state" placeholder="e.g. Punjab" required className="rounded-xl h-12 bg-muted/30 border-none font-bold" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Plate Number</Label>
                  <Input name="plateNumber" placeholder="e.g. PB-02-AT-1234" required className="rounded-xl h-12 bg-muted/30 border-none font-bold uppercase" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Price per KM (₹)</Label>
                  <Input name="pricePerKm" type="number" defaultValue={profile?.basePrice || 25} className="rounded-xl h-12 bg-muted/30 border-none font-bold" />
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full h-12 rounded-xl font-black">Register in Fleet</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted/50 rounded-full p-1 h-12 mb-10 w-fit">
          <TabsTrigger value="bookings" className="rounded-full px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-xs uppercase tracking-widest">
            Incoming Loads
          </TabsTrigger>
          <TabsTrigger value="fleet" className="rounded-full px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-xs uppercase tracking-widest">
            My Fleet ({myFleet?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-full px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-xs uppercase tracking-widest">
            Agency Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-8">
          {!incomingBookings?.length ? (
            <Card className="border-dashed border-2 p-32 text-center bg-muted/20 rounded-[3rem]">
              <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
              <h3 className="text-2xl font-black">No Active Assignments</h3>
              <p className="text-muted-foreground mt-2 font-medium">Wait for incoming harvest booking requests across your sectors.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {incomingBookings.map((booking) => {
                const next = getNextStatus(booking.status);
                return (
                  <Card key={booking.id} className="border-none shadow-xl rounded-[3rem] overflow-hidden bg-white hover:shadow-2xl transition-all duration-300">
                    <div className="p-8 flex flex-col lg:flex-row items-center justify-between gap-10">
                      <div className="flex items-center gap-8 w-full lg:w-auto">
                        <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary shrink-0">
                          <Package className="h-10 w-10" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h4 className="text-2xl font-black">{booking.cropType} Load</h4>
                            <Badge variant="outline" className="text-[10px] font-black uppercase bg-primary/5 text-primary border-primary/10">
                              {booking.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                            <Navigation className="h-3.5 w-3.5" />
                            To: {booking.destination}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 flex-1 w-full text-center">
                        <div>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Distance</p>
                          <p className="text-lg font-black">{booking.distance} KM</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Est. Fare</p>
                          <p className="text-lg font-black text-primary">₹{booking.estimatedFare.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Commodity</p>
                          <p className="text-lg font-black">{booking.cropType}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Mandi Hub</p>
                          <p className="text-lg font-black">Active</p>
                        </div>
                      </div>

                      <div className="flex gap-4 w-full lg:w-auto">
                        {next ? (
                          <Button 
                            onClick={() => handleUpdateStatus(booking.id, next)}
                            className="flex-1 lg:w-48 h-14 rounded-2xl font-black gap-2 shadow-lg shadow-primary/20"
                          >
                            <RefreshCw className="h-5 w-5" />
                            Confirm {next}
                          </Button>
                        ) : (
                          <Button disabled className="flex-1 lg:w-48 h-14 rounded-2xl font-black bg-green-500 text-white">
                            <CheckCircle2 className="h-5 w-5 mr-2" /> Completed
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="fleet" className="space-y-8">
          {!myFleet?.length ? (
            <div className="text-center py-32 bg-muted/10 rounded-[4rem] border-2 border-dashed flex flex-col items-center gap-6">
              <Truck className="h-16 w-16 text-muted-foreground/30 mx-auto" />
              <h3 className="text-2xl font-black">National Fleet is Empty</h3>
              <p className="text-muted-foreground max-w-md mx-auto font-medium">Use the "Deploy All-India Fleet" button to demonstrate nationwide logistics capacity.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myFleet.map((v) => (
                <Card key={v.id} className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 space-y-6 group hover:shadow-2xl transition-all">
                  <div className="flex justify-between items-start">
                    <div className="h-14 w-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <Truck className="h-8 w-8" />
                    </div>
                    <Badge className="rounded-full h-8 px-4 font-bold text-[10px] uppercase bg-green-100 text-green-700">Active</Badge>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xl font-black">{v.type}</h4>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{v.plateNumber}</p>
                    <p className="text-xs font-bold text-muted-foreground flex items-center gap-1 mt-2">
                      <MapPin className="h-3.5 w-3.5 text-primary" /> {v.city}, {v.state}
                    </p>
                  </div>
                  <div className="pt-4 border-t flex justify-between items-center">
                    <span className="text-[10px] font-black text-muted-foreground uppercase">Rate / KM</span>
                    <div className="h-10 px-4 rounded-xl flex items-center font-black text-primary bg-primary/5">
                      ₹{v.pricePerKm}/km
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings">
          <Card className="border-none shadow-xl rounded-[3rem] bg-white overflow-hidden p-10">
            <form onSubmit={handleUpdateProfile} className="space-y-8 max-w-2xl">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Agency Name</Label>
                  <Input name="agencyName" defaultValue={profile?.firstName || ""} className="rounded-2xl h-14 bg-muted/30 border-none font-bold text-lg" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Base City</Label>
                    <Input name="city" defaultValue={profile?.city || ""} className="rounded-xl h-12 bg-muted/30 border-none font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">State</Label>
                    <Input name="state" defaultValue={profile?.state || ""} className="rounded-xl h-12 bg-muted/30 border-none font-bold" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Default Rate (₹/KM)</Label>
                  <Input name="basePrice" type="number" defaultValue={profile?.basePrice || 25} className="rounded-2xl h-14 bg-muted/30 border-none font-bold text-lg" />
                </div>
              </div>
              <Button type="submit" disabled={isUpdatingProfile} className="w-full h-14 rounded-2xl font-black text-lg">
                {isUpdatingProfile ? <Loader2 className="animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
                Sync Agency Identity
              </Button>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
