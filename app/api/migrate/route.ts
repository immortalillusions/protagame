import { NextResponse } from 'next/server';
import migrateJournalData from '@/scripts/migrate-to-mongodb';

export async function POST() {
  try {
    console.log('🚀 Starting migration via API endpoint...');
    await migrateJournalData();
    
    return NextResponse.json({
      success: true,
      message: 'Journal data migration completed successfully'
    });

  } catch (error) {
    console.error('Migration API error:', error);
    return NextResponse.json(
      { error: 'Migration failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
