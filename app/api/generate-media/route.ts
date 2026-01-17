import { NextRequest, NextResponse } from 'next/server';
import { AIMediaPipeline } from '@/lib/ai-pipeline';

export async function POST(request: NextRequest) {
  try {
    const { journalEntry, date } = await request.json();

    if (!journalEntry || !journalEntry.trim()) {
      return NextResponse.json(
        { error: 'Journal entry is required' }, 
        { status: 400 }
      );
    }

    console.log(`Processing journal entry for ${date || 'unknown date'}`);

    // Run the AI pipeline
    const result = await AIMediaPipeline.processJournalEntry(journalEntry);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Media generation failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      visualPrompt: result.visualPrompt,
      mediaUrl: result.mediaUrl,
      message: result.mediaUrl 
        ? 'Visual prompt and image generated successfully' 
        : 'Visual prompt generated successfully (image generation may have failed)'
    });

  } catch (error) {
    console.error('Media generation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
