import client from './mongodb';
import { ObjectId } from 'mongodb';

export interface VisualPrompt {
  visualPrompt: string;
  mood: string;
  colorPalette: string;
  cinematicStyle: string;
  duration: string;
}

export interface JournalEntry {
  _id?: ObjectId;
  date: string;
  content: string;
  story?: string;
  visualPrompt?: VisualPrompt;
  mediaUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

class JournalService {
  private static readonly COLLECTION_NAME = 'journal_entries';

  private static async getCollection() {
    // The client will automatically connect when needed
    // No need to explicitly call connect() each time
    return client.db('protagame').collection<JournalEntry>(this.COLLECTION_NAME);
  }

  // Create or update a journal entry
  static async saveEntry(entryData: Omit<JournalEntry, '_id' | 'createdAt' | 'updatedAt'>): Promise<JournalEntry> {
    const collection = await this.getCollection();
    
    const now = new Date();
    
    // Check if entry already exists for this date
    const existingEntry = await collection.findOne({ date: entryData.date });
    
    if (existingEntry) {
      // Update existing entry, preserve createdAt
      const updatedEntry: JournalEntry = {
        ...existingEntry,
        ...entryData,
        updatedAt: now
      };
      
      await collection.updateOne(
        { date: entryData.date },
        { $set: updatedEntry }
      );
      
      return updatedEntry;
    } else {
      // Create new entry
      const newEntry: JournalEntry = {
        ...entryData,
        createdAt: now,
        updatedAt: now
      };
      
      const result = await collection.insertOne(newEntry);
      return { ...newEntry, _id: result.insertedId };
    }
  }

  // Get journal entry by date
  static async getEntryByDate(date: string): Promise<JournalEntry | null> {
    const collection = await this.getCollection();
    return await collection.findOne({ date });
  }

  // Get all journal entries (sorted by date descending)
  static async getAllEntries(): Promise<JournalEntry[]> {
    const collection = await this.getCollection();
    return await collection
      .find({})
      .sort({ date: -1 })
      .toArray();
  }

  // Get all entries formatted for story generation (sorted chronologically)
  static async getAllEntriesForStory(): Promise<string> {
    const collection = await this.getCollection();
    const entries = await collection
      .find({ date: { $ne: "journey-story" } }) // Exclude journey story entries
      .sort({ date: 1 }) // Sort chronologically for story
      .toArray();
    
    return entries
      .map(entry => {
        const date = new Date(entry.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        return `**${date}**\n${entry.content}\n`;
      })
      .join('\n');
  }

  // Get entries within a date range
  static async getEntriesInRange(startDate: string, endDate: string): Promise<JournalEntry[]> {
    const collection = await this.getCollection();
    return await collection
      .find({
        date: {
          $gte: startDate,
          $lte: endDate
        }
      })
      .sort({ date: -1 })
      .toArray();
  }

  // Delete an entry by date
  static async deleteEntry(date: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ date });
    return result.deletedCount > 0;
  }

  // Update visual prompt and media URL after AI generation
  static async updateGeneratedMedia(date: string, visualPrompt: VisualPrompt, mediaUrl?: string): Promise<JournalEntry | null> {
    try {
      const collection = await this.getCollection();
      
      console.log(`Attempting to update journal entry for date: ${date}`);
      console.log('Visual prompt data:', JSON.stringify(visualPrompt, null, 2));
      console.log('Media URL:', mediaUrl || 'null/undefined');
      
      const updateData: Partial<JournalEntry> = {
        visualPrompt,
        updatedAt: new Date()
      };
      
      if (mediaUrl) {
        updateData.mediaUrl = mediaUrl;
      }
      
      console.log('Update data:', JSON.stringify(updateData, null, 2));
      
      const result = await collection.findOneAndUpdate(
        { date },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      
      if (result) {
        console.log(`Successfully updated journal entry for ${date}`);
        console.log('Updated entry:', JSON.stringify(result, null, 2));
      } else {
        console.error(`No journal entry found for date: ${date}`);
      }
      
      return result || null;
    } catch (error) {
      console.error(`Error updating generated media for date ${date}:`, error);
      throw error;
    }
  }

  // Search entries by content (basic text search)
  static async searchEntries(searchTerm: string): Promise<JournalEntry[]> {
    const collection = await this.getCollection();
    return await collection
      .find({
        $or: [
          { content: { $regex: searchTerm, $options: 'i' } },
          { 'visualPrompt.visualPrompt': { $regex: searchTerm, $options: 'i' } }
        ]
      })
      .sort({ date: -1 })
      .toArray();
  }

  // Get statistics
  static async getStats(): Promise<{
    totalEntries: number;
    entriesWithMedia: number;
    dateRange: { oldest: string; newest: string } | null;
  }> {
    const collection = await this.getCollection();
    
    const [totalEntries, entriesWithMedia, dateRange] = await Promise.all([
      collection.countDocuments({}),
      collection.countDocuments({ mediaUrl: { $exists: true, $ne: "" } }),
      collection
        .find({}, { projection: { date: 1 } })
        .sort({ date: 1 })
        .limit(1)
        .toArray()
        .then(async (oldest: JournalEntry[]) => {
          if (oldest.length === 0) return null;
          const newest = await collection
            .find({}, { projection: { date: 1 } })
            .sort({ date: -1 })
            .limit(1)
            .toArray();
          return {
            oldest: oldest[0].date,
            newest: newest[0].date
          };
        })
    ]);

    return {
      totalEntries,
      entriesWithMedia,
      dateRange
    };
  }
}

export default JournalService;
