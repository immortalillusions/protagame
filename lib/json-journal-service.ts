import fs from 'fs';
import path from 'path';

export interface VisualPrompt {
  visualPrompt: string;
  mood: string;
  colorPalette: string;
  cinematicStyle: string;
  duration: string;
}

export interface JournalEntry {
  date: string;
  content: string;
  visualPrompt?: VisualPrompt;
  mediaUrl?: string;
  createdAt: string;
  updatedAt: string;
}

class JsonJournalService {
  private static readonly DATA_DIR = path.join(process.cwd(), 'data', 'journal');

  private static ensureDataDir() {
    if (!fs.existsSync(this.DATA_DIR)) {
      fs.mkdirSync(this.DATA_DIR, { recursive: true });
    }
  }

  private static getFilePath(date: string): string {
    return path.join(this.DATA_DIR, `${date}.json`);
  }

  // Create or update a journal entry
  static async saveEntry(entryData: Omit<JournalEntry, 'createdAt' | 'updatedAt'>): Promise<JournalEntry> {
    this.ensureDataDir();
    
    const filePath = this.getFilePath(entryData.date);
    const now = new Date().toISOString();
    
    let entry: JournalEntry;
    
    // Check if file already exists
    if (fs.existsSync(filePath)) {
      // Update existing entry, preserve createdAt
      const existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      entry = {
        ...existingData,
        ...entryData,
        updatedAt: now
      };
    } else {
      // Create new entry
      entry = {
        ...entryData,
        createdAt: now,
        updatedAt: now
      };
    }
    
    fs.writeFileSync(filePath, JSON.stringify(entry, null, 2));
    return entry;
  }

  // Get journal entry by date
  static async getEntryByDate(date: string): Promise<JournalEntry | null> {
    try {
      const filePath = this.getFilePath(date);
      
      if (!fs.existsSync(filePath)) {
        return null;
      }
      
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Failed to read entry for date ${date}:`, error);
      return null;
    }
  }

  // Get all journal entries (sorted by date descending)
  static async getAllEntries(): Promise<JournalEntry[]> {
    try {
      this.ensureDataDir();
      
      const files = fs.readdirSync(this.DATA_DIR)
        .filter(file => file.endsWith('.json'))
        .sort((a, b) => b.localeCompare(a)); // Sort descending
      
      const entries: JournalEntry[] = [];
      
      for (const file of files) {
        try {
          const filePath = path.join(this.DATA_DIR, file);
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          entries.push(data);
        } catch (error) {
          console.error(`Failed to read file ${file}:`, error);
        }
      }
      
      return entries;
    } catch (error) {
      console.error('Failed to get all entries:', error);
      return [];
    }
  }

  // Get entries within a date range
  static async getEntriesInRange(startDate: string, endDate: string): Promise<JournalEntry[]> {
    const allEntries = await this.getAllEntries();
    return allEntries.filter(entry => 
      entry.date >= startDate && entry.date <= endDate
    );
  }

  // Delete an entry by date
  static async deleteEntry(date: string): Promise<boolean> {
    try {
      const filePath = this.getFilePath(date);
      
      if (!fs.existsSync(filePath)) {
        return false;
      }
      
      fs.unlinkSync(filePath);
      return true;
    } catch (error) {
      console.error(`Failed to delete entry for date ${date}:`, error);
      return false;
    }
  }

  // Update visual prompt and media URL after AI generation
  static async updateGeneratedMedia(date: string, visualPrompt: VisualPrompt, mediaUrl?: string): Promise<JournalEntry | null> {
    try {
      console.log(`Attempting to update journal entry for date: ${date}`);
      console.log('Visual prompt data:', JSON.stringify(visualPrompt, null, 2));
      console.log('Media URL:', mediaUrl || 'null/undefined');
      
      const existingEntry = await this.getEntryByDate(date);
      
      if (!existingEntry) {
        console.error(`No journal entry found for date: ${date}`);
        return null;
      }
      
      const updatedEntry: JournalEntry = {
        ...existingEntry,
        visualPrompt,
        updatedAt: new Date().toISOString()
      };
      
      if (mediaUrl) {
        updatedEntry.mediaUrl = mediaUrl;
      }
      
      console.log('Update data:', JSON.stringify(updatedEntry, null, 2));
      
      const savedEntry = await this.saveEntry(updatedEntry);
      
      console.log(`Successfully updated journal entry for ${date}`);
      console.log('Updated entry:', JSON.stringify(savedEntry, null, 2));
      
      return savedEntry;
    } catch (error) {
      console.error(`Error updating generated media for date ${date}:`, error);
      throw error;
    }
  }

  // Search entries by content (basic text search)
  static async searchEntries(searchTerm: string): Promise<JournalEntry[]> {
    const allEntries = await this.getAllEntries();
    const searchLower = searchTerm.toLowerCase();
    
    return allEntries.filter(entry => {
      const contentMatch = entry.content.toLowerCase().includes(searchLower);
      const visualPromptMatch = entry.visualPrompt?.visualPrompt.toLowerCase().includes(searchLower);
      return contentMatch || visualPromptMatch;
    });
  }

  // Get statistics
  static async getStats(): Promise<{
    totalEntries: number;
    entriesWithMedia: number;
    dateRange: { oldest: string; newest: string } | null;
  }> {
    const allEntries = await this.getAllEntries();
    
    if (allEntries.length === 0) {
      return {
        totalEntries: 0,
        entriesWithMedia: 0,
        dateRange: null
      };
    }
    
    const entriesWithMedia = allEntries.filter(entry => entry.mediaUrl && entry.mediaUrl.trim() !== '').length;
    const dates = allEntries.map(entry => entry.date).sort();
    
    return {
      totalEntries: allEntries.length,
      entriesWithMedia,
      dateRange: {
        oldest: dates[0],
        newest: dates[dates.length - 1]
      }
    };
  }
}

export default JsonJournalService;
