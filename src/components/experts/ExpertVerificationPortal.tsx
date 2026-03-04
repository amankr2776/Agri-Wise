
'use client';

import React, { useState } from "react";
import { 
  ShieldCheck, 
  FlaskConical, 
  AlertCircle, 
  ClipboardCheck,
  Loader2,
  Database,
  Microscope,
  Trash2,
  Bug,
  Zap,
  Send
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, addDoc, getDocs, writeBatch } from "firebase/firestore";
import { updateDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppState } from "@/lib/app-state";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_CROPS = [
  // Grains (Field Crops)
  { name: "Paddy (Rice)", category: "Grain", diseaseName: "Stem Borer / Leaf Folder", severity: "High", chemicalCure: "Flubendiamide 20% WG", chemicalDosage: "0.5g/L", desiNuskha: "Install T-shaped bird perches to attract predatory birds.", isCertified: true, imageUrl: "https://picsum.photos/seed/rice1/800/600", irrigationInterval: 3, estimatedMarketPrice: 2200, sowingSeason: "Kharif", soilType: "Clayey" },
  { name: "Wheat", category: "Grain", diseaseName: "Rust (Yellow/Brown)", severity: "High", chemicalCure: "Propiconazole 25% EC", chemicalDosage: "1ml/L", desiNuskha: "Spray Fermented Sour Buttermilk (1:10 dilution).", isCertified: true, imageUrl: "https://picsum.photos/seed/wheat1/800/600", irrigationInterval: 12, estimatedMarketPrice: 2450, sowingSeason: "Rabi", soilType: "Loamy" },
  { name: "Maize", category: "Grain", diseaseName: "Fall Armyworm", severity: "Critical", chemicalCure: "Chlorantraniliprole 18.5% SC", chemicalDosage: "0.4ml/L", desiNuskha: "Place dry sand mixed with lime in leaf whorls.", isCertified: true, imageUrl: "https://picsum.photos/seed/maize1/800/600", irrigationInterval: 7, estimatedMarketPrice: 1950, sowingSeason: "Kharif/Rabi", soilType: "Loamy" },
  { name: "Bajra (Millet)", category: "Grain", diseaseName: "Downy Mildew", severity: "Medium", chemicalCure: "Metalaxyl Seed Treatment", chemicalDosage: "6g/kg", desiNuskha: "Soak seeds in Cow Urine for 2 hours before sowing.", isCertified: true, imageUrl: "https://picsum.photos/seed/millet1/800/600", irrigationInterval: 10, estimatedMarketPrice: 2100, sowingSeason: "Kharif", soilType: "Sandy" },
  { name: "Chickpea", category: "Grain", diseaseName: "Wilt / Root Rot", severity: "High", chemicalCure: "Trichoderma viride treatment", chemicalDosage: "4g/kg", desiNuskha: "Drench soil with Jeevamrutha (Cow dung/urine mix).", isCertified: true, imageUrl: "https://picsum.photos/seed/chickpea1/800/600", irrigationInterval: 15, estimatedMarketPrice: 5200, sowingSeason: "Rabi", soilType: "Black soil" },
  
  // Vegetables
  { name: "Potato", category: "Vegetable", diseaseName: "Late Blight", severity: "Critical", chemicalCure: "Cymoxanil 8% + Mancozeb 64%", chemicalDosage: "2.5g/L", desiNuskha: "Dust plants with Wood Ash in the early morning.", isCertified: true, imageUrl: "https://picsum.photos/seed/potato1/800/600", irrigationInterval: 8, estimatedMarketPrice: 1800, sowingSeason: "Winter", soilType: "Sandy Loam" },
  { name: "Tomato", category: "Vegetable", diseaseName: "Early Blight / Borers", severity: "High", chemicalCure: "Mancozeb / Bt var. Kurstaki", chemicalDosage: "2g/L", desiNuskha: "Spray Panchagavya (3%) to boost leaf immunity.", isCertified: true, imageUrl: "https://picsum.photos/seed/tomato1/800/600", irrigationInterval: 4, estimatedMarketPrice: 3500, sowingSeason: "Year-round", soilType: "Loamy" },
  { name: "Brinjal", category: "Vegetable", diseaseName: "Shoot & Fruit Borer", severity: "High", chemicalCure: "Chlorantraniliprole 18.5% SC", chemicalDosage: "0.4ml/L", desiNuskha: "Intercrop with Lucerne and use pheromone traps.", isCertified: true, imageUrl: "https://picsum.photos/seed/brinjal1/800/600", irrigationInterval: 5, estimatedMarketPrice: 2200, sowingSeason: "Summer/Winter", soilType: "Loamy" },
  { name: "Onion", category: "Vegetable", diseaseName: "Thrips", severity: "Medium", chemicalCure: "Fipronil 5% SC", chemicalDosage: "2ml/L", desiNuskha: "Spray Neem Oil mixed with liquid soap.", isCertified: true, imageUrl: "https://picsum.photos/seed/onion1/800/600", irrigationInterval: 10, estimatedMarketPrice: 2800, sowingSeason: "Winter/Rabi", soilType: "Sandy Loam" },
  { name: "Chilli", category: "Vegetable", diseaseName: "Leaf Curl (Virus)", severity: "High", chemicalCure: "Acetamiprid 20 SP", chemicalDosage: "1g/L", desiNuskha: "Spray Sour Chhaas (Buttermilk) to deactivate virus.", isCertified: true, imageUrl: "https://picsum.photos/seed/chilli1/800/600", irrigationInterval: 4, estimatedMarketPrice: 12000, sowingSeason: "Summer/Monsoon", soilType: "Loamy" },
  
  // Fruits
  { name: "Mango", category: "Fruit", diseaseName: "Mealy Bug / Hopper", severity: "Medium", chemicalCure: "Imidacloprid / Methyl Demeton", chemicalDosage: "1ml/L", desiNuskha: "Tree Banding: Wrap 25cm plastic sheets on trunk.", isCertified: true, imageUrl: "https://picsum.photos/seed/mango1/800/600", irrigationInterval: 15, estimatedMarketPrice: 8500, sowingSeason: "Summer", soilType: "Laterite" },
  { name: "Banana", category: "Fruit", diseaseName: "Panama Wilt", severity: "Critical", chemicalCure: "Carbendazim (injection)", chemicalDosage: "3ml/plant", desiNuskha: "Soil drenching with fermented cow urine and water.", isCertified: true, imageUrl: "https://picsum.photos/seed/banana1/800/600", irrigationInterval: 5, estimatedMarketPrice: 4200, sowingSeason: "Spring", soilType: "Rich Loam" },
  { name: "Apple", category: "Fruit", diseaseName: "Woolly Aphid / Mites", severity: "High", chemicalCure: "Carbofuran 3 CG / Fenazaquin", chemicalDosage: "1g/L", desiNuskha: "Apply Bordeaux Paste (Lime + Copper) to the trunk.", isCertified: true, imageUrl: "https://picsum.photos/seed/apple1/800/600", irrigationInterval: 12, estimatedMarketPrice: 15000, sowingSeason: "Winter", soilType: "Acidic/Loamy" },
  { name: "Grapes", category: "Fruit", diseaseName: "Downy Mildew", severity: "High", chemicalCure: "Azoxystrobin 23% SC", chemicalDosage: "1ml/L", desiNuskha: "Foliar spray of Panchagavya during flowering.", isCertified: true, imageUrl: "https://picsum.photos/seed/grapes1/800/600", irrigationInterval: 7, estimatedMarketPrice: 6500, sowingSeason: "Winter", soilType: "Well-drained" },
  
  // Plants (Plantations)
  { name: "Sugarcane", category: "Plant", diseaseName: "Termites / Red Rot", severity: "High", chemicalCure: "Chlorpyriphos / Carbendazim", chemicalDosage: "2ml/L", desiNuskha: "Apply Crushed Neem Cake in the soil during planting.", isCertified: true, imageUrl: "https://picsum.photos/seed/sugar1/800/600", irrigationInterval: 10, estimatedMarketPrice: 3200, sowingSeason: "Spring", soilType: "Alluvial" },
  { name: "Cotton", category: "Plant", diseaseName: "Whitefly / Bollworms", severity: "High", chemicalCure: "Acetamiprid 20 SP / Acephate", chemicalDosage: "2g/L", desiNuskha: "Use Yellow Sticky Traps and spray Agniastra.", isCertified: true, imageUrl: "https://picsum.photos/seed/cotton1/800/600", irrigationInterval: 12, estimatedMarketPrice: 7500, sowingSeason: "Kharif", soilType: "Black soil" },
  { name: "Coconut", category: "Plant", diseaseName: "Rhinoceros Beetle", severity: "Medium", chemicalCure: "Imidacloprid (root feeding)", chemicalDosage: "10ml/tree", desiNuskha: "Place Sand + Neem Powder in leaf axils.", isCertified: true, imageUrl: "https://picsum.photos/seed/coconut1/800/600", irrigationInterval: 15, estimatedMarketPrice: 4500, sowingSeason: "Year-round", soilType: "Sandy/Coastal" },
  { name: "Coffee", category: "Plant", diseaseName: "White Stem Borer", severity: "High", chemicalCure: "Chlorpyrifos 20 EC", chemicalDosage: "2.5ml/L", desiNuskha: "Bark Scrubbing: Manual removal of loose bark.", isCertified: true, imageUrl: "https://picsum.photos/seed/coffee1/800/600", irrigationInterval: 8, estimatedMarketPrice: 28000, sowingSeason: "Monsoon", soilType: "Volcanic/Acidic" },
  
  // Seeds
  { name: "Hybrid Paddy Seed", category: "Seed", diseaseName: "Fungal Infection", severity: "Medium", chemicalCure: "Thiram 75% DS", chemicalDosage: "3g/kg", desiNuskha: "Solar heat treatment before packaging.", isCertified: true, imageUrl: "https://picsum.photos/seed/seed1/800/600", irrigationInterval: 2, estimatedMarketPrice: 3800, sowingSeason: "Kharif", soilType: "Clayey" },
  { name: "BT Cotton Seed", category: "Seed", diseaseName: "Seedling Rot", severity: "High", chemicalCure: "Carboxin 75% WP", chemicalDosage: "2g/kg", desiNuskha: "Beejamrutha treatment for bio-protection.", isCertified: true, imageUrl: "https://picsum.photos/seed/seed2/800/600", irrigationInterval: 5, estimatedMarketPrice: 12000, sowingSeason: "Kharif", soilType: "Black soil" }
];

export function ExpertVerificationPortal() {
  const firestore = useFirestore();
  const { role } = useAppState();
  const { user } = useUser();
  const { toast } = useToast();
  const [seeding, setSeeding] = useState(false);

  const pendingCertsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "crops"), where("isCertified", "==", false));
  }, [firestore]);

  const { data: pendingCerts, isLoading } = useCollection(pendingCertsQuery);

  const handleVerify = (certId: string) => {
    if (!firestore || !certId) return;
    updateDocumentNonBlocking(doc(firestore, "crops", certId), {
      isCertified: true,
      verifiedAt: new Date().toISOString()
    });
    toast({ title: "Protocol Certified", description: "Verified and added to the registry." });
  };

  const purgeAndSeed = async () => {
    if (!firestore) return;
    setSeeding(true);
    try {
      const cropsCol = collection(firestore, "crops");
      const existingCrops = await getDocs(cropsCol);
      const batch = writeBatch(firestore);
      existingCrops.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();

      for (const crop of DEFAULT_CROPS) {
        await addDoc(cropsCol, { ...crop, createdAt: new Date().toISOString() });
      }
      toast({ title: "Grid Re-Seeded", description: `${DEFAULT_CROPS.length} professional profiles deployed.` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: e.message });
    } finally {
      setSeeding(false);
    }
  };

  if (role !== "Expert" && role !== "Authority") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h3 className="text-2xl font-black">Expert Access Required</h3>
        <p className="text-muted-foreground max-w-sm">This portal is reserved for certified agricultural scientists and authorities.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black flex items-center gap-3 text-slate-900">
            <FlaskConical className="h-8 w-8 text-primary" />
            Surveillance Hub
          </h2>
          <p className="text-muted-foreground font-medium mt-1">Deploy regional pest advisories and certify field protocols.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={purgeAndSeed} disabled={seeding} className="rounded-2xl font-black px-6 h-14">
            {seeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
            Reset & Sync Registry
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm p-6 bg-primary/5 rounded-3xl">
          <div className="flex items-center gap-3 mb-2">
            <Microscope className="h-5 w-5 text-primary" />
            <h4 className="text-[10px] font-black uppercase text-primary">Protocol Status</h4>
          </div>
          <p className="text-2xl font-black">Active Grid</p>
        </Card>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-80 rounded-[2.5rem]" />)}
        </div>
      ) : !pendingCerts || pendingCerts.length === 0 ? (
        <Card className="border-dashed border-2 p-24 text-center bg-muted/20 rounded-[3rem]">
          <ClipboardCheck className="h-12 w-12 text-primary opacity-50 mx-auto mb-8" />
          <h3 className="text-2xl font-black">Queue Clear</h3>
          <p className="text-muted-foreground mt-2 font-medium">No pending user-submitted protocols for verification.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingCerts.map((cert) => (
            <Card key={cert.id} className="border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-300">
              <div className="relative aspect-video">
                <img src={cert.imageUrl} className="w-full h-full object-cover" alt={cert.name} />
              </div>
              <CardHeader className="p-8">
                <CardTitle className="text-2xl font-black">{cert.name}</CardTitle>
                <div className="space-y-2 mt-4">
                  <p className="text-[10px] font-black text-muted-foreground uppercase">Diagnosed Problem</p>
                  <p className="text-sm font-bold text-destructive">{cert.diseaseName}</p>
                </div>
              </CardHeader>
              <CardFooter className="p-8 pt-0 mt-auto">
                <Button className="w-full h-12 rounded-xl font-black" onClick={() => handleVerify(cert.id)}>
                  <ShieldCheck className="h-4 w-4 mr-2" /> Certify Protocol
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
