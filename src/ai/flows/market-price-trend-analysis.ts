
'use server';
/**
 * @fileOverview A flow for analyzing crop market prices, predicting trends, and advising Sell vs Hold.
 * Includes a heuristic fallback engine to handle AI rate-limiting.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MarketPriceTrendAnalysisInputSchema = z.object({
  cropType: z.string().describe('The type of crop to analyze (e.g., "Wheat", "Rice").'),
  state: z.string().describe('The state where the market price data was collected.'),
  marketPriceData: z.array(
    z.object({
      date: z.string().describe('The date of the price data (e.g., "Mon", "Tue").'),
      price: z.number().describe('The market price for the crop on the given date.'),
    })
  ).describe('Historical market price data for the specified crop and state, ordered chronologically.'),
});
export type MarketPriceTrendAnalysisInput = z.infer<typeof MarketPriceTrendAnalysisInputSchema>;

const MarketPriceTrendAnalysisOutputSchema = z.object({
  cropType: z.string().describe('The type of crop analyzed.'),
  state: z.string().describe('The state for which the analysis was performed.'),
  predictedTrend: z.enum(['Rising', 'Stable', 'Falling']).describe('The predicted price trend.'),
  recommendedAction: z.enum(['Sell', 'Hold', 'Wait']).describe('Strategic advice: Sell now to lock in profit, Hold for higher prices, or Wait for stability.'),
  reasoning: z.string().describe('Detailed explanation based on data.'),
});
export type MarketPriceTrendAnalysisOutput = z.infer<typeof MarketPriceTrendAnalysisOutputSchema>;

export async function marketPriceTrendAnalysis(
  input: MarketPriceTrendAnalysisInput
): Promise<MarketPriceTrendAnalysisOutput> {
  return marketPriceTrendAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'marketPriceTrendAnalysisPrompt',
  input: { schema: MarketPriceTrendAnalysisInputSchema },
  output: { schema: MarketPriceTrendAnalysisOutputSchema },
  prompt: `You are an expert agricultural market analyst for the KisanMitra grid. 
Your task is to analyze price data and provide a strategic recommendation.

Context:
Crop: {{{cropType}}}
State: {{{state}}}

Market Data (Last 7 Days):
{{#each marketPriceData}}
  - {{{this.date}}}: ₹{{{this.price}}}
{{/each}}

Strategic Objective:
Determine the trend and recommend "Sell", "Hold", or "Wait".
- Sell: If prices are peak or crashing.
- Hold: If prices are steadily rising.
- Wait: If market is stable or too volatile.

Provide a concise reasoning that explains the math behind your decision.`,
});

const marketPriceTrendAnalysisFlow = ai.defineFlow(
  {
    name: 'marketPriceTrendAnalysisFlow',
    inputSchema: MarketPriceTrendAnalysisInputSchema,
    outputSchema: MarketPriceTrendAnalysisOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (!output) throw new Error('Model returned no output.');
      return output;
    } catch (e: any) {
      console.warn("AI Analysis rate-limited or unavailable. Triggering Heuristic Fallback Engine.", e.message);
      
      // --- Heuristic Fallback Engine ---
      const prices = input.marketPriceData.map(d => d.price);
      if (prices.length < 2) {
        return {
          cropType: input.cropType,
          state: input.state,
          predictedTrend: 'Stable',
          recommendedAction: 'Wait',
          reasoning: "Insufficient data points for trend analysis."
        };
      }

      const first = prices[0];
      const last = prices[prices.length - 1];
      const diffPercent = ((last - first) / first) * 100;

      let predictedTrend: 'Rising' | 'Stable' | 'Falling' = 'Stable';
      let recommendedAction: 'Sell' | 'Hold' | 'Wait' = 'Wait';
      let reasoning = "Grid Heuristics Active: ";

      if (diffPercent > 2) {
        predictedTrend = 'Rising';
        recommendedAction = 'Hold';
        reasoning += `Prices have increased by ${diffPercent.toFixed(1)}% over 7 days. Upward momentum detected. Recommendation: HOLD for peak profit.`;
      } else if (diffPercent < -2) {
        predictedTrend = 'Falling';
        recommendedAction = 'Sell';
        reasoning += `Prices have dropped by ${Math.abs(diffPercent).toFixed(1)}% this week. Downward trend detected. Recommendation: SELL immediately to minimize loss.`;
      } else {
        predictedTrend = 'Stable';
        recommendedAction = 'Wait';
        reasoning += "Price volatility is within +/- 2%. The market is currently stable. Recommendation: WAIT for a clearer price signal.";
      }

      return {
        cropType: input.cropType,
        state: input.state,
        predictedTrend,
        recommendedAction,
        reasoning
      };
    }
  }
);
