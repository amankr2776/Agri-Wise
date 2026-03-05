'use server';
/**
 * @fileOverview A universal multimodal AI assistant for farmers with regional language support.
 * Handles text and image inputs, providing text and audio responses.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const VoiceAssistantGuidanceInputSchema = z.object({
  query: z.string().describe("The user's question or prompt."),
  language: z.string().describe("The preferred language of the user."),
  photoDataUri: z.string().optional().describe("Optional image data URI for multimodal analysis."),
});
export type VoiceAssistantGuidanceInput = z.infer<typeof VoiceAssistantGuidanceInputSchema>;

const VoiceAssistantGuidanceOutputSchema = z.object({
  text: z.string().describe("The text version of the AI response in the target language."),
  audioDataUri: z
    .string()
    .describe(
      "The audio response from the AI assistant as a data URI that must include a MIME type (audio/wav) and use Base64 encoding."
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
    // Generate a response in the target language using multimodal Gemini 2.5 Flash
    const {text: textResponse} = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: [
        { text: `You are KisanMitra, a friendly and helpful AI assistant for the Indian National Agricultural Grid. 
        You can answer questions about farming, logistics, crop health, or any general topics the user asks about.
        If an image is provided, analyze it thoroughly and provide context in your response.
        
        USER REQUEST: ${input.query}
        LANGUAGE: ${input.language}
        
        CRITICAL: YOU MUST RESPOND ENTIRELY IN THE ${input.language} SCRIPT. Provide a helpful, empathetic, and clear answer.` },
        ...(input.photoDataUri ? [{ media: { url: input.photoDataUri, contentType: 'image/jpeg' } }] : []),
      ],
    });

    if (!textResponse) {
      throw new Error('No text response generated.');
    }

    // Convert to speech using the TTS model
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
      text: textResponse,
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
