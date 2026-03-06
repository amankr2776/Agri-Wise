'use server';
/**
 * @fileOverview A universal multimodal AI assistant for farmers.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const VoiceAssistantGuidanceInputSchema = z.object({
  query: z.string().describe("The user's question or prompt."),
  language: z.string().describe("The preferred language of the user."),
  photoDataUri: z.string().optional().describe("Optional image data URI."),
});
export type VoiceAssistantGuidanceInput = z.infer<typeof VoiceAssistantGuidanceInputSchema>;

const VoiceAssistantGuidanceOutputSchema = z.object({
  text: z.string().describe("The text AI response."),
  audioDataUri: z.string().optional().describe("The audio response data URI."),
});
export type VoiceAssistantGuidanceOutput = z.infer<typeof VoiceAssistantGuidanceOutputSchema>;

export async function voiceAssistantGuidance(
  input: VoiceAssistantGuidanceInput
): Promise<VoiceAssistantGuidanceOutput> {
  return voiceAssistantGuidanceFlow(input);
}

const voiceAssistantGuidanceFlow = ai.defineFlow(
  {
    name: 'voiceAssistantGuidanceFlow',
    inputSchema: VoiceAssistantGuidanceInputSchema,
    outputSchema: VoiceAssistantGuidanceOutputSchema,
  },
  async input => {
    let textResponse = "";
    
    try {
      const {text} = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        prompt: [
          { text: `You are KisanMitra Assistant. Respond in ${input.language} script.
          USER REQUEST: ${input.query}
          If an image is provided, analyze it.` },
          ...(input.photoDataUri ? [{ media: { url: input.photoDataUri, contentType: 'image/jpeg' } }] : []),
        ],
      });
      textResponse = text || "I am processing your request.";
    } catch (e: any) {
      textResponse = input.language === 'Hindi' ? "नमस्ते! मैं आपकी सहायता के लिए तैयार हूँ।" : "Namaste! I am ready to help you with your agricultural needs.";
    }

    try {
      const {media} = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {voiceName: 'Algenib'},
            },
          },
        },
        prompt: textResponse,
      });

      if (!media) return { text: textResponse };

      const audioBuffer = Buffer.from(
        media.url.substring(media.url.indexOf(',') + 1),
        'base64'
      );

      const wavAudioBase64 = await toWav(audioBuffer);

      return {
        text: textResponse,
        audioDataUri: 'data:audio/wav;base64,' + wavAudioBase64,
      };
    } catch (e: any) {
      return { text: textResponse };
    }
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
