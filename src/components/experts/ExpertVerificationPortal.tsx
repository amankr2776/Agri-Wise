
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
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppState } from "@/lib/app-state";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_CROPS = [
  // --- GRAINS (20 entries) ---
  { name: "Paddy (Rice)", category: "Grain", diseaseName: "Stem Borer", severity: "High", chemicalCure: "Flubendiamide 20% WG", chemicalDosage: "0.5g/L", desiNuskha: "Install T-shaped bird perches to attract predatory birds.", isCertified: true, imageUrl: "https://picsum.photos/seed/rice1/800/600", irrigationInterval: 3, estimatedMarketPrice: 2200, sowingSeason: "Kharif", soilType: "Clayey" },
  { name: "Wheat", category: "Grain", diseaseName: "Rust (Yellow/Brown)", severity: "High", chemicalCure: "Propiconazole 25% EC", chemicalDosage: "1ml/L", desiNuskha: "Spray Fermented Sour Buttermilk (1:10 dilution).", isCertified: true, imageUrl: "https://picsum.photos/seed/wheat1/800/600", irrigationInterval: 12, estimatedMarketPrice: 2450, sowingSeason: "Rabi", soilType: "Loamy" },
  { name: "Maize", category: "Grain", diseaseName: "Fall Armyworm", severity: "Critical", chemicalCure: "Chlorantraniliprole 18.5% SC", chemicalDosage: "0.4ml/L", desiNuskha: "Place dry sand mixed with lime in leaf whorls.", isCertified: true, imageUrl: "https://picsum.photos/seed/maize1/800/600", irrigationInterval: 7, estimatedMarketPrice: 1950, sowingSeason: "Kharif/Rabi", soilType: "Loamy" },
  { name: "Bajra (Millet)", category: "Grain", diseaseName: "Downy Mildew", severity: "Medium", chemicalCure: "Metalaxyl Seed Treatment", chemicalDosage: "6g/kg", desiNuskha: "Soak seeds in Cow Urine for 2 hours before sowing.", isCertified: true, imageUrl: "https://picsum.photos/seed/millet1/800/600", irrigationInterval: 10, estimatedMarketPrice: 2100, sowingSeason: "Kharif", soilType: "Sandy" },
  { name: "Pigeon Pea", category: "Grain", diseaseName: "Pod Borer", severity: "High", chemicalCure: "Emamectin Benzoate 5% SG", chemicalDosage: "0.4g/L", desiNuskha: "Spray Neem Seed Kernel Extract (NSKE) 5%.", isCertified: true, imageUrl: "https://picsum.photos/seed/pigeon1/800/600", irrigationInterval: 14, estimatedMarketPrice: 6500, sowingSeason: "Kharif", soilType: "Well-drained" },
  { name: "Sorghum (Jowar)", category: "Grain", diseaseName: "Grain Smut", severity: "Medium", chemicalCure: "Sulphur 80% WP", chemicalDosage: "4g/kg", desiNuskha: "Solar heat treatment of seeds on a concrete floor.", isCertified: true, imageUrl: "https://picsum.photos/seed/jowar1/800/600", irrigationInterval: 10, estimatedMarketPrice: 2800, sowingSeason: "Kharif/Rabi", soilType: "Heavy Clay" },
  { name: "Finger Millet (Ragi)", category: "Grain", diseaseName: "Blast", severity: "High", chemicalCure: "Tricyclazole 75 WP", chemicalDosage: "0.6g/L", desiNuskha: "Seed treatment with Pseudomonas fluorescens.", isCertified: true, imageUrl: "https://picsum.photos/seed/ragi1/800/600", irrigationInterval: 8, estimatedMarketPrice: 3500, sowingSeason: "Kharif", soilType: "Red soil" },
  { name: "Barley", category: "Grain", diseaseName: "Loose Smut", severity: "Low", chemicalCure: "Carboxin 75% WP", chemicalDosage: "2.5g/kg", desiNuskha: "Hot water treatment at 52°C for 10 minutes.", isCertified: true, imageUrl: "https://picsum.photos/seed/barley1/800/600", irrigationInterval: 15, estimatedMarketPrice: 1800, sowingSeason: "Rabi", soilType: "Sandy Loam" },
  { name: "Buckwheat", category: "Grain", diseaseName: "Leaf Spot", severity: "Low", chemicalCure: "Mancozeb 75 WP", chemicalDosage: "2g/L", desiNuskha: "Crop rotation with non-host cereals.", isCertified: true, imageUrl: "https://picsum.photos/seed/buckwheat1/800/600", irrigationInterval: 7, estimatedMarketPrice: 4200, sowingSeason: "Summer/Winter", soilType: "Acidic" },
  { name: "Oats", category: "Grain", diseaseName: "Crown Rust", severity: "Medium", chemicalCure: "Propiconazole", chemicalDosage: "1ml/L", desiNuskha: "Eradication of wild oats near the field.", isCertified: true, imageUrl: "https://picsum.photos/seed/oats1/800/600", irrigationInterval: 10, estimatedMarketPrice: 2200, sowingSeason: "Rabi", soilType: "Alluvial" },
  { name: "Black Gram (Urad)", category: "Grain", diseaseName: "Yellow Mosaic Virus", severity: "High", chemicalCure: "Imidacloprid 17.8 SL", chemicalDosage: "0.5ml/L", desiNuskha: "Apply a mixture of 10% wood ash and fine soil.", isCertified: true, imageUrl: "https://picsum.photos/seed/urad1/800/600", irrigationInterval: 12, estimatedMarketPrice: 7200, sowingSeason: "Kharif/Rabi", soilType: "Black Cotton" },
  { name: "Green Gram (Moong)", category: "Grain", diseaseName: "Powdery Mildew", severity: "Medium", chemicalCure: "Wettable Sulphur", chemicalDosage: "3g/L", desiNuskha: "Spray Ginger garlic extract (5%) weekly.", isCertified: true, imageUrl: "https://picsum.photos/seed/moong1/800/600", irrigationInterval: 10, estimatedMarketPrice: 7800, sowingSeason: "Summer/Kharif", soilType: "Loamy" },
  { name: "Lentil (Masoor)", category: "Grain", diseaseName: "Wilt", severity: "High", chemicalCure: "Carbendazim 50 WP", chemicalDosage: "2g/kg", desiNuskha: "Deep summer plowing to kill soil pathogens.", isCertified: true, imageUrl: "https://picsum.photos/seed/masoor1/800/600", irrigationInterval: 15, estimatedMarketPrice: 6400, sowingSeason: "Rabi", soilType: "Alluvial" },
  { name: "Horse Gram", category: "Grain", diseaseName: "Root Rot", severity: "Medium", chemicalCure: "Trichoderma viride", chemicalDosage: "4g/kg", desiNuskha: "Seed soaking in 1% salt solution for 10 mins.", isCertified: true, imageUrl: "https://picsum.photos/seed/horsegram1/800/600", irrigationInterval: 20, estimatedMarketPrice: 4500, sowingSeason: "Kharif", soilType: "Poor soil" },
  { name: "Foxtail Millet", category: "Grain", diseaseName: "Blast", severity: "Low", chemicalCure: "Carbendazim", chemicalDosage: "1g/L", desiNuskha: "Foliar spray of 5% cow urine.", isCertified: true, imageUrl: "https://picsum.photos/seed/foxtail1/800/600", irrigationInterval: 12, estimatedMarketPrice: 3200, sowingSeason: "Kharif", soilType: "Loamy" },
  { name: "Little Millet", category: "Grain", diseaseName: "Grain Smut", severity: "Medium", chemicalCure: "Sulphur treatment", chemicalDosage: "3g/kg", desiNuskha: "Seed dressing with Ash and cow dung.", isCertified: true, imageUrl: "https://picsum.photos/seed/littlemillet1/800/600", irrigationInterval: 14, estimatedMarketPrice: 3100, sowingSeason: "Kharif", soilType: "Poor soil" },
  { name: "Kodo Millet", category: "Grain", diseaseName: "Head Smut", severity: "High", chemicalCure: "Carboxin", chemicalDosage: "2g/kg", desiNuskha: "Burning of infected heads immediately.", isCertified: true, imageUrl: "https://picsum.photos/seed/kodo1/800/600", irrigationInterval: 15, estimatedMarketPrice: 3400, sowingSeason: "Kharif", soilType: "Gravelly" },
  { name: "Barnyard Millet", category: "Grain", diseaseName: "Rust", severity: "Low", chemicalCure: "Mancozeb", chemicalDosage: "2g/L", desiNuskha: "Intercropping with pulses like Urad.", isCertified: true, imageUrl: "https://picsum.photos/seed/barnyard1/800/600", irrigationInterval: 10, estimatedMarketPrice: 3300, sowingSeason: "Kharif", soilType: "Alluvial" },
  { name: "Chickpea", category: "Grain", diseaseName: "Wilt", severity: "High", chemicalCure: "Trichoderma treatment", chemicalDosage: "4g/kg", desiNuskha: "Drench soil with Jeevamrutha.", isCertified: true, imageUrl: "https://picsum.photos/seed/chickpea1/800/600", irrigationInterval: 15, estimatedMarketPrice: 5200, sowingSeason: "Rabi", soilType: "Black soil" },
  { name: "Safflower", category: "Grain", diseaseName: "Aphids", severity: "Medium", chemicalCure: "Acephate 75 SP", chemicalDosage: "1g/L", desiNuskha: "Spray Cow Urine + Garlic Extract.", isCertified: true, imageUrl: "https://picsum.photos/seed/safflower1/800/600", irrigationInterval: 15, estimatedMarketPrice: 5800, sowingSeason: "Rabi", soilType: "Clayey" },

  // --- VEGETABLES (20 entries) ---
  { name: "Potato", category: "Vegetable", diseaseName: "Late Blight", severity: "Critical", chemicalCure: "Cymoxanil + Mancozeb", chemicalDosage: "2.5g/L", desiNuskha: "Dust plants with Wood Ash early morning.", isCertified: true, imageUrl: "https://picsum.photos/seed/potato1/800/600", irrigationInterval: 8, estimatedMarketPrice: 1800, sowingSeason: "Winter", soilType: "Sandy Loam" },
  { name: "Brinjal", category: "Vegetable", diseaseName: "Shoot Borer", severity: "High", chemicalCure: "Chlorantraniliprole", chemicalDosage: "0.4ml/L", desiNuskha: "Intercrop with Lucerne and use pheromone traps.", isCertified: true, imageUrl: "https://picsum.photos/seed/brinjal1/800/600", irrigationInterval: 5, estimatedMarketPrice: 2200, sowingSeason: "Summer/Winter", soilType: "Loamy" },
  { name: "Onion", category: "Vegetable", diseaseName: "Thrips", severity: "Medium", chemicalCure: "Fipronil 5% SC", chemicalDosage: "2ml/L", desiNuskha: "Spray Neem Oil mixed with liquid soap.", isCertified: true, imageUrl: "https://picsum.photos/seed/onion1/800/600", irrigationInterval: 10, estimatedMarketPrice: 2800, sowingSeason: "Winter/Rabi", soilType: "Sandy Loam" },
  { name: "Tomato", category: "Vegetable", diseaseName: "Early Blight", severity: "High", chemicalCure: "Mancozeb / Bt", chemicalDosage: "2g/L", desiNuskha: "Spray Panchagavya (3%) to boost immunity.", isCertified: true, imageUrl: "https://picsum.photos/seed/tomato1/800/600", irrigationInterval: 4, estimatedMarketPrice: 3500, sowingSeason: "Year-round", soilType: "Loamy" },
  { name: "Chilli", category: "Vegetable", diseaseName: "Leaf Curl", severity: "High", chemicalCure: "Acetamiprid 20 SP", chemicalDosage: "1g/L", desiNuskha: "Spray Sour Chhaas (Buttermilk) to deactivate virus.", isCertified: true, imageUrl: "https://picsum.photos/seed/chilli1/800/600", irrigationInterval: 4, estimatedMarketPrice: 12000, sowingSeason: "Summer/Monsoon", soilType: "Loamy" },
  { name: "Okra (Bhindi)", category: "Vegetable", diseaseName: "Sucking Pests", severity: "Medium", chemicalCure: "Imidacloprid", chemicalDosage: "0.5ml/L", desiNuskha: "Use Yellow Sticky Traps with castor oil.", isCertified: true, imageUrl: "https://picsum.photos/seed/okra1/800/600", irrigationInterval: 3, estimatedMarketPrice: 3200, sowingSeason: "Summer", soilType: "Loamy" },
  { name: "Cabbage", category: "Vegetable", diseaseName: "Diamond Back Moth", severity: "High", chemicalCure: "Bacillus thuringiensis", chemicalDosage: "1g/L", desiNuskha: "Plant Mustard as a trap crop between rows.", isCertified: true, imageUrl: "https://picsum.photos/seed/cabbage1/800/600", irrigationInterval: 7, estimatedMarketPrice: 1500, sowingSeason: "Winter", soilType: "Heavy Loam" },
  { name: "Capsicum", category: "Vegetable", diseaseName: "Powdery Mildew", severity: "Medium", chemicalCure: "Wettable Sulphur", chemicalDosage: "2g/L", desiNuskha: "Spray Dashparni Ark (10 bitter leaves).", isCertified: true, imageUrl: "https://picsum.photos/seed/capsicum1/800/600", irrigationInterval: 5, estimatedMarketPrice: 4500, sowingSeason: "Summer", soilType: "Well-drained" },
  { name: "Cauliflower", category: "Vegetable", diseaseName: "Cutworms", severity: "Medium", chemicalCure: "Chlorpyrifos 20 EC", chemicalDosage: "2ml/L", desiNuskha: "Mix Neem oil in irrigation water for larvae.", isCertified: true, imageUrl: "https://picsum.photos/seed/cauliflower1/800/600", irrigationInterval: 6, estimatedMarketPrice: 2500, sowingSeason: "Winter", soilType: "Rich Loam" },
  { name: "Garlic", category: "Vegetable", diseaseName: "Purple Blotch", severity: "Low", chemicalCure: "Hexaconazole 5% EC", chemicalDosage: "1ml/L", desiNuskha: "Spray Cow Urine (1:10) as foliar stimulant.", isCertified: true, imageUrl: "https://picsum.photos/seed/garlic1/800/600", irrigationInterval: 10, estimatedMarketPrice: 8500, sowingSeason: "Rabi", soilType: "Sandy Loam" },
  { name: "Spinach", category: "Vegetable", diseaseName: "Downy Mildew", severity: "Medium", chemicalCure: "Metalaxyl", chemicalDosage: "2g/L", desiNuskha: "Spray fermented tobacco leaf solution.", isCertified: true, imageUrl: "https://picsum.photos/seed/spinach1/800/600", irrigationInterval: 3, estimatedMarketPrice: 1200, sowingSeason: "Year-round", soilType: "Nitrogen-rich" },
  { name: "Carrot", category: "Vegetable", diseaseName: "Leaf Blight", severity: "Low", chemicalCure: "Chlorothalonil", chemicalDosage: "2g/L", desiNuskha: "Deep sowing and thinning of seedlings.", isCertified: true, imageUrl: "https://picsum.photos/seed/carrot1/800/600", irrigationInterval: 10, estimatedMarketPrice: 2200, sowingSeason: "Winter", soilType: "Friable Sandy" },
  { name: "Radish", category: "Vegetable", diseaseName: "Aphids", severity: "Medium", chemicalCure: "Dimethoate", chemicalDosage: "1ml/L", desiNuskha: "Spray soap water mixed with chilli paste.", isCertified: true, imageUrl: "https://picsum.photos/seed/radish1/800/600", irrigationInterval: 5, estimatedMarketPrice: 1400, sowingSeason: "Year-round", soilType: "Sandy Loam" },
  { name: "Bitter Gourd", category: "Vegetable", diseaseName: "Fruit Fly", severity: "High", chemicalCure: "Malathion", chemicalDosage: "2ml/L", desiNuskha: "Bagging young fruits with paper covers.", isCertified: true, imageUrl: "https://picsum.photos/seed/bittergourd1/800/600", irrigationInterval: 4, estimatedMarketPrice: 3800, sowingSeason: "Summer", soilType: "Well-drained" },
  { name: "Bottle Gourd", category: "Vegetable", diseaseName: "Mosaic Virus", severity: "High", chemicalCure: "Thiamethoxam", chemicalDosage: "0.5g/L", desiNuskha: "Regular removal of weeds and silver mulching.", isCertified: true, imageUrl: "https://picsum.photos/seed/bottlegourd1/800/600", irrigationInterval: 5, estimatedMarketPrice: 1200, sowingSeason: "Summer/Monsoon", soilType: "Loamy" },
  { name: "Pumpkin", category: "Vegetable", diseaseName: "Red Beetle", severity: "Medium", chemicalCure: "Carbaryl dust", chemicalDosage: "2kg/Ha", desiNuskha: "Apply wood ash on leaves after dew.", isCertified: true, imageUrl: "https://picsum.photos/seed/pumpkin1/800/600", irrigationInterval: 7, estimatedMarketPrice: 1100, sowingSeason: "Kharif/Summer", soilType: "Alluvial" },
  { name: "Peas", category: "Vegetable", diseaseName: "Powdery Mildew", severity: "High", chemicalCure: "Sulphur Dust", chemicalDosage: "25kg/Ha", desiNuskha: "Spray water mixed with baking soda (1%).", isCertified: true, imageUrl: "https://picsum.photos/seed/peas1/800/600", irrigationInterval: 10, estimatedMarketPrice: 4200, sowingSeason: "Winter", soilType: "Loamy" },
  { name: "Cucumber", category: "Vegetable", diseaseName: "Anthracnose", severity: "Medium", chemicalCure: "Benomyl", chemicalDosage: "1g/L", desiNuskha: "Seed treatment with hot water (50°C).", isCertified: true, imageUrl: "https://picsum.photos/seed/cucumber1/800/600", irrigationInterval: 4, estimatedMarketPrice: 1800, sowingSeason: "Summer", soilType: "Sandy" },
  { name: "Beetroot", category: "Vegetable", diseaseName: "Leaf Spot", severity: "Low", chemicalCure: "Copper Oxychloride", chemicalDosage: "3g/L", desiNuskha: "Ensure balanced Potassium fertilization.", isCertified: true, imageUrl: "https://picsum.photos/seed/beetroot1/800/600", irrigationInterval: 8, estimatedMarketPrice: 2500, sowingSeason: "Winter", soilType: "Deep Loam" },
  { name: "Sweet Potato", category: "Vegetable", diseaseName: "Weevil", severity: "High", chemicalCure: "Phorate granules", chemicalDosage: "10kg/Ha", desiNuskha: "Vine dipping in 0.05% Fenthion solution.", isCertified: true, imageUrl: "https://picsum.photos/seed/sweetpotato1/800/600", irrigationInterval: 12, estimatedMarketPrice: 2800, sowingSeason: "Monsoon", soilType: "Sandy Loam" },

  // --- FRUITS (20 entries) ---
  { name: "Apple", category: "Fruit", diseaseName: "Woolly Aphid", severity: "High", chemicalCure: "Carbofuran", chemicalDosage: "1g/L", desiNuskha: "Apply Bordeaux Paste to the trunk.", isCertified: true, imageUrl: "https://picsum.photos/seed/apple1/800/600", irrigationInterval: 12, estimatedMarketPrice: 15000, sowingSeason: "Winter", soilType: "Acidic/Loamy" },
  { name: "Grapes", category: "Fruit", diseaseName: "Downy Mildew", severity: "High", chemicalCure: "Azoxystrobin", chemicalDosage: "1ml/L", desiNuskha: "Foliar spray of Panchagavya flowering.", isCertified: true, imageUrl: "https://picsum.photos/seed/grapes1/800/600", irrigationInterval: 7, estimatedMarketPrice: 6500, sowingSeason: "Winter", soilType: "Well-drained" },
  { name: "Lemon", category: "Fruit", diseaseName: "Citrus Canker", severity: "Medium", chemicalCure: "Streptomycin", chemicalDosage: "0.5g/L", desiNuskha: "Prune infected twigs and apply Cow dung.", isCertified: true, imageUrl: "https://picsum.photos/seed/lemon1/800/600", irrigationInterval: 8, estimatedMarketPrice: 4500, sowingSeason: "Year-round", soilType: "Sandy" },
  { name: "Watermelon", category: "Fruit", diseaseName: "Fruit Fly", severity: "High", chemicalCure: "Malathion", chemicalDosage: "2ml/L", desiNuskha: "Jaggery + Vinegar Traps in bottles.", isCertified: true, imageUrl: "https://picsum.photos/seed/watermelon1/800/600", irrigationInterval: 4, estimatedMarketPrice: 1200, sowingSeason: "Summer", soilType: "Sandy" },
  { name: "Mango", category: "Fruit", diseaseName: "Mealy Bug", severity: "Medium", chemicalCure: "Imidacloprid", chemicalDosage: "1ml/L", desiNuskha: "Tree Banding: Wrap plastic on trunk.", isCertified: true, imageUrl: "https://picsum.photos/seed/mango1/800/600", irrigationInterval: 15, estimatedMarketPrice: 8500, sowingSeason: "Summer", soilType: "Laterite" },
  { name: "Banana", category: "Fruit", diseaseName: "Panama Wilt", severity: "Critical", chemicalCure: "Carbendazim injection", chemicalDosage: "3ml/plant", desiNuskha: "Soil drenching with fermented cow urine.", isCertified: true, imageUrl: "https://picsum.photos/seed/banana1/800/600", irrigationInterval: 5, estimatedMarketPrice: 4200, sowingSeason: "Spring", soilType: "Rich Loam" },
  { name: "Pomegranate", category: "Fruit", diseaseName: "Fruit Borer", severity: "High", chemicalCure: "Spinosad", chemicalDosage: "0.3ml/L", desiNuskha: "Bag fruits with paper or cloth bags.", isCertified: true, imageUrl: "https://picsum.photos/seed/pom1/800/600", irrigationInterval: 10, estimatedMarketPrice: 9500, sowingSeason: "Winter", soilType: "Loamy" },
  { name: "Papaya", category: "Fruit", diseaseName: "Ring Spot Virus", severity: "Critical", chemicalCure: "Dimethoate", chemicalDosage: "2ml/L", desiNuskha: "Intercrop with Maize to confuse aphids.", isCertified: true, imageUrl: "https://picsum.photos/seed/papaya1/800/600", irrigationInterval: 4, estimatedMarketPrice: 2800, sowingSeason: "Spring", soilType: "Rich Loam" },
  { name: "Guava", category: "Fruit", diseaseName: "Fruit Fly", severity: "Medium", chemicalCure: "Fipronil", chemicalDosage: "1ml/L", desiNuskha: "Use Tulsi leaf paste as repellent spray.", isCertified: true, imageUrl: "https://picsum.photos/seed/guava1/800/600", irrigationInterval: 10, estimatedMarketPrice: 3500, sowingSeason: "Year-round", soilType: "Alluvial" },
  { name: "Sapota", category: "Fruit", diseaseName: "Leaf Webber", severity: "Low", chemicalCure: "Quinalphos", chemicalDosage: "2ml/L", desiNuskha: "Spray Neem Seed Kernel Extract (NSKE).", isCertified: true, imageUrl: "https://picsum.photos/seed/sapota1/800/600", irrigationInterval: 12, estimatedMarketPrice: 4200, sowingSeason: "Year-round", soilType: "Sandy" },
  { name: "Orange", category: "Fruit", diseaseName: "Tristeza Virus", severity: "High", chemicalCure: "Systemic insecticides", chemicalDosage: "1ml/L", desiNuskha: "Apply neem oil coating to lower branches.", isCertified: true, imageUrl: "https://picsum.photos/seed/orange1/800/600", irrigationInterval: 8, estimatedMarketPrice: 5500, sowingSeason: "Year-round", soilType: "Well-drained" },
  { name: "Pineapple", category: "Fruit", diseaseName: "Heart Rot", severity: "High", chemicalCure: "Copper Fungicides", chemicalDosage: "2g/L", desiNuskha: "Dip suckers in 1% Bordeaux mixture.", isCertified: true, imageUrl: "https://picsum.photos/seed/pineapple1/800/600", irrigationInterval: 15, estimatedMarketPrice: 4800, sowingSeason: "Monsoon", soilType: "Acidic" },
  { name: "Strawberry", category: "Fruit", diseaseName: "Botrytis Rot", severity: "High", chemicalCure: "Iprodione", chemicalDosage: "1.5g/L", desiNuskha: "Mulching with straw to keep fruit dry.", isCertified: true, imageUrl: "https://picsum.photos/seed/strawberry1/800/600", irrigationInterval: 2, estimatedMarketPrice: 18000, sowingSeason: "Winter", soilType: "Loamy" },
  { name: "Lychee", category: "Fruit", diseaseName: "Fruit Borer", severity: "Medium", chemicalCure: "Cypermethrin", chemicalDosage: "1ml/L", desiNuskha: "Spray tobacco leaf extract at maturity.", isCertified: true, imageUrl: "https://picsum.photos/seed/lychee1/800/600", irrigationInterval: 10, estimatedMarketPrice: 12000, sowingSeason: "Summer", soilType: "Deep Alluvial" },
  { name: "Jackfruit", category: "Fruit", diseaseName: "Shoot Borer", severity: "Low", chemicalCure: "Carbaryl", chemicalDosage: "2g/L", desiNuskha: "Apply mud plaster on the main trunk.", isCertified: true, imageUrl: "https://picsum.photos/seed/jackfruit1/800/600", irrigationInterval: 20, estimatedMarketPrice: 2500, sowingSeason: "Monsoon", soilType: "Laterite" },
  { name: "Custard Apple", category: "Fruit", diseaseName: "Mealy Bug", severity: "Medium", chemicalCure: "Verticillium lecanii", chemicalDosage: "5g/L", desiNuskha: "Spray starch solution to trap bugs.", isCertified: true, imageUrl: "https://picsum.photos/seed/custardapple1/800/600", irrigationInterval: 15, estimatedMarketPrice: 3200, sowingSeason: "Monsoon", soilType: "Rocky" },
  { name: "Muskmelon", category: "Fruit", diseaseName: "Wilt", severity: "High", chemicalCure: "Carbendazim", chemicalDosage: "2g/L", desiNuskha: "Spray ginger-chilli-garlic mix.", isCertified: true, imageUrl: "https://picsum.photos/seed/muskmelon1/800/600", irrigationInterval: 5, estimatedMarketPrice: 1500, sowingSeason: "Summer", soilType: "Sandy" },
  { name: "Fig", category: "Fruit", diseaseName: "Rust", severity: "Low", chemicalCure: "Sulphur spray", chemicalDosage: "3g/L", desiNuskha: "Prune heavily after the harvest season.", isCertified: true, imageUrl: "https://picsum.photos/seed/fig1/800/600", irrigationInterval: 12, estimatedMarketPrice: 8500, sowingSeason: "Winter", soilType: "Well-drained" },
  { name: "Pear", category: "Fruit", diseaseName: "Fire Blight", severity: "Critical", chemicalCure: "Copper sulphate", chemicalDosage: "2g/L", desiNuskha: "Immediate pruning 12 inches below canker.", isCertified: true, imageUrl: "https://picsum.photos/seed/pear1/800/600", irrigationInterval: 10, estimatedMarketPrice: 7500, sowingSeason: "Winter", soilType: "Deep Soil" },
  { name: "Peach", category: "Fruit", diseaseName: "Leaf Curl", severity: "High", chemicalCure: "Chlorothalonil", chemicalDosage: "2g/L", desiNuskha: "Winter spray of lime sulphur (5%).", isCertified: true, imageUrl: "https://picsum.photos/seed/peach1/800/600", irrigationInterval: 10, estimatedMarketPrice: 9000, sowingSeason: "Winter", soilType: "Sandy" },

  // --- PLANTS (20 entries) ---
  { name: "Sugarcane", category: "Plant", diseaseName: "Red Rot", severity: "High", chemicalCure: "Carbendazim", chemicalDosage: "2ml/L", desiNuskha: "Apply Crushed Neem Cake in soil.", isCertified: true, imageUrl: "https://picsum.photos/seed/sugar1/800/600", irrigationInterval: 10, estimatedMarketPrice: 3200, sowingSeason: "Spring", soilType: "Alluvial" },
  { name: "Cotton", category: "Plant", diseaseName: "Whitefly", severity: "High", chemicalCure: "Acetamiprid 20 SP", chemicalDosage: "2g/L", desiNuskha: "Use Yellow Sticky Traps and Agniastra.", isCertified: true, imageUrl: "https://picsum.photos/seed/cotton1/800/600", irrigationInterval: 12, estimatedMarketPrice: 7500, sowingSeason: "Kharif", soilType: "Black soil" },
  { name: "Castor", category: "Plant", diseaseName: "Hairy Caterpillar", severity: "Medium", chemicalCure: "Bt var. Kurstaki", chemicalDosage: "1g/L", desiNuskha: "Trenching around field + Kerosene traps.", isCertified: true, imageUrl: "https://picsum.photos/seed/castor1/800/600", irrigationInterval: 15, estimatedMarketPrice: 5500, sowingSeason: "Kharif", soilType: "Sandy" },
  { name: "Coconut", category: "Plant", diseaseName: "Rhinoceros Beetle", severity: "Medium", chemicalCure: "Imidacloprid root feeding", chemicalDosage: "10ml/tree", desiNuskha: "Sand + Neem Powder in leaf axils.", isCertified: true, imageUrl: "https://picsum.photos/seed/coconut1/800/600", irrigationInterval: 15, estimatedMarketPrice: 4500, sowingSeason: "Year-round", soilType: "Sandy/Coastal" },
  { name: "Black Pepper", category: "Plant", diseaseName: "Quick Wilt", severity: "High", chemicalCure: "Metalaxyl + Mancozeb", chemicalDosage: "2g/L", desiNuskha: "Trichoderma cow dung mix to roots.", isCertified: true, imageUrl: "https://picsum.photos/seed/pepper1/800/600", irrigationInterval: 7, estimatedMarketPrice: 65000, sowingSeason: "Monsoon", soilType: "Laterite" },
  { name: "Coffee", category: "Plant", diseaseName: "White Stem Borer", severity: "High", chemicalCure: "Chlorpyrifos", chemicalDosage: "2.5ml/L", desiNuskha: "Bark Scrubbing: manual removal of loose bark.", isCertified: true, imageUrl: "https://picsum.photos/seed/coffee1/800/600", irrigationInterval: 8, estimatedMarketPrice: 28000, sowingSeason: "Monsoon", soilType: "Volcanic" },
  { name: "Tea", category: "Plant", diseaseName: "Red Spider Mite", severity: "Medium", chemicalCure: "Fenazaquin", chemicalDosage: "1.5ml/L", desiNuskha: "High-pressure water spraying on leaves.", isCertified: true, imageUrl: "https://picsum.photos/seed/tea1/800/600", irrigationInterval: 5, estimatedMarketPrice: 18000, sowingSeason: "Spring", soilType: "Acidic" },
  { name: "Rubber", category: "Plant", diseaseName: "Abnormal Leaf Fall", severity: "High", chemicalCure: "Copper Oxychloride", chemicalDosage: "3g/L", desiNuskha: "Apply Bordeaux Mixture (1%) spray.", isCertified: true, imageUrl: "https://picsum.photos/seed/rubber1/800/600", irrigationInterval: 15, estimatedMarketPrice: 16000, sowingSeason: "Winter", soilType: "Laterite" },
  { name: "Arecanut", category: "Plant", diseaseName: "Yellow Leaf", severity: "High", chemicalCure: "Hexaconazole", chemicalDosage: "1ml/L", desiNuskha: "Weekly spray of fermented cow urine.", isCertified: true, imageUrl: "https://picsum.photos/seed/areca1/800/600", irrigationInterval: 10, estimatedMarketPrice: 42000, sowingSeason: "Monsoon", soilType: "Alluvial" },
  { name: "Cardamom", category: "Plant", diseaseName: "Thrips", severity: "Medium", chemicalCure: "Quinalphos", chemicalDosage: "2ml/L", desiNuskha: "Install Blue Sticky Traps in plantation.", isCertified: true, imageUrl: "https://picsum.photos/seed/cardamom1/800/600", irrigationInterval: 7, estimatedMarketPrice: 120000, sowingSeason: "Monsoon", soilType: "Forest Loam" },
  { name: "Turmeric", category: "Plant", diseaseName: "Rhizome Rot", severity: "High", chemicalCure: "Mancozeb", chemicalDosage: "3g/L", desiNuskha: "Dip rhizomes in Cow Urine + Turmeric.", isCertified: true, imageUrl: "https://picsum.photos/seed/turmeric1/800/600", irrigationInterval: 12, estimatedMarketPrice: 9500, sowingSeason: "Spring", soilType: "Sandy Loam" },
  { name: "Ginger", category: "Plant", diseaseName: "Soft Rot", severity: "High", chemicalCure: "Copper Oxychloride", chemicalDosage: "3g/L", desiNuskha: "Mulching with green leaves for temp control.", isCertified: true, imageUrl: "https://picsum.photos/seed/ginger1/800/600", irrigationInterval: 10, estimatedMarketPrice: 11000, sowingSeason: "Spring", soilType: "Laterite" },
  { name: "Jasmine", category: "Plant", diseaseName: "Bud Worm", severity: "Medium", chemicalCure: "Thiacloprid", chemicalDosage: "1ml/L", desiNuskha: "Spray Neem leaf decoction in evening.", isCertified: true, imageUrl: "https://picsum.photos/seed/jasmine1/800/600", irrigationInterval: 4, estimatedMarketPrice: 45000, sowingSeason: "Summer", soilType: "Loamy" },
  { name: "Tobacco", category: "Plant", diseaseName: "Leaf Spot", severity: "Medium", chemicalCure: "Streptocycline", chemicalDosage: "0.2g/L", desiNuskha: "Balanced fertilization with high Potash.", isCertified: true, imageUrl: "https://picsum.photos/seed/tobacco1/800/600", irrigationInterval: 10, estimatedMarketPrice: 15000, sowingSeason: "Winter", soilType: "Sandy Loam" },
  { name: "Jute", category: "Plant", diseaseName: "Stem Rot", severity: "High", chemicalCure: "Captan", chemicalDosage: "2g/L", desiNuskha: "Seed soaking in 1% salt water for 5 mins.", isCertified: true, imageUrl: "https://picsum.photos/seed/jute1/800/600", irrigationInterval: 7, estimatedMarketPrice: 6500, sowingSeason: "Monsoon", soilType: "Alluvial" },
  { name: "Vanilla", category: "Plant", diseaseName: "Root Rot", severity: "High", chemicalCure: "Bordeaux mixture", chemicalDosage: "1%", desiNuskha: "Foliar spray of coconut water + honey.", isCertified: true, imageUrl: "https://picsum.photos/seed/vanilla1/800/600", irrigationInterval: 3, estimatedMarketPrice: 250000, sowingSeason: "Year-round", soilType: "Humus-rich" },
  { name: "Cinnamon", category: "Plant", diseaseName: "Leaf Spot", severity: "Low", chemicalCure: "Copper fungicides", chemicalDosage: "3g/L", desiNuskha: "Intercropping with high canopy trees.", isCertified: true, imageUrl: "https://picsum.photos/seed/cinnamon1/800/600", irrigationInterval: 15, estimatedMarketPrice: 85000, sowingSeason: "Monsoon", soilType: "Sandy Loam" },
  { name: "Clove", category: "Plant", diseaseName: "Dieback", severity: "High", chemicalCure: "Copper oxychloride", chemicalDosage: "2g/L", desiNuskha: "Regular removal of dried twigs.", isCertified: true, imageUrl: "https://picsum.photos/seed/clove1/800/600", irrigationInterval: 10, estimatedMarketPrice: 110000, sowingSeason: "Year-round", soilType: "Red Clay" },
  { name: "Nutmeg", category: "Plant", diseaseName: "Fruit Rot", severity: "Medium", chemicalCure: "Carbendazim", chemicalDosage: "1g/L", desiNuskha: "Maintain proper drainage in orchards.", isCertified: true, imageUrl: "https://picsum.photos/seed/nutmeg1/800/600", irrigationInterval: 12, estimatedMarketPrice: 55000, sowingSeason: "Monsoon", soilType: "Loamy" },
  { name: "Marigold", category: "Plant", diseaseName: "Flower Blight", severity: "Low", chemicalCure: "Mancozeb", chemicalDosage: "2g/L", desiNuskha: "Neem oil spray every 10 days.", isCertified: true, imageUrl: "https://picsum.photos/seed/marigold1/800/600", irrigationInterval: 4, estimatedMarketPrice: 12000, sowingSeason: "Year-round", soilType: "Sandy Loam" },

  // --- SEEDS (20 entries) ---
  { name: "Hybrid Paddy Seed", category: "Seed", diseaseName: "Fungal Infection", severity: "Medium", chemicalCure: "Thiram 75% DS", chemicalDosage: "3g/kg", desiNuskha: "Solar heat treatment before packaging.", isCertified: true, imageUrl: "https://picsum.photos/seed/seed1/800/600", irrigationInterval: 2, estimatedMarketPrice: 3800, sowingSeason: "Kharif", soilType: "Clayey" },
  { name: "BT Cotton Seed", category: "Seed", diseaseName: "Seedling Rot", severity: "High", chemicalCure: "Carboxin 75% WP", chemicalDosage: "2g/kg", desiNuskha: "Beejamrutha treatment for bio-protection.", isCertified: true, imageUrl: "https://picsum.photos/seed/seed2/800/600", irrigationInterval: 5, estimatedMarketPrice: 12000, sowingSeason: "Kharif", soilType: "Black soil" },
  { name: "Mustard Seed", category: "Seed", diseaseName: "Alternaria Blight", severity: "Medium", chemicalCure: "Metalaxyl", chemicalDosage: "6g/kg", desiNuskha: "Seed soaking in hot water at 50°C.", isCertified: true, imageUrl: "https://picsum.photos/seed/mustardseed1/800/600", irrigationInterval: 15, estimatedMarketPrice: 5500, sowingSeason: "Rabi", soilType: "Sandy Loam" },
  { name: "Sunflower Seed", category: "Seed", diseaseName: "Head Rot", severity: "High", chemicalCure: "Captan", chemicalDosage: "2g/kg", desiNuskha: "Mixing seeds with wood ash before sowing.", isCertified: true, imageUrl: "https://picsum.photos/seed/sunflowerseed1/800/600", irrigationInterval: 10, estimatedMarketPrice: 6200, sowingSeason: "Year-round", soilType: "Deep Loam" },
  { name: "Soybean Seed", category: "Seed", diseaseName: "Rust", severity: "High", chemicalCure: "Hexaconazole", chemicalDosage: "1ml/L", desiNuskha: "Seed treatment with Trichoderma (10g/kg).", isCertified: true, imageUrl: "https://picsum.photos/seed/soybeanseed1/800/600", irrigationInterval: 12, estimatedMarketPrice: 4800, sowingSeason: "Kharif", soilType: "Loamy" },
  { name: "Groundnut Seed", category: "Seed", diseaseName: "Tikka Disease", severity: "High", chemicalCure: "Carbendazim", chemicalDosage: "2g/kg", desiNuskha: "Seed soaking in 1% lime solution.", isCertified: true, imageUrl: "https://picsum.photos/seed/groundnutseed1/800/600", irrigationInterval: 15, estimatedMarketPrice: 6500, sowingSeason: "Kharif/Rabi", soilType: "Sandy" },
  { name: "Sesame Seed", category: "Seed", diseaseName: "Phyllody", severity: "High", chemicalCure: "Dimethoate", chemicalDosage: "1.5ml/L", desiNuskha: "Removal of infected plants immediately.", isCertified: true, imageUrl: "https://picsum.photos/seed/sesameseed1/800/600", irrigationInterval: 14, estimatedMarketPrice: 12000, sowingSeason: "Summer/Kharif", soilType: "Well-drained" },
  { name: "Linseed", category: "Seed", diseaseName: "Wilt", severity: "Medium", chemicalCure: "Carboxin", chemicalDosage: "2.5g/kg", desiNuskha: "Mixed cropping with Wheat.", isCertified: true, imageUrl: "https://picsum.photos/seed/linseed1/800/600", irrigationInterval: 15, estimatedMarketPrice: 5800, sowingSeason: "Rabi", soilType: "Clayey" },
  { name: "Niger Seed", category: "Seed", diseaseName: "Cercospora", severity: "Low", chemicalCure: "Mancozeb", chemicalDosage: "2g/kg", desiNuskha: "Seed treatment with cow dung slurry.", isCertified: true, imageUrl: "https://picsum.photos/seed/nigerseed1/800/600", irrigationInterval: 20, estimatedMarketPrice: 6800, sowingSeason: "Kharif", soilType: "Poor soil" },
  { name: "Cluster Bean Seed", category: "Seed", diseaseName: "Bacterial Blight", severity: "High", chemicalCure: "Streptocycline", chemicalDosage: "0.5g/kg", desiNuskha: "Seed dipping in butter milk for 2 hours.", isCertified: true, imageUrl: "https://picsum.photos/seed/guarseed1/800/600", irrigationInterval: 10, estimatedMarketPrice: 5200, sowingSeason: "Kharif", soilType: "Sandy" },
  { name: "Fenugreek Seed", category: "Seed", diseaseName: "Damping off", severity: "Medium", chemicalCure: "Thiram", chemicalDosage: "3g/kg", desiNuskha: "Sun drying seeds for 3 days before storage.", isCertified: true, imageUrl: "https://picsum.photos/seed/methiseed1/800/600", irrigationInterval: 12, estimatedMarketPrice: 7500, sowingSeason: "Winter", soilType: "Loamy" },
  { name: "Coriander Seed", category: "Seed", diseaseName: "Stem Gall", severity: "High", chemicalCure: "Seed solarization", chemicalDosage: "N/A", desiNuskha: "Seed treatment with asafetida solution.", isCertified: true, imageUrl: "https://picsum.photos/seed/dhania1/800/600", irrigationInterval: 15, estimatedMarketPrice: 8500, sowingSeason: "Rabi", soilType: "Loamy" },
  { name: "Cumin Seed", category: "Seed", diseaseName: "Blight", severity: "Critical", chemicalCure: "Mancozeb", chemicalDosage: "2g/kg", desiNuskha: "Growing in lines with enough spacing.", isCertified: true, imageUrl: "https://picsum.photos/seed/cumin1/800/600", irrigationInterval: 15, estimatedMarketPrice: 25000, sowingSeason: "Winter", soilType: "Sandy" },
  { name: "Fennel Seed", category: "Seed", diseaseName: "Ramularia Blight", severity: "Medium", chemicalCure: "Copper Oxychloride", chemicalDosage: "2g/kg", desiNuskha: "Spraying starch solution on seeds.", isCertified: true, imageUrl: "https://picsum.photos/seed/fennel1/800/600", irrigationInterval: 12, estimatedMarketPrice: 14000, sowingSeason: "Winter", soilType: "Loamy" },
  { name: "Ajwain Seed", category: "Seed", diseaseName: "Root Rot", severity: "Medium", chemicalCure: "Carbendazim", chemicalDosage: "2g/kg", desiNuskha: "Seed treatment with ginger extract.", isCertified: true, imageUrl: "https://picsum.photos/seed/ajwain1/800/600", irrigationInterval: 15, estimatedMarketPrice: 18000, sowingSeason: "Winter", soilType: "Sandy" },
  { name: "Hybrid Maize Seed", category: "Seed", diseaseName: "Seed Rot", severity: "High", chemicalCure: "Captan", chemicalDosage: "2.5g/kg", desiNuskha: "Mixing seeds with dried neem leaves.", isCertified: true, imageUrl: "https://picsum.photos/seed/maizeseed1/800/600", irrigationInterval: 5, estimatedMarketPrice: 4500, sowingSeason: "Year-round", soilType: "Alluvial" },
  { name: "Proso Millet Seed", category: "Seed", diseaseName: "Head Smut", severity: "Low", chemicalCure: "Sulphur", chemicalDosage: "4g/kg", desiNuskha: "Fanning seeds to remove smut balls.", isCertified: true, imageUrl: "https://picsum.photos/seed/prosomillet1/800/600", irrigationInterval: 10, estimatedMarketPrice: 3800, sowingSeason: "Kharif", soilType: "Loamy" },
  { name: "Teff Seed", category: "Seed", diseaseName: "Leaf Rust", severity: "Low", chemicalCure: "Mancozeb", chemicalDosage: "2g/kg", desiNuskha: "Balanced soil pH management.", isCertified: true, imageUrl: "https://picsum.photos/seed/teff1/800/600", irrigationInterval: 12, estimatedMarketPrice: 9500, sowingSeason: "Summer", soilType: "Volcanic" },
  { name: "Alfalfa Seed", category: "Seed", diseaseName: "Dodder Parasite", severity: "High", chemicalCure: "Paraquat", chemicalDosage: "1ml/L", desiNuskha: "Sieve seeds to remove parasite seeds.", isCertified: true, imageUrl: "https://picsum.photos/seed/alfalfa1/800/600", irrigationInterval: 7, estimatedMarketPrice: 12000, sowingSeason: "Year-round", soilType: "Well-drained" },
  { name: "Clover Seed", category: "Seed", diseaseName: "Sclerotinia", severity: "Medium", chemicalCure: "Benomyl", chemicalDosage: "2g/kg", desiNuskha: "Regular field thinning after rain.", isCertified: true, imageUrl: "https://picsum.photos/seed/clover1/800/600", irrigationInterval: 10, estimatedMarketPrice: 11000, sowingSeason: "Winter", soilType: "Loamy" }
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
    const docRef = doc(firestore, "crops", certId);
    updateDocumentNonBlocking(docRef, {
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
          <p className="text-2xl font-black">Active Grid ({DEFAULT_CROPS.length} Crops)</p>
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
