
"use client";

import React, { useState } from "react";
import { Camera, Search, Loader2, CheckCircle2, Leaf, Bug, FlaskConical, Droplets, ShieldCheck, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { diagnoseCropPest, FarmerCropPestDiagnosisOutput } from "@/ai/flows/farmer-crop-pest-diagnosis";
import { TTSWrapper } from "@/components/voice/TTSWrapper";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export function DiagnosticTool() {
  const [cropType, setCropType] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [soilPh, setSoilPh] = useState(7);
  const [soilMoisture, setSoilMoisture] = useState(40);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FarmerCropPestDiagnosisOutput | null>(null);

  const handleDiagnose = async () => {
    if (!cropType) return;
    setLoading(true);
    try {
      const res = await diagnoseCropPest({
        cropType,
        symptomsDescription: symptoms,
        photoDataUri: photo || undefined,
        soilPh,
        soilMoisture
      });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Card className="glass border-none rounded-[2.5rem] p-8">
          <CardHeader className="p-0 mb-8">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <Leaf className="h-7 w-7 text-primary" />
              AI Bio-Diagnostic Command
            </CardTitle>
            <CardDescription className="text-white/60">Identify pathogens and soil health deficiencies with multi-modal AI</CardDescription>
          </CardHeader>
          
          <CardContent className="p-0 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Crop Species</label>
                  <Input
                    placeholder="e.g. Tomato, Wheat"
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                    className="glass border-none h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Symptom Log</label>
                  <Textarea
                    placeholder="Yellow spotting, leaf curl..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="glass border-none min-h-[120px]"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                      <FlaskConical className="h-3 w-3" /> Soil pH Level
                    </label>
                    <span className="font-bold text-primary">{soilPh}</span>
                  </div>
                  <Slider value={[soilPh]} onValueChange={(v) => setSoilPh(v[0])} min={0} max={14} step={0.1} />
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                      <Droplets className="h-3 w-3" /> Moisture Saturation
                    </label>
                    <span className="font-bold text-accent">{soilMoisture}%</span>
                  </div>
                  <Slider value={[soilMoisture]} onValueChange={(v) => setSoilMoisture(v[0])} min={0} max={100} step={1} />
                </div>

                <div className="relative group glass border-dashed border-2 border-white/10 rounded-3xl p-6 text-center hover:bg-white/5 transition-all cursor-pointer">
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handlePhotoUpload} />
                  <div className="flex flex-col items-center">
                    {photo ? (
                      <img src={photo} alt="Preview" className="h-20 w-20 object-cover rounded-xl" />
                    ) : (
                      <>
                        <Camera className="h-10 w-10 text-white/20 mb-2 group-hover:text-primary transition-colors" />
                        <span className="text-xs font-bold text-white/30 uppercase">Thermal/Visual Scan</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Button 
              className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 rounded-[1.5rem] vivid-glow-green"
              disabled={loading}
              onClick={handleDiagnose}
            >
              {loading ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : <Search className="h-6 w-6 mr-2" />}
              Initiate Full Diagnostic Scan
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className="glass border-none rounded-[2.5rem] p-8 animate-in slide-in-from-bottom-4">
            <CardHeader className="p-0 mb-8">
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl font-bold flex items-center gap-3 text-primary">
                  <CheckCircle2 className="h-7 w-7" />
                  Diagnosis: {result.diagnosis}
                </CardTitle>
                <Badge className="bg-primary/20 text-primary border-primary/30">AI Confirmed</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
                    <Bug className="h-4 w-4" /> Pathogen Neutralization
                  </h4>
                  <ul className="space-y-2">
                    {result.suggestedChemicalRemedies.map((rem, i) => (
                      <li key={i} className="glass p-4 rounded-2xl bg-red-500/5 text-sm border-none italic text-white/80">
                        <TTSWrapper text={rem}>{rem}</TTSWrapper>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                    <Leaf className="h-4 w-4" /> Bio-Organic Protocols
                  </h4>
                  <ul className="space-y-2">
                    {result.suggestedTraditionalRemedies.map((rem, i) => (
                      <li key={i} className="glass p-4 rounded-2xl bg-primary/5 text-sm border-none italic text-white/80">
                        <TTSWrapper text={rem}>{rem}</TTSWrapper>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-accent/10 border border-accent/20">
                <h4 className="text-xs font-bold text-accent uppercase tracking-widest flex items-center gap-2 mb-4">
                  <FlaskConical className="h-4 w-4" /> Soil Remediation Plan
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.fertilizerRecommendations.map((rec, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl text-xs font-bold text-white/90">
                      <div className="h-2 w-2 rounded-full bg-accent" />
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-6">
        <Card className="glass border-none rounded-[2.5rem] p-8">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary uppercase tracking-widest">
              <ShieldCheck className="h-4 w-4" /> Cluster Security
            </CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-white/40 uppercase">Local Outbreak Risk</span>
              <span className="text-primary">Low</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[12%] rounded-full" />
            </div>
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-white/40 uppercase">Soil Health Index</span>
              <span className="text-accent">Optimized</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-accent w-[92%] rounded-full" />
            </div>
          </div>
        </Card>

        <Card className="glass border-none rounded-[2.5rem] p-8 bg-gradient-to-br from-accent/20 to-transparent">
          <div className="flex flex-col gap-4">
            <Thermometer className="h-8 w-8 text-accent" />
            <div className="text-xs font-bold text-white/40 uppercase tracking-widest">Ambient Context</div>
            <p className="text-sm font-medium italic leading-relaxed text-white/70">
              "Current cluster humidity is 62%. Risk of fungal growth is moderate. Ensure soil moisture does not exceed 55% for current crop stage."
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
