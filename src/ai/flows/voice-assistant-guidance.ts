'use server';
/**
 * @fileOverview A conversational AI voice assistant for farmers.
 *
 * - voiceAssistantGuidance - A function that handles the voice assistant's response generation.
 * - VoiceAssistantGuidanceInput - The input type for the voiceAssistantGuidance function.
 * - VoiceAssistantGuidanceOutput - The return type for the voiceAssistantGuidance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const VoiceAssistantGuidanceInputSchema = z.object({
  query: z.string().describe("The farmer's spoken question in their preferred language."),
});
export type VoiceAssistantGuidanceInput = z.infer<typeof VoiceAssistantGuidanceInputSchema>;

const VoiceAssistantGuidanceOutputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The audio response from the AI assistant as a data URI that must include a MIME type (audio/wav) and use Base64 encoding. Expected format: 'data:audio/wav;base64,<encoded_audio_data>'."
    ),
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
    // First, generate a text response from the LLM
    const {output: textResponse} = await ai.generate({
      prompt: `You are an AI assistant helping farmers with questions related to farming practices, market trends, or pest management.
Provide a concise and helpful answer to the following question, suitable for verbal delivery.

Question: ${input.query}`,
      model: 'googleai/gemini-2.5-flash',
    });

    if (!textResponse) {
      throw new Error('No text response generated.');
    }

    // Second, convert the text response to speech using TTS
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
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

    if (!media) {
      throw new Error('No audio media returned.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const wavAudioBase64 = await toWav(audioBuffer);

    return {
      audioDataUri: 'data:audio/wav;base64,' + wavAudioBase64,
    };
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
