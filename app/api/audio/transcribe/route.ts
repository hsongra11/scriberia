import { NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/audio/transcribe';

export async function POST(request: Request) {
  try {
    // Get the audio blob from the request
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Convert File to Blob
    const audioBlob = new Blob([await audioFile.arrayBuffer()], { 
      type: audioFile.type 
    });

    // Transcribe the audio
    const { text, error } = await transcribeAudio(audioBlob);

    if (error) {
      return NextResponse.json(
        { error },
        { status: 500 }
      );
    }

    // Return the transcription
    return NextResponse.json({ 
      transcription: text 
    });
  } catch (error) {
    console.error('Error in transcribe route:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
} 