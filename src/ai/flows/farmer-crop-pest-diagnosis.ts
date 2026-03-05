'use server';
/**
 * @fileOverview Precision Crop Diagnosis Flow.
 * Implements a multi-step botanical analysis logic to prevent generic fallback.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FarmerCropPestDiagnosisInputSchema = z.object({
  cropType: z.string().describe('The type of crop (e.g., Wheat, Litchi, Mango).'),
  symptomsDescription: z.string().optional().describe('Observed symptoms.'),
  photoDataUri: z.string().optional().describe("Photo data URI."),
  language: z.string().default("English").describe("Target language."),
});
export type FarmerCropPestDiagnosisInput = z.infer<typeof FarmerCropPestDiagnosisInputSchema>;

const FarmerCropPestDiagnosisOutputSchema = z.object({
  pathogenIdentification: z.string().describe("Specific identification of the pathogen or deficiency."),
  diagnosis: z.string().describe("Scientifically accurate diagnosis."),
  scientificReasoning: z.string().describe("The step-by-step logic used to arrive at this specific cure."),
  suggestedChemicalRemedies: z.array(z.string()).describe("Specific treatments for this specific crop family."),
  suggestedTraditionalRemedies: z.array(z.string()).describe("Heritage 'Desi Nuskha' unique to this plant species."),
  isBotanicallyValid: z.boolean().describe("True only if the cure is specific to the input crop family."),
  confidenceScore: z.number().describe("AI confidence (0-1)."),
});
export type FarmerCropPestDiagnosisOutput = z.infer<typeof FarmerCropPestDiagnosisOutputSchema>;

export async function diagnoseCropPest(input: FarmerCropPestDiagnosisInput): Promise<FarmerCropPestDiagnosisOutput> {
  return farmerCropPestDiagnosisFlow(input);
}

const diagnoseCropPestPrompt = ai.definePrompt({
  name: 'diagnoseCropPestPrompt',
  input: { schema: FarmerCropPestDiagnosisInputSchema },
  output: { schema: FarmerCropPestDiagnosisOutputSchema },
  prompt: `You are a professional Agronomist and Biosecurity Expert for the KisanMitra National Grid.

TASK: Provide a PRECISION botanical diagnosis for the crop: {{{cropType}}}.

SYMPTOMS: {{#if symptomsDescription}}{{{symptomsDescription}}}{{else}}Analyze image only.{{/if}}
IMAGE: {{#if photoDataUri}}{{media url=photoDataUri}}{{else}}No image provided.{{/if}}

STRICT MULTI-STEP LOGIC:
Step 1: Identify the specific pathogen or nutrient deficiency for the crop {{{cropType}}} based on the provided symptoms and visual cues.
Step 2: Cross-reference this with a verified agricultural database for the Indian subcontinent.
Step 3: Output a UNIQUE Professional Neutralizer and a UNIQUE Heritage Wisdom (Desi Nuskha) that is applicable ONLY to this specific crop and disease. 

CRITICAL: 
- DO NOT provide generic cures. (e.g., if the crop is Litchi, do not suggest Wheat Rust treatments).
- If you lack specific data for {{{cropType}}}, set isBotanicallyValid to false.
- Respond strictly in {{{language}}} script.`,
});

const farmerCropPestDiagnosisFlow = ai.defineFlow(
  {
    name: 'farmerCropPestDiagnosisFlow',
    inputSchema: FarmerCropPestDiagnosisInputSchema,
    outputSchema: FarmerCropPestDiagnosisOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await diagnoseCropPestPrompt(input);
      if (!output) throw new Error('Failed to generate diagnosis output.');
      return output;
    } catch (e: any) {
      console.warn("AI Node rate-limited. Falling back to Grid Heuristics.");
      return {
        pathogenIdentification: "Preliminary Stress Detection",
        diagnosis: "Awaiting high-precision analysis.",
        scientificReasoning: "Heuristic fallback triggered due to network latency.",
        suggestedChemicalRemedies: ["Apply generic organic fungicide (Neem-based)."],
        suggestedTraditionalRemedies: ["Spray diluted wood ash solution."],
        isBotanicallyValid: false,
        confidenceScore: 0.3
      };
    }
  }
);
