
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
  Zap
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
import { collection, query, where, doc, updateDoc, addDoc } from "firebase/firestore";
import { updateDocumentNonBlocking, addDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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

  // Fetch Agency Profile from User Doc
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

  // Fetch Active Bookings for this Provider
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

  const handleInitializeDefaultFleet = async () => {
    if (!firestore || !user || !profile) {
      toast({ 
        variant: "destructive", 
        title: "Profile Incomplete", 
        description: "Please complete your Agency Profile first so we can assign your location and contact to the fleet." 
      });
      return;
    }

    setIsSeeding(true);
    try {
      for (const template of STANDARD_FLEET_TEMPLATES) {
        const plate = `${profile.state?.substring(0,2).toUpperCase() || 'IN'}-${Math.floor(10 + Math.random() * 89)}-${template.platePrefix}-${Math.floor(1000 + Math.random() * 8999)}`;
        
        addDocumentNonBlocking(collection(firestore, "vehicles"), {
          ownerId: user.uid,
          agencyName: profile.firstName || "My Logistics Agency",
          type: template.type,
          plateNumber: plate,
          pricePerKm: template.price,
          contact: profile.phone || "+919876543210",
          city: profile.city || "Local Hub",
          state: profile.state || "Local State",
          isAvailable: true,
          createdAt: new Date().toISOString()
        });
      }
      toast({ title: "Fleet Initialized", description: "Your standard professional fleet has been deployed." });
    } catch (e) {
      toast({ variant: "destructive", title: "Initialization Failed", description: "Could not seed default fleet." });
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
      city: profile?.city || "Local Hub",
      state: profile?.state || "Local State",
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
    toast({ title: "Profile Updated", description: "Agency details have been synchronized across your fleet." });
  };

  const handleUpdateVehiclePrice = (vehicleId: string, currentPrice: number) => {
    if (!firestore) return;
    const newPrice = prompt("Enter new Price per KM (₹):", currentPrice.toString());
    if (newPrice && !isNaN(Number(newPrice))) {
      const docRef = doc(firestore, "vehicles", vehicleId);
      updateDocumentNonBlocking(docRef, { pricePerKm: Number(newPrice) });
      toast({ title: "Price Adjusted", description: "Market rate has been updated for this vehicle." });
    }
  };

  const handleUpdateVehicleContact = (vehicleId: string, currentContact: string) => {
    if (!firestore) return;
    const newContact = prompt("Enter new Contact Number:", currentContact);
    if (newContact !== null && newContact.trim() !== "") {
      const docRef = doc(firestore, "vehicles", vehicleId);
      updateDocumentNonBlocking(docRef, { contact: newContact.trim() });
      toast({ title: "Contact Updated", description: "Vehicle contact information has been updated." });
    }
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
          <p className="text-muted-foreground font-medium mt-1 uppercase text-[10px] tracking-widest">Global Fleet Oversight & Agency Management</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1 rounded-full shadow-sm border">
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
                      <SelectValue placeholder="Select Type" />
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
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Plate Number</Label>
                  <Input name="plateNumber" placeholder="e.g. PB-02-AT-1234" required className="rounded-xl h-12 bg-muted/30 border-none font-bold uppercase" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vehicle Contact</Label>
                  <Input name="contact" placeholder="e.g. +91 9876543210" defaultValue={profile?.phone || ""} className="rounded-xl h-12 bg-muted/30 border-none font-bold" />
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
          <div className="grid grid-cols-1 gap-6">
            {!incomingBookings?.length ? (
              <Card className="border-dashed border-2 p-32 text-center bg-muted/20 rounded-[3rem]">
                <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
                <h3 className="text-2xl font-black">No Active Assignments</h3>
                <p className="text-muted-foreground mt-2 font-medium">Wait for incoming harvest booking requests.</p>
              </Card>
            ) : (
              incomingBookings.map((booking) => {
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
                            To: {booking.destination || "Regional Mandi Hub"}
                          </p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trip ID: {booking.id.slice(-8)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 flex-1 w-full text-center">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Distance</p>
                          <p className="text-lg font-black">{booking.distance} KM</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Est. Fare</p>
                          <p className="text-lg font-black text-primary">₹{booking.estimatedFare.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Commodity</p>
                          <p className="text-lg font-black">{booking.cropType}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Logistics</p>
                          <p className="text-lg font-black">Verified</p>
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
                          <Button 
                            disabled 
                            className="flex-1 lg:w-48 h-14 rounded-2xl font-black bg-green-500 text-white"
                          >
                            <CheckCircle2 className="h-5 w-5 mr-2" />
                            Completed
                          </Button>
                        )}
                        <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-slate-200">
                          <MoreVertical className="h-6 w-6" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="fleet" className="space-y-8">
          {loadingFleet ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
          ) : !myFleet?.length ? (
            <div className="text-center py-32 bg-muted/10 rounded-[4rem] border-2 border-dashed flex flex-col items-center gap-6">
              <Truck className="h-16 w-16 text-muted-foreground/30 mx-auto" />
              <div className="space-y-2">
                <h3 className="text-2xl font-black">Your Fleet is Empty</h3>
                <p className="text-muted-foreground max-w-md mx-auto font-medium">
                  Initialize your professional inventory with standard agricultural vehicle types or add custom units manually.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  onClick={handleInitializeDefaultFleet} 
                  disabled={isSeeding}
                  className="h-14 px-10 rounded-2xl font-black bg-slate-900 text-white shadow-xl hover:bg-slate-800"
                >
                  {isSeeding ? <Loader2 className="animate-spin mr-2" /> : <Zap className="h-5 w-5 mr-2 text-primary" />}
                  Initialize Standard Fleet
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsAddVehicleOpen(true)}
                  className="h-14 px-10 rounded-2xl font-black border-slate-200 hover:bg-muted"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Custom Vehicle
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myFleet.map((v) => (
                <Card key={v.id} className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 space-y-6 group hover:shadow-2xl transition-all">
                  <div className="flex justify-between items-start">
                    <div className="h-14 w-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <Truck className="h-8 w-8" />
                    </div>
                    <Badge className={cn(
                      "rounded-full h-8 px-4 font-bold text-[10px] uppercase",
                      v.isAvailable ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    )}>
                      {v.isAvailable ? 'Active' : 'Busy'}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xl font-black">{v.type}</h4>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{v.plateNumber}</p>
                    <p className="text-xs font-bold text-muted-foreground flex items-center gap-1 mt-2">
                      <MapPin className="h-3.5 w-3.5 text-primary" /> {v.city}, {v.state}
                    </p>
                  </div>
                  <div className="pt-4 border-t space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-muted-foreground uppercase">Current Rate</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleUpdateVehiclePrice(v.id, v.pricePerKm)}
                        className="h-10 px-4 rounded-xl font-black text-primary bg-primary/5 hover:bg-primary/10 transition-all active:scale-95"
                      >
                        ₹{v.pricePerKm}/km <Edit3 className="h-3 w-3 ml-2 opacity-50" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                      <span className="text-[10px] font-black text-muted-foreground uppercase">Fleet Contact</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleUpdateVehicleContact(v.id, v.contact)}
                        className="h-10 px-4 rounded-xl font-bold flex items-center gap-2 hover:bg-white/50 transition-all active:scale-95"
                      >
                        <Phone className="h-3 w-3" /> {v.contact} <Edit3 className="h-3 w-3 ml-1 opacity-50" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings">
          <Card className="border-none shadow-xl rounded-[3rem] bg-white overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3">
              <div className="bg-slate-50 p-10 space-y-6">
                <div className="h-24 w-24 bg-primary rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-primary/20 mx-auto md:mx-0">
                  <Building2 className="h-12 w-12" />
                </div>
                <div className="space-y-2 text-center md:text-left">
                  <h3 className="text-2xl font-black">Agency Profile</h3>
                  <p className="text-sm text-muted-foreground font-medium">Update your professional identity and base pricing for the Mandi-Link network.</p>
                </div>
                <div className="pt-6 space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border shadow-sm">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-[10px] font-black uppercase text-muted-foreground">Verification</p>
                      <p className="text-xs font-bold">Authenticated Partner</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2 p-10">
                <form onSubmit={handleUpdateProfile} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Registered Agency Name</Label>
                      <Input name="agencyName" defaultValue={profile?.firstName || ""} placeholder="Enter agency name" className="rounded-2xl h-14 bg-muted/30 border-none font-bold text-lg" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Public Contact Number</Label>
                      <Input name="contact" defaultValue={profile?.phone || ""} placeholder="+91 00000 00000" className="rounded-2xl h-14 bg-muted/30 border-none font-bold text-lg" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Default Base Rate (₹/KM)</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                        <Input name="basePrice" type="number" defaultValue={profile?.basePrice || 25} className="rounded-2xl h-14 pl-12 bg-muted/30 border-none font-bold text-lg" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Base City</Label>
                        <Input name="city" defaultValue={profile?.city || ""} placeholder="e.g. Ludhiana" className="rounded-xl h-14 bg-muted/30 border-none font-bold" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">State</Label>
                        <Input name="state" defaultValue={profile?.state || ""} placeholder="e.g. Punjab" className="rounded-xl h-14 bg-muted/30 border-none font-bold" />
                      </div>
                    </div>
                  </div>
                  <div className="pt-6 border-t">
                    <Button 
                      type="submit" 
                      disabled={isUpdatingProfile}
                      className="w-full md:w-64 h-14 rounded-2xl font-black text-lg shadow-lg shadow-primary/20"
                    >
                      {isUpdatingProfile ? <Loader2 className="animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
                      Sync Agency Profile
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
