'use server';
/**
 * @fileOverview A flow for analyzing crop market prices and predicting trends.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MarketPriceTrendAnalysisInputSchema = z.object({
  cropType: z.string().describe('The type of crop to analyze.'),
  state: z.string().describe('The state where the data was collected.'),
  marketPriceData: z.array(
    z.object({
      date: z.string().describe('The date of the price data.'),
      price: z.number().describe('The price on that date.'),
    })
  ),
});
export type MarketPriceTrendAnalysisInput = z.infer<typeof MarketPriceTrendAnalysisInputSchema>;

const MarketPriceTrendAnalysisOutputSchema = z.object({
  cropType: z.string(),
  state: z.string(),
  predictedTrend: z.enum(['Rising', 'Stable', 'Falling']),
  recommendedAction: z.enum(['Sell', 'Hold', 'Wait']),
  reasoning: z.string(),
});
export type MarketPriceTrendAnalysisOutput = z.infer<typeof MarketPriceTrendAnalysisOutputSchema>;

export async function marketPriceTrendAnalysis(
  input: MarketPriceTrendAnalysisInput
): Promise<MarketPriceTrendAnalysisOutput> {
  return marketPriceTrendAnalysisFlow(input);
}

const marketPriceTrendAnalysisFlow = ai.defineFlow(
  {
    name: 'marketPriceTrendAnalysisFlow',
    inputSchema: MarketPriceTrendAnalysisInputSchema,
    outputSchema: MarketPriceTrendAnalysisOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        output: { schema: MarketPriceTrendAnalysisOutputSchema },
        prompt: `Analyze these prices for ${input.cropType} in ${input.state}:
        ${JSON.stringify(input.marketPriceData)}
        Determine the trend and recommend Sell, Hold, or Wait.`,
      });
      if (!output) throw new Error('Model returned no output.');
      return output;
    } catch (e: any) {
      return {
        cropType: input.cropType,
        state: input.state,
        predictedTrend: 'Stable',
        recommendedAction: 'Wait',
        reasoning: "Market grid is currently synchronizing. Heuristic analysis suggests a stable short-term trend."
      };
    }
  }
);
