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
  { crop: "Cotton", disease: "Leaf Reddening/Yellowing", symptoms: "Red/Yellow margins on leaves", chemicalCure: "Magnesium Sulfate spray", traditionalRemedy: "Application of farmyard manure (FYM)" },
  { crop: "Rose", disease: "Powdery Mildew", symptoms: "White powdery patches", chemicalCure: "Wettable Sulphur (2g/L)", traditionalRemedy: "Baking soda + water spray" },
  { crop: "Marigold", disease: "Alternaria Blight", symptoms: "Yellow halo spots", chemicalCure: "Mancozeb (2.5g/L)", traditionalRemedy: "Marigold-leaf extract spray" },
  { crop: "Hibiscus", disease: "Mealybug", symptoms: "White waxy clusters", chemicalCure: "Imidacloprid (0.5ml/L)", traditionalRemedy: "Soap water + Neem oil spray" },
  { crop: "Tulsi", disease: "Leaf Spot", symptoms: "Yellowing edges", chemicalCure: "Copper Oxychloride", traditionalRemedy: "Garlic-Ginger-Chilli extract" },
  { crop: "Sugarcane", disease: "Grassy Shoot", symptoms: "Whitening of leaves", chemicalCure: "Heat treatment of setts", traditionalRemedy: "Roguing (removing) infected stalks" },
  { crop: "Areca Nut", disease: "Yellow Leaf Disease", symptoms: "Leaves turn bright yellow", chemicalCure: "Ferrous Sulfate + NPK", traditionalRemedy: "Application of organic mulch" },
  { crop: "Coffee", disease: "Coffee Rust", symptoms: "Yellow/Orange spots", chemicalCure: "Bordeaux Mixture (1%)", traditionalRemedy: "Wood ash application to base" },
  { crop: "Tea", disease: "Red Rust", symptoms: "Yellow/Orange patches", chemicalCure: "Copper-based fungicides", traditionalRemedy: "Pruning and shade management" },
  { crop: "Tobacco", disease: "Mosaic Virus", symptoms: "Yellow mottling", chemicalCure: "No chemical cure (Vector control)", traditionalRemedy: "Milk-water spray (neutralizes virus)" },

  // 2. Vegetables
  { crop: "Tomato", disease: "Leaf Curl", symptoms: "Yellowing & crinkling", chemicalCure: "Thiamethoxam (for whitefly)", traditionalRemedy: "Fermented Buttermilk spray" },
  { crop: "Potato", disease: "Late Blight", symptoms: "White fuzzy growth (underside)", chemicalCure: "Metalaxyl + Mancozeb", traditionalRemedy: "Bordeaux Mixture" },
  { crop: "Onion", disease: "Downy Mildew", symptoms: "White/Violet fluffy growth", chemicalCure: "Chlorothalonil", traditionalRemedy: "Crop rotation with non-alliums" },
  { crop: "Chilli", disease: "Anthracnose", symptoms: "Yellow/White sunken spots", chemicalCure: "Carbendazim", traditionalRemedy: "Seed treatment with Trichoderma" },
  { crop: "Brinjal", disease: "Little Leaf", symptoms: "Yellowing & tiny leaves", chemicalCure: "Tetracycline injection", traditionalRemedy: "Removal of infected host weeds" },
  { crop: "Cabbage", disease: "Clubroot", symptoms: "Yellowing & wilting", chemicalCure: "Lime application to soil", traditionalRemedy: "Mustard oil cake application" },
  { crop: "Cucumber", disease: "Powdery Mildew", symptoms: "White floury coating", chemicalCure: "Carbendazim", traditionalRemedy: "Milk (10% solution) spray" },
  { crop: "Okra", disease: "Yellow Vein Mosaic", symptoms: "Bright yellow leaf veins", chemicalCure: "Malathion (for vectors)", traditionalRemedy: "Yellow sticky traps" },
  { crop: "Garlic", disease: "Purple Blotch", symptoms: "White centers with yellow edges", chemicalCure: "Tebuconazole", traditionalRemedy: "Soil application of wood ash" },
  { crop: "Spinach", disease: "White Rust", symptoms: "White blisters on underside", chemicalCure: "Ridomil Gold", traditionalRemedy: "Spraying with Nettle extract" },

  // 3. Fruits
  { crop: "Mango", disease: "Powdery Mildew", symptoms: "White coating on flowers", chemicalCure: "Hexaconazole", traditionalRemedy: "Sulphur dusting" },
  { crop: "Banana", disease: "Sigatoka", symptoms: "Yellow/Brown streaks", chemicalCure: "Propiconazole", traditionalRemedy: "Removing infected 'trash' leaves" },
  { crop: "Citrus", disease: "Citrus Canker", symptoms: "Yellow halos on fruit/leaves", chemicalCure: "Streptomycin Sulphate", traditionalRemedy: "Copper Oxychloride + Lime" },
  { crop: "Grape", disease: "Downy Mildew", symptoms: "Yellow oily spots", chemicalCure: "Azoxystrobin", traditionalRemedy: "Spraying horsetail tea" },
  { crop: "Guava", disease: "Anthracnose", symptoms: "Whitening/Drying of twigs", chemicalCure: "Copper Oxychloride", traditionalRemedy: "Pruning and burning dead wood" },
  { crop: "Papaya", disease: "Ring Spot", symptoms: "Yellow mosaic patterns", chemicalCure: "No cure (Vector control)", traditionalRemedy: "Netting young nursery plants" },
  { crop: "Pomegranate", disease: "Bacterial Blight", symptoms: "Yellow halos / Dark spots", chemicalCure: "Bronopol", traditionalRemedy: "Turmeric + Lime paste on stems" },
  { crop: "Watermelon", disease: "Fusarium Wilt", symptoms: "Yellowing from base up", chemicalCure: "Soil drenching with Benomyl", traditionalRemedy: "Sun-solarization of soil" },
  { crop: "Litchi", disease: "Litchi Leaf Curl (Mite)", symptoms: "White/Velvety undersides", chemicalCure: "Dicofol", traditionalRemedy: "Pruning in early winter" },
  { crop: "Apple", disease: "Apple Scab", symptoms: "Yellowing then dark lesions", chemicalCure: "Captan", traditionalRemedy: "Compost tea foliar spray" },

  // 4. Seeds & Grains
  { crop: "Wheat", disease: "Yellow Rust", symptoms: "Yellow stripes on leaves", chemicalCure: "Tilt (Propiconazole)", traditionalRemedy: "Early sowing to avoid heat" },
  { crop: "Rice", disease: "Bacterial Blight", symptoms: "Yellowish-green wavy edges", chemicalCure: "Streptocycline", traditionalRemedy: "Spraying cow dung slurry (filtered)" },
  { crop: "Maize", disease: "Turcicum Blight", symptoms: "Long yellow/brown lesions", chemicalCure: "Zineb", traditionalRemedy: "Intercropping with legumes" },
  { crop: "Bajra", disease: "Ergot", symptoms: "Creamy white 'honey' drops", chemicalCure: "Seed treatment with Brine (10%)", traditionalRemedy: "Deep summer plowing" },
  { crop: "Chickpea", disease: "Wilt", symptoms: "Yellowing and drying", chemicalCure: "Carbendazim (seed treat)", traditionalRemedy: "Trichoderma viride in soil" },
  { crop: "Soybean", disease: "Yellow Mosaic", symptoms: "Bright yellow mottling", chemicalCure: "Dimethoate", traditionalRemedy: "Rogueing of infected plants" },
  { crop: "Sunflower", disease: "Powdery Mildew", symptoms: "White powdery spots", chemicalCure: "Wettable Sulphur", traditionalRemedy: "Neem seed kernel extract" },
  { crop: "Mustard", disease: "White Rust", symptoms: "White pustules on leaves", chemicalCure: "Metalaxyl", traditionalRemedy: "Balanced Potassium fertilizer" },
  { crop: "Millet", disease: "Grain Smut", symptoms: "White/Grey swollen grains", chemicalCure: "Carboxin", traditionalRemedy: "Sowing certified clean seeds" },
  { crop: "Moong Dal", disease: "Cercospora", symptoms: "Yellow-bordered spots", chemicalCure: "Thiophanate Methyl", traditionalRemedy: "Application of Panchagavya" },
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
