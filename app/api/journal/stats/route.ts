import { NextResponse } from 'next/server';
import JsonJournalService from '@/lib/json-journal-service';

export async function GET() {
  try {
    const stats = await JsonJournalService.getStats();

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Journal stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journal statistics' },
      { status: 500 }
    );
  }
}
