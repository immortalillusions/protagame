import { NextRequest, NextResponse } from 'next/server';
import JsonJournalService from '@/lib/json-journal-service';

export async function POST(request: NextRequest) {
  try {
    const { date, content, visualPrompt, mediaUrl } = await request.json();

    if (!date || !content) {
      return NextResponse.json(
        { error: 'Date and content are required' }, 
        { status: 400 }
      );
    }

    const entry = await JsonJournalService.saveEntry({
      date,
      content,
      visualPrompt,
      mediaUrl
    });

    return NextResponse.json({
      success: true,
      message: 'Journal entry saved successfully',
      entry
    });

  } catch (error) {
    console.error('Journal save error:', error);
    return NextResponse.json(
      { error: 'Failed to save journal entry' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' }, 
        { status: 400 }
      );
    }

    const entry = await JsonJournalService.getEntryByDate(date);
    
    return NextResponse.json({
      success: true,
      entry
    });

  } catch (error) {
    console.error('Journal fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journal entry' },
      { status: 500 }
    );
  }
}
