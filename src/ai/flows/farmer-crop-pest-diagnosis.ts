'use server';
/**
 * @fileOverview This file implements the Genkit flow for diagnosing crop problems and identifying pests.
 *
 * - diagnoseCropPest - A function that handles the AI-driven crop and pest diagnosis process.
 * - FarmerCropPestDiagnosisInput - The input type for the diagnoseCropPest function.
 * - FarmerCropPestDiagnosisOutput - The return type for the diagnoseCropPest function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FarmerCropPestDiagnosisInputSchema = z.object({
  cropType: z.string().describe('The type of crop being diagnosed (e.g., "Wheat", "Tomato", "Cotton").'),
  symptomsDescription: z.string().optional().describe('A detailed description of the symptoms observed on the crop or the pest.'),
  photoDataUri: z.string().optional().describe("An optional photo of the crop or pest, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
}).refine(
  (data) => data.symptomsDescription || data.photoDataUri,
  {
    message: 'Either symptomsDescription or photoDataUri must be provided.',
    path: ['symptomsDescription', 'photoDataUri'],
  }
);
export type FarmerCropPestDiagnosisInput = z.infer<typeof FarmerCropPestDiagnosisInputSchema>;

const FarmerCropPestDiagnosisOutputSchema = z.object({
  diagnosis: z.string().describe("A clear and concise diagnosis of the crop problem or identified pest."),
  suggestedChemicalRemedies: z.array(z.string()).describe("A list of AI-driven suggestions for chemical pesticides or fungicides."),
  suggestedTraditionalRemedies: z.array(z.string()).describe("A list of AI-driven suggestions for traditional 'Desi Nuskha' remedies."),
});
export type FarmerCropPestDiagnosisOutput = z.infer<typeof FarmerCropPestDiagnosisOutputSchema>;

export async function diagnoseCropPest(input: FarmerCropPestDiagnosisInput): Promise<FarmerCropPestDiagnosisOutput> {
  return farmerCropPestDiagnosisFlow(input);
}

const diagnoseCropPestPrompt = ai.definePrompt({
  name: 'diagnoseCropPestPrompt',
  input: { schema: FarmerCropPestDiagnosisInputSchema },
  output: { schema: FarmerCropPestDiagnosisOutputSchema },
  prompt: `You are an expert agricultural diagnostician. Your task is to diagnose crop problems or identify pests based on the provided information and suggest appropriate chemical and traditional 'Desi Nuskha' remedies.

The crop type is: {{{cropType}}}

{{#if symptomsDescription}}
Symptoms observed: {{{symptomsDescription}}}
{{/if}}

{{#if photoDataUri}}
Here is an image for reference: {{media url=photoDataUri}}
{{/if}}

Based on the information provided, please provide:
1.  A clear diagnosis of the problem or identification of the pest.
2.  A list of suggested chemical pesticides or fungicides.
3.  A list of suggested traditional 'Desi Nuskha' remedies.

Ensure your response is structured as a JSON object matching the output schema.`,
});

const farmerCropPestDiagnosisFlow = ai.defineFlow(
  {
    name: 'farmerCropPestDiagnosisFlow',
    inputSchema: FarmerCropPestDiagnosisInputSchema,
    outputSchema: FarmerCropPestDiagnosisOutputSchema,
  },
  async (input) => {
    const { output } = await diagnoseCropPestPrompt(input);
    return output!;
  }
);
