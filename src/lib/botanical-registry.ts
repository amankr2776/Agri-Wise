/**
 * @fileOverview National Botanical Registry
 * Verified dataset for crop diseases, symptoms, and cures.
 */

export interface BotanicalRecord {
  crop: string;
  disease: string;
  symptoms: string;
  chemicalCure: string;
  traditionalRemedy: string;
}

export const BOTANICAL_REGISTRY: BotanicalRecord[] = [
  // 1. Plants & Horticultural Crops
  { 
    crop: "Cotton", 
    disease: "Leaf Reddening/Yellowing", 
    symptoms: "Red/Yellow margins on leaves", 
    chemicalCure: "Spray $MgSO_4$ (Magnesium Sulfate) at 10g per liter of water. Ensure full coverage of the underside of leaves during early morning hours.", 
    traditionalRemedy: "Apply well-decomposed Farmyard Manure (FYM) at 10 tons per hectare. Follow with a soil drench of Vermicompost tea (1:5 ratio with water)." 
  },
  { 
    crop: "Rose", 
    disease: "Powdery Mildew", 
    symptoms: "White powdery patches on leaves and buds", 
    chemicalCure: "Apply Wettable Sulphur (80% $WP$) at 2g per liter of water. Repeat every 10 days until new healthy growth appears.", 
    traditionalRemedy: "Mix 1 tablespoon of baking soda and 1/2 teaspoon of liquid soap in 4 liters of water. Spray weekly on affected areas." 
  },
  { 
    crop: "Tomato", 
    disease: "Leaf Curl", 
    symptoms: "Yellowing, upward curling, and crinkling of leaves", 
    chemicalCure: "Control whitefly vectors using Thiamethoxam (25% $WG$) at 0.5g per liter. Soil drenching is recommended for systemic protection.", 
    traditionalRemedy: "Spray fermented Buttermilk (sour lassi). Mix 1 liter of 5-day-old buttermilk with 10 liters of water. Spray twice a week." 
  },
  { 
    crop: "Potato", 
    disease: "Late Blight", 
    symptoms: "Water-soaked lesions with white fuzzy growth on underside", 
    chemicalCure: "Spray a combination of Metalaxyl (8%) + Mancozeb (64%) at 2.5g per liter of water. Apply at first sign of symptoms.", 
    traditionalRemedy: "Apply Bordeaux Mixture (1% concentration: 1kg Copper Sulfate + 1kg Lime in 100L water). Ensure uniform spray on foliage." 
  },
  { 
    crop: "Wheat", 
    disease: "Yellow Rust", 
    symptoms: "Yellow stripes of spores running parallel to leaf veins", 
    chemicalCure: "Spray Propiconazole (25% $EC$) at 1ml per liter of water ($500ml$ in $500L$ water per hectare). Repeat after 15 days if threat persists.", 
    traditionalRemedy: "Sow seeds early (before Nov 15th) to avoid peak heat. Intercrop with Mustard to break pathogen spread vectors." 
  },
  { 
    crop: "Rice", 
    disease: "Bacterial Blight", 
    symptoms: "Yellowish-green wavy edges on leaf blades", 
    chemicalCure: "Spray Streptocycline (6g) + Copper Oxychloride (500g) in 200 liters of water per acre. Avoid excess Nitrogen application.", 
    traditionalRemedy: "Spray filtered cow dung slurry. Mix 20kg fresh cow dung in 200L water, let settle, filter through cloth, and spray the extract." 
  },
  { 
    crop: "Mango", 
    disease: "Powdery Mildew", 
    symptoms: "White floury coating on inflorescence and young fruits", 
    chemicalCure: "Spray Hexaconazole (5% $EC$) at 1ml per liter of water. Apply at pre-bloom and post-bloom stages.", 
    traditionalRemedy: "Dust fine Sulphur powder (300 mesh) on the trees during early morning when dew is present for better adhesion." 
  },
  { 
    crop: "Chilli", 
    disease: "Anthracnose", 
    symptoms: "Dark, sunken circular spots on fruits with concentric rings", 
    chemicalCure: "Treat seeds with Carbendazim (2g/kg). Spray Mancozeb (2.5g/L) on the crop during fruit development stages.", 
    traditionalRemedy: "Soil application of Trichoderma viride (2.5kg per hectare) mixed with 50kg of Farmyard Manure to suppress soil-borne spores." 
  },
  { 
    crop: "Pomegranate", 
    disease: "Bacterial Blight", 
    symptoms: "Small, water-soaked dark spots on leaves and oily spots on fruit", 
    chemicalCure: "Spray Bronopol (Streptocycline alternative) at 0.5g/L mixed with Copper Oxychloride (2g/L). Prune and burn infected twigs.", 
    traditionalRemedy: "Apply a paste of Turmeric powder and Lime (1:1 ratio) on the main stem and major branches to prevent bacterial entry." 
  },
  { 
    crop: "Sugarcane", 
    disease: "Grassy Shoot", 
    symptoms: "Excessive tillering giving a bushy, grass-like appearance", 
    chemicalCure: "No direct chemical cure for established plants. Treat new seed setts with Hot Water ($50^\circ C$ for 2 hours) before planting.", 
    traditionalRemedy: "Immediately rogue out (uproot) and burn infected clumps. Control aphids using Neem kernel extract (5%)." 
  }
];

export function getRegistryMatch(crop: string, query: string): BotanicalRecord | null {
  if (!crop || !query) return null;
  const c = crop.toLowerCase();
  const q = query.toLowerCase();
  
  return BOTANICAL_REGISTRY.find(r => 
    r.crop.toLowerCase() === c && 
    (q.includes(r.disease.toLowerCase()) || q.includes(r.symptoms.toLowerCase()))
  ) || null;
}
