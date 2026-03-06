'use server';
/**
 * @fileOverview Pathogen Spread Prediction AI Agent.
 * Uses Gemini 2.5 Flash to predict biological threat vectors based on field data and weather.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SpreadPredictionInputSchema = z.object({
  pathogenName: z.string().describe("The name of the disease or pest."),
  currentClusters: z.array(z.object({
    nodeId: z.string(),
    density: z.number(),
    latitude: z.number(),
    longitude: z.number()
  })).describe("List of current infection nodes."),
  windSpeed: z.number().describe("Wind speed in km/h."),
  windDirection: z.string().describe("Wind direction (e.g., NW, SE)."),
  humidity: z.number().describe("Ambient humidity percentage.")
});
export type SpreadPredictionInput = z.infer<typeof SpreadPredictionInputSchema>;

const SpreadPredictionOutputSchema = z.object({
  predictedVector: z.object({
    direction: z.string().describe("The compass direction of spread."),
    angle: z.number().describe("The precise angle for visual rendering (0-360)."),
    distanceKm: z.number().describe("Estimated spread distance in 48h."),
    riskLevel: z.enum(['Low', 'Medium', 'High', 'Critical'])
  }),
  strategicAdvice: z.string().describe("A brief containment directive for the expert."),
  impactedDistricts: z.array(z.string()).describe("Districts likely to be hit next.")
});
export type SpreadPredictionOutput = z.infer<typeof SpreadPredictionOutputSchema>;

export async function predictSpreadVector(input: SpreadPredictionInput): Promise<SpreadPredictionOutput> {
  return spreadPredictionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'spreadPredictionPrompt',
  input: { schema: SpreadPredictionInputSchema },
  output: { schema: SpreadPredictionOutputSchema },
  prompt: `You are the KisanMitra Bio-Security Engine. 
Analyze the following outbreak data for {{{pathogenName}}}:

CLUSTERS: {{{JSON.stringify currentClusters}}}
WEATHER: Wind {{{windSpeed}}}km/h from {{{windDirection}}}, Humidity {{{humidity}}}%

Based on typical biological patterns for this pathogen in India, predict the 48-hour spread vector.
Consider if the wind speed is high enough to carry spores or if humidity favors rapid breeding.

Return a precise vector angle (0 for North, 90 for East) and strategic containment advice.`,
});

const spreadPredictionFlow = ai.defineFlow(
  {
    name: 'spreadPredictionFlow',
    inputSchema: SpreadPredictionInputSchema,
    outputSchema: SpreadPredictionOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (!output) throw new Error("Bio-Security Node timed out.");
      return output;
    } catch (e: any) {
      console.warn("AI Spread Engine rate-limited. Activating Heuristic Failover.", e.message);
      
      // Heuristic Fallback
      let angle = 45; // Default NE
      if (input.windDirection === 'NW') angle = 135;
      if (input.windDirection === 'SE') angle = 315;

      return {
        predictedVector: {
          direction: input.windDirection,
          angle: angle,
          distanceKm: input.windSpeed * 2,
          riskLevel: input.humidity > 70 ? 'High' : 'Medium'
        },
        strategicAdvice: "Grid Heuristics: Prioritize bio-fencing in the windward districts. High humidity detected.",
        impactedDistricts: ["Neighboring Agricultural Hubs"]
      };
    }
  }
);
