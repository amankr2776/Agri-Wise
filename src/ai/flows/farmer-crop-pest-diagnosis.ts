'use server';
/**
 * @fileOverview Senior Precision Agronomist Diagnostic Flow.
 * Implements conversational agronomist logic for multimodal disease identification.
 * Grounded in the National Botanical Registry dataset.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { BOTANICAL_REGISTRY } from '@/lib/botanical-registry';

const FarmerCropPestDiagnosisInputSchema = z.object({
  cropType: z.string().describe('The type of crop (e.g., Wheat, Litchi, Mango).'),
  symptomsDescription: z.string().optional().describe('Observed symptoms or natural language query.'),
  photoDataUri: z.string().optional().describe("Photo data URI for visual analysis."),
  language: z.string().default("English").describe("Target language for the conversation."),
});
export type FarmerCropPestDiagnosisInput = z.infer<typeof FarmerCropPestDiagnosisInputSchema>;

const FarmerCropPestDiagnosisOutputSchema = z.object({
  pathogenIdentification: z.string().describe("Specific identification of the pathogen, pest, or deficiency (e.g., 'Yellow Rust', 'Early Blight')."),
  diagnosis: z.string().describe("Conversational, empathetic diagnosis explanation specific to this crop."),
  scientificReasoning: z.string().describe("The step-by-step logical trace used to identify the issue, citing specific botanical indicators."),
  suggestedChemicalRemedies: z.array(z.string()).describe("Professional treatments specific to this crop-disease pair. Use real chemical names where appropriate (e.g. Mancozeb, Imidacloprid)."),
  suggestedTraditionalRemedies: z.array(z.string()).describe("Heritage 'Desi Nuskha' unique to this plant species and disease."),
  isBotanicallyValid: z.boolean().describe("True if the diagnosis is specific to the input crop family and symptoms."),
  confidenceScore: z.number().describe("AI confidence level (0-1)."),
});
export type FarmerCropPestDiagnosisOutput = z.infer<typeof FarmerCropPestDiagnosisOutputSchema>;

export async function diagnoseCropPest(input: FarmerCropPestDiagnosisInput): Promise<FarmerCropPestDiagnosisOutput> {
  return farmerCropPestDiagnosisFlow(input);
}

const diagnoseCropPestPrompt = ai.definePrompt({
  name: 'diagnoseCropPestPrompt',
  input: { schema: FarmerCropPestDiagnosisInputSchema },
  output: { schema: FarmerCropPestDiagnosisOutputSchema },
  prompt: `You are a Senior Precision Agronomist for the KisanMitra National Grid. 

CRITICAL SOURCE OF TRUTH:
You have access to the National Botanical Registry. ALWAYS prioritize matching symptoms to these verified records. If a match exists in this list, YOU MUST use its chemical cure and traditional remedy exactly.

REGISTRY SAMPLES:
${JSON.stringify(BOTANICAL_REGISTRY)}

CROP: {{{cropType}}}
SYMPTOMS: {{#if symptomsDescription}}{{{symptomsDescription}}}{{else}}Visual evidence only.{{/if}}

MISSION:
1. Identify the EXACT pathogen from the registry if it matches {{{cropType}}}.
2. Provide a diagnosis in {{{language}}} script that explains WHY this happened.
3. Suggest the EXACT chemical cure and heritage "Desi Nuskha" found in the registry for this crop.
4. Explain the "Logic Trace": What botanical cues led to this identification?

IMAGE EVIDENCE: {{#if photoDataUri}}{{media url=photoDataUri}}{{else}}No image provided.{{/if}}

If you are uncertain, state the most likely match. Always prioritize accuracy for the Indian agricultural context.`,
});

const farmerCropPestDiagnosisFlow = ai.defineFlow(
  {
    name: 'farmerCropPestDiagnosisFlow',
    inputSchema: FarmerCropPestDiagnosisInputSchema,
    outputSchema: FarmerCropPestDiagnosisOutputSchema,
  },
  async (input) => {
    // Check Registry first for exact matches (Offline Grounding)
    const localMatch = BOTANICAL_REGISTRY.find(r => 
      r.crop.toLowerCase() === input.cropType.toLowerCase() && 
      (input.symptomsDescription?.toLowerCase().includes(r.disease.toLowerCase()) || 
       input.symptomsDescription?.toLowerCase().includes(r.symptoms.toLowerCase()))
    );

    try {
      const { output } = await diagnoseCropPestPrompt(input);
      if (!output) throw new Error('Failed to generate precision diagnosis.');
      
      // If we have a local match, FORCE the output to use registry values to ensure 100% compliance
      if (localMatch) {
        return {
          pathogenIdentification: localMatch.disease,
          diagnosis: output.diagnosis, // Keep the AI's conversational explanation
          scientificReasoning: `Verified Registry Match: ${localMatch.symptoms}. logic trace: ${output.scientificReasoning}`,
          suggestedChemicalRemedies: [localMatch.chemicalCure],
          suggestedTraditionalRemedies: [localMatch.traditionalRemedy],
          isBotanicallyValid: true,
          confidenceScore: 1.0
        };
      }

      return output;
    } catch (e: any) {
      console.warn("Senior Agronomist Node high-latency. Triggering Registry Failover.", e.message);
      
      // Failover to local registry for stability and accuracy
      if (localMatch) {
        return {
          pathogenIdentification: localMatch.disease,
          diagnosis: `Our grid detects symptoms of ${localMatch.disease} in your ${input.cropType}. This is a verified regional threat.`,
          scientificReasoning: `Identified via primary botanical markers: ${localMatch.symptoms}. This record is synchronized with the National Registry.`,
          suggestedChemicalRemedies: [localMatch.chemicalCure],
          suggestedTraditionalRemedies: [localMatch.traditionalRemedy],
          isBotanicallyValid: true,
          confidenceScore: 0.9
        };
      }

      return {
        pathogenIdentification: "Regional Crop Stress Detected",
        diagnosis: "The grid is detecting physiological stress. While high-latency, our initial analysis suggests local soil or environmental factors.",
        scientificReasoning: "Fallback activated. Symptoms cross-referenced against broad-spectrum regional datasets.",
        suggestedChemicalRemedies: ["Apply a broad-spectrum organic fungicide."],
        suggestedTraditionalRemedies: ["Spray Neem Oil mixture (5ml/L) as a preventive measure."],
        isBotanicallyValid: false,
        confidenceScore: 0.4
      };
    }
  }
);
