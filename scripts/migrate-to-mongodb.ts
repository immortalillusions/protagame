import fs from 'fs/promises';
import path from 'path';
import JournalService from '../lib/journal-service';

// Migration script to move JSON files to MongoDB
async function migrateJournalData() {
  const JOURNAL_DIR = path.join(process.cwd(), 'data', 'journal');
  
  try {
    console.log('🚀 Starting journal data migration to MongoDB...');
    
    // Check if journal directory exists
    try {
      await fs.access(JOURNAL_DIR);
    } catch {
      console.log('❌ No journal data directory found at:', JOURNAL_DIR);
      return;
    }

    // Read all JSON files
    const files = await fs.readdir(JOURNAL_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    console.log(`📁 Found ${jsonFiles.length} journal files to migrate`);
    
    let migratedCount = 0;
    let errorCount = 0;

    for (const filename of jsonFiles) {
      try {
        const filepath = path.join(JOURNAL_DIR, filename);
        const content = await fs.readFile(filepath, 'utf-8');
        const journalData = JSON.parse(content);
        
        // Transform old format to new format if needed
        const entryData = {
          date: journalData.date,
          content: journalData.content,
          visualPrompt: journalData.visualPrompt,
          mediaUrl: journalData.mediaUrl
        };

        // Save to MongoDB
        await JournalService.saveEntry(entryData);
        console.log(`✅ Migrated: ${filename}`);
        migratedCount++;
        
      } catch (error) {
        console.error(`❌ Error migrating ${filename}:`, error);
        errorCount++;
      }
    }

    console.log(`\n🎉 Migration completed!`);
    console.log(`✅ Successfully migrated: ${migratedCount} entries`);
    console.log(`❌ Errors: ${errorCount} entries`);
    
    if (errorCount === 0 && migratedCount > 0) {
      console.log(`\n📂 You can now safely delete the old data/journal directory.`);
      console.log(`💡 Or keep it as a backup - the app now uses MongoDB!`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateJournalData()
    .then(() => {
      console.log('Migration process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration process failed:', error);
      process.exit(1);
    });
}

export default migrateJournalData;
