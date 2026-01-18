import { NextRequest, NextResponse } from 'next/server';
import JournalService from '@/lib/journal-service';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const startDate = url.searchParams.get('start');
    const endDate = url.searchParams.get('end');
    const search = url.searchParams.get('search');

    let entries;

    if (search) {
      // Search entries by content
      entries = await JournalService.searchEntries(search);
    } else if (startDate && endDate) {
      // Get entries in date range
      entries = await JournalService.getEntriesInRange(startDate, endDate);
    } else {
      // Get all entries
      entries = await JournalService.getAllEntries();
    }

    return NextResponse.json({
      success: true,
      entries,
      count: entries.length
    });

  } catch (error) {
    console.error('Journal list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journal entries' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove entries
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' }, 
        { status: 400 }
      );
    }

    const deleted = await JournalService.deleteEntry(date);

    if (deleted) {
      return NextResponse.json({
        success: true,
        message: 'Journal entry deleted successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'Journal entry not found' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Journal delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete journal entry' },
      { status: 500 }
    );
  }
}
