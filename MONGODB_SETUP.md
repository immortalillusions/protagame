# MongoDB Migration Guide

## Overview
Your ProtagaMe app has been updated to use MongoDB instead of JSON files for storing journal entries. This provides better performance, scalability, and additional features like search and statistics.

## What Changed

### 1. **New MongoDB Service** (`lib/journal-service.ts`)
- Handles all database operations
- Provides methods for CRUD operations, search, and statistics
- Uses proper TypeScript interfaces

### 2. **Updated API Routes**
- `/api/journal` - Create/read individual entries (updated to use MongoDB)
- `/api/journal/list` - List all entries, search, date ranges (NEW)
- `/api/journal/stats` - Get database statistics (NEW)
- `/api/generate-media` - Now saves generated media to MongoDB automatically
- `/api/migrate` - Trigger data migration from JSON files (NEW)

### 3. **New Features Available**
- **Search**: Find entries by content
- **Date Range Queries**: Get entries between dates
- **Statistics**: Total entries, entries with media, date ranges
- **Better Performance**: Database indexing and optimized queries

## Setup Instructions

### 1. **Environment Variables**
Make sure you have your MongoDB connection string in your `.env.local`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/protagame?retryWrites=true&w=majority
```

### 2. **Run Migration**
To migrate your existing JSON files to MongoDB:

**Option A: API Endpoint (Recommended)**
```bash
# Start your dev server
npm run dev

# Call the migration endpoint
curl -X POST http://localhost:3000/api/migrate
```

**Option B: Script**
```bash
npm run migrate
```

### 3. **Verify Migration**
Check your MongoDB database - you should see a `journal_entries` collection with your data.

## New API Endpoints

### List All Entries
```javascript
GET /api/journal/list
```

### Search Entries
```javascript
GET /api/journal/list?search=birthday
```

### Get Entries in Date Range
```javascript
GET /api/journal/list?start=2026-01-01&end=2026-01-31
```

### Get Statistics
```javascript
GET /api/journal/stats
```

### Delete Entry
```javascript
DELETE /api/journal/list?date=2026-01-16
```

## Benefits

1. **Better Performance** - Database queries are faster than file system operations
2. **Search Capability** - Find entries by content
3. **Data Integrity** - MongoDB ensures data consistency
4. **Scalability** - Handles large amounts of data efficiently  
5. **Backup & Replication** - MongoDB provides built-in backup solutions
6. **Analytics** - Easy to generate statistics and insights

## Data Structure

Each journal entry is now stored as:
```typescript
interface JournalEntry {
  _id: ObjectId;           // MongoDB unique ID
  date: string;            // YYYY-MM-DD format
  content: string;         // Journal entry text
  visualPrompt?: {         // AI-generated visual description
    visualPrompt: string;
    mood: string;
    colorPalette: string;
    cinematicStyle: string;
    duration: string;
  };
  mediaUrl?: string;       // Generated image URL
  createdAt: Date;         // When entry was created
  updatedAt: Date;         // When entry was last modified
}
```

## Troubleshooting

### Connection Issues
- Verify your `MONGODB_URI` is correct
- Check if your IP is whitelisted in MongoDB Atlas
- Ensure your MongoDB cluster is running

### Migration Issues
- Check that the `data/journal` directory exists
- Verify JSON files are properly formatted
- Look at console logs for specific error messages

### Performance
- MongoDB automatically creates indexes for better performance
- Consider adding custom indexes if you have large datasets

## Next Steps

After successful migration:
1. Test the app to ensure everything works
2. You can safely delete the old `data/journal` directory (or keep as backup)
3. Explore the new search and statistics features
4. Consider setting up automated backups in MongoDB Atlas
