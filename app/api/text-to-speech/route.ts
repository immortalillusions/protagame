import { NextRequest, NextResponse } from 'next/server';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import JournalService from '@/lib/journal-service';

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text, date } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json(
        { success: false, error: 'No text provided' },
        { status: 400 }
      );
    }

    if (!process.env.ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY === 'sk_your_actual_elevenlabs_api_key_here') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ElevenLabs API key not configured. Please add your API key to .env.local' 
        },
        { status: 500 }
      );
    }

    // Generate speech using ElevenLabs
    const audio = await elevenlabs.textToSpeech.convert('56AoDkrOh6qfVPDXZ7Pt', {
      text: text.trim(),
      modelId: 'eleven_multilingual_v2',
      outputFormat: 'mp3_44100_128',
    });

    // Convert the ReadableStream to a buffer
    const reader = audio.getReader();
    const chunks: Uint8Array[] = [];
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    // Combine all chunks into a single buffer
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const audioBuffer = new Uint8Array(totalLength);
    let offset = 0;
    
    for (const chunk of chunks) {
      audioBuffer.set(chunk, offset);
      offset += chunk.length;
    }

    // Save audio to MongoDB if date is provided
    if (date) {
      try {
        // Convert audio buffer to base64 for storage
        const audioBase64 = Buffer.from(audioBuffer).toString('base64');
        const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;
        
        // Get existing journal entry
        const existingEntry = await JournalService.getEntryByDate(date);
        
        if (existingEntry) {
          // Update entry with audio data
          await JournalService.saveEntry({
            ...existingEntry,
            audioUrl: audioUrl,
            audioFormat: 'mp3',
            audioGenerated: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (saveError) {
        console.error('Failed to save audio to database:', saveError);
        // Continue to return audio even if save fails
      }
    }

    // Return the audio as a response with proper headers
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('Text-to-speech generation failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
}
