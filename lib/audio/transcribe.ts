import { createClient } from '@deepgram/sdk';

// Check if the DEEPGRAM_API_KEY is defined
if (!process.env.DEEPGRAM_API_KEY) {
  console.warn('DEEPGRAM_API_KEY is not defined. Audio transcription will not work.');
}

/**
 * Transcribe an audio blob using Deepgram
 * @param audioBlob The audio blob to transcribe
 * @returns The transcription result
 */
export async function transcribeAudio(audioBlob: Blob): Promise<{ text: string; error?: string }> {
  try {
    if (!process.env.DEEPGRAM_API_KEY) {
      throw new Error('Deepgram API key is not defined');
    }

    // Create a Deepgram instance
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

    // Convert the blob to an ArrayBuffer
    const arrayBuffer = await audioBlob.arrayBuffer();
    
    // Send the audio to Deepgram for transcription
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      Buffer.from(arrayBuffer),
      {
        model: 'nova-3', // Use Nova 3 model for better quality
        language: 'en-US',
        punctuate: true,
        smart_format: true,
      }
    );

    if (error) {
      throw new Error(error.message);
    }

    // Extract the transcription text
    const transcript = result?.results?.channels[0]?.alternatives[0]?.transcript || '';
    
    return {
      text: transcript,
    };
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return {
      text: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
} 