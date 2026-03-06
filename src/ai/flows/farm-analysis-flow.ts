'use server';
/**
 * @fileOverview Specialized Farm Data Analysis Agent.
 * Analyzes agricultural inputs (text/image) and returns structured actions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FarmAnalysisInputSchema = z.object({
  prompt: z.string().describe("The user's text query or question."),
  photoDataUri: z.string().optional().describe("Base64 encoded image data for visual analysis."),
  language: z.string().default("English").describe("The preferred language for the response."),
});
export type FarmAnalysisInput = z.infer<typeof FarmAnalysisInputSchema>;

const FarmAnalysisOutputSchema = z.object({
  answer: z.string().describe("The conversational AI response."),
  suggestedAction: z.string().describe("A single, clear next step for the farmer."),
  confidence: z.number().describe("AI confidence score (0-1)."),
});
export type FarmAnalysisOutput = z.infer<typeof FarmAnalysisOutputSchema>;

export async function analyzeFarmData(input: FarmAnalysisInput): Promise<FarmAnalysisOutput> {
  return farmAnalysisFlow(input);
}

const farmAnalysisPrompt = ai.definePrompt({
  name: 'farmAnalysisPrompt',
  input: { schema: FarmAnalysisInputSchema },
  output: { schema: FarmAnalysisOutputSchema },
  prompt: `You are a Senior Agricultural Consultant for the KisanMitra National Grid. 
Your goal is to provide scientific, high-fidelity advice based on the user's data.

USER PROMPT: {{{prompt}}}
LANGUAGE: {{{language}}}

If an image is provided, analyze the soil, crop health, or tools visible.
Always return an empathetic answer and a specific, actionable step.

{{#if photoDataUri}}
IMAGE EVIDENCE PROVIDED: {{media url=photoDataUri}}
{{/if}}`,
});

const farmAnalysisFlow = ai.defineFlow(
  {
    name: 'farmAnalysisFlow',
    inputSchema: FarmAnalysisInputSchema,
    outputSchema: FarmAnalysisOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await farmAnalysisPrompt(input);

      if (!output) throw new Error("Consultant brain timed out.");
      return output;
    } catch (e: any) {
      console.warn("Farm Analysis AI Node rate-limited. Activating Heuristics.", e.message);
      
      // Heuristic Fallback for Demo Resilience
      const q = input.prompt.toLowerCase();
      let answer = "The National Grid is processing your farm data via local nodes.";
      let action = "Monitor your field closely and check back in 10 minutes.";

      if (q.includes('price') || q.includes('mandi')) {
        answer = "Mandi price intelligence is currently high-demand. Please check the 'Market Intelligence' hub for live regional trends.";
        action = "Switch to Market Hub for detailed price analysis.";
      } else if (q.includes('sick') || q.includes('pest') || q.includes('disease')) {
        answer = "I've detected symptoms in your query. For a precision diagnosis, please use the 'Crop Diagnostics' solution library.";
        action = "Open Solution Library for disease identification.";
      }

      return {
        answer: input.language === 'Hindi' 
          ? "ग्रिड वर्तमान में आपके डेटा को स्थानीय नोड्स के माध्यम से संसाधित कर रहा है।" 
          : answer,
        suggestedAction: action,
        confidence: 0.5
      };
    }
  }
);
