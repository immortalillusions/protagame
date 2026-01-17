import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Simple file-based storage for hackathon
const JOURNAL_DIR = path.join(process.cwd(), 'data', 'journal');

interface JournalEntry {
  date: string;
  content: string;
  visualPrompt?: {
    visualPrompt: string;
    mood: string;
    colorPalette: string;
    cinematicStyle: string;
    duration: string;
  };
  mediaUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Ensure journal directory exists
async function ensureJournalDir() {
  try {
    await fs.access(JOURNAL_DIR);
  } catch {
    await fs.mkdir(JOURNAL_DIR, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { date, content, visualPrompt, mediaUrl } = await request.json();

    if (!date || !content) {
      return NextResponse.json(
        { error: 'Date and content are required' }, 
        { status: 400 }
      );
    }

    await ensureJournalDir();

    const entry: JournalEntry = {
      date,
      content,
      visualPrompt,
      mediaUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const filename = `${date}.json`;
    const filepath = path.join(JOURNAL_DIR, filename);

    // Check if entry exists to preserve createdAt
    try {
      const existing = await fs.readFile(filepath, 'utf-8');
      const existingEntry: JournalEntry = JSON.parse(existing);
      entry.createdAt = existingEntry.createdAt;
    } catch {
      // File doesn't exist, keep new createdAt
    }

    await fs.writeFile(filepath, JSON.stringify(entry, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Journal entry saved successfully'
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

    await ensureJournalDir();

    const filename = `${date}.json`;
    const filepath = path.join(JOURNAL_DIR, filename);

    try {
      const data = await fs.readFile(filepath, 'utf-8');
      const entry: JournalEntry = JSON.parse(data);
      
      return NextResponse.json({
        success: true,
        entry
      });
    } catch {
      // Entry doesn't exist
      return NextResponse.json({
        success: true,
        entry: null
      });
    }

  } catch (error) {
    console.error('Journal fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journal entry' },
      { status: 500 }
    );
  }
}
